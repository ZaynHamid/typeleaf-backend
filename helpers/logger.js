import winston from "winston";

const { combine, timestamp, printf } = winston.format;

const customFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});

export const logger = winston.createLogger({
    level: "info",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        customFormat,
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ 
            filename: "logs/error.log", 
            level: "error",
            format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), customFormat) // no colorize for files
        }),
        new winston.transports.File({ 
            filename: "logs/combined.log",
            format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), customFormat)
        })
    ]
});

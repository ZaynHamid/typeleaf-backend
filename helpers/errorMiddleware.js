import { logger } from "./logger.js";

const errorHandler = (err, req, res, next) => {
    logger.error(`${err.message}`, { stack: err.stack, status: err.statusCode });

    const status = err.statusCode || 500;
    const message = status === 500 ? "Internal Server Error" : err.message;

    return res.status(status).json({
        success: false,
        message
    })
}

export default errorHandler;
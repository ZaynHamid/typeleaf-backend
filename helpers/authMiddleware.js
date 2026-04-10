import jwt from "jsonwebtoken";
import { config } from "dotenv";
import AppError from "./error.js";

config();

export const authMiddleware = (req, res, next) => {
    const authHeader = req.header("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError("No token provided", 400));
    }

    try {
        const token = authHeader.split(" ")[1];
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next();
    } catch (e) {
        next(new AppError("Invalid or expired token", 401))
    }
}
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "./vars";

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        username: string;
        firstName?: string;
        lastName?: string;
    };
}

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ message: "No token provided" });
        return;
    }

    // Split the 'Authorization' header to get the token
    const parts = authHeader.split(' ');

    // Check if the Authorization header is correctly formatted
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        res.status(401).json({ message: "Invalid authorization header format" });
        return;
    }

    const token = parts[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(403).json({ message: "Failed to authenticate token" });
            return;
        }

        // Ensure 'decoded' has the correct type
        const authRequest = req as AuthRequest;
        authRequest.user = decoded as AuthRequest['user'];
        next();
    });
};
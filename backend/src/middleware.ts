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
    const token = req.headers.authorization;
    if (!token) {
        res.sendStatus(401);
        return;
    }

    const authRequest = req as AuthRequest;
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            res.sendStatus(403);
            return;
        }
        authRequest.user = user as AuthRequest['user'];
        next();
    });
}

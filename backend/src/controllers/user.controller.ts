import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../vars";

import { User } from "../models/user.model";

export const register = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const user = await User.create(req.body);
    return res.status(201).json(user.toJSON());
};

export const signIn = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const { email, username, password } = req.body;
    if ((!email && !username) || !password) return res.sendStatus(400);

    const user = await User.findOne({
        where: {
            ...(email && { email }),
            ...(username && { username }),
        },
    });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.getDataValue("password"));
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(user.toJSON(), JWT_SECRET, {
        expiresIn: "96h",
    });

    return res.status(200).json({ token });
};

export const generateForgotCode = async (
    _req: Request,
    res: Response,
): Promise<Response> => {
    return res.status(200).json({ message: "Code generated" });
};

export const validateForgotCode = async (
    _req: Request,
    res: Response,
): Promise<Response> => {
    return res.status(200).json({ message: "Code validated" });
};

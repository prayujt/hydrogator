import { Request, Response } from "express";
import { User } from "../models/user.model";

export const register = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const user = await User.create(req.body);
    return res.status(201).json(user.toJSON());
};

export const signIn = async (
    _req: Request,
    res: Response,
): Promise<Response> => {
    return res.status(200).json({ message: "Signed in" });
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

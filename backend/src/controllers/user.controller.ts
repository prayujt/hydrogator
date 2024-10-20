import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";

import { JWT_SECRET, SENDGRID_API_KEY, EMAIL } from "../vars";
import { User } from "../models/user.model";
import { AuthRequest } from "../middleware";

sgMail.setApiKey(SENDGRID_API_KEY);

const codeStore: { [key: string]: string } = {};

const generateRandomCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmail = async (email: string, code: string) => {
    const msg = {
        to: email,
        from: EMAIL,
        subject: "Your Password Reset Code",
        text: `Your 6-digit code is: ${code}`,
    };

    await sgMail.send(msg);
};

export const register = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    try {
        const user = await User.create(req.body);
        return res.status(201).json(user.toJSON());
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ message: "Email already exists" });
        }
        return res
            .status(500)
            .json({ message: "Server error", error: error.message });
    }
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

    const userJson = user.toJSON();
    delete userJson.password;
    const token = jwt.sign(userJson, JWT_SECRET, {
        expiresIn: "96h",
    });

    return res.status(200).json({ token });
};

export const generateForgotCode = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const code = generateRandomCode();
    codeStore[email] = code;

    try {
        await sendEmail(email, code);
        return res.status(200).json({ message: "Code sent to email" });
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Failed to send email", error: error.message });
    }
};

export const validateForgotCode = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const { email, code } = req.body;
    if (!email || !code)
        return res.status(400).json({ message: "Email and code are required" });

    const storedCode = codeStore[email];
    if (!storedCode)
        return res
            .status(400)
            .json({ message: "No code found for this email" });

    if (storedCode === code) {
        return res.status(200).json({ message: "Code validated" });
    } else {
        return res.status(400).json({ message: "Invalid code" });
    }
};

export const resetPassword = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const { password, code } = req.body;
    if (!password || !code)
        return res
            .status(400)
            .json({ message: "Password and code are required" });

    const email = Object.keys(codeStore).find((key) => codeStore[key] === code);

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Email not found" });

    user.password = password;
    await user.save();
    delete codeStore[email];
    return res.status(200).json({ message: "Password updated" });
};

export const updateUser = async (
    req: AuthRequest,
    res: Response,
): Promise<Response> => {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { username, email, newPassword } = req.body;

    // Validate data
    if (!username || typeof username !== "string") {
        return res.status(400).json({ message: "Invalid username" });
    }
    if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Invalid email" });
    }
    if (!newPassword || typeof newPassword !== "string") {
        return res.status(400).json({ message: "Invalid password" });
    }

    user.username = username;
    user.email = email;
    user.password = newPassword;

    await user.save();
    return res.status(200).json(user.toJSON());
};

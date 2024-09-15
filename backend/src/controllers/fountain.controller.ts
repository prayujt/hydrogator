import { Request, Response } from "express";
import { Fountain } from "../models/fountain.model";

export const getFountains = async (req: Request, res: Response): Promise<void> => {
    const fountains = await Fountain.findAll();
    res.status(200).json({ fountains });
};

export const createFountain = async (req: Request, res: Response): Promise<void> => {
    const fountain = Fountain.build(req.body);
    res.status(201).json({ fountain });
};

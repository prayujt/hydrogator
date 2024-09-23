import { Request, Response } from "express";
import { Fountain } from "../models/fountain.model";

export const getFountains = async (
    _req: Request,
    res: Response,
): Promise<Response> => {
    const fountains = await Fountain.findAll();
    return res.status(200).json({ fountains });
};

export const createFountain = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const fountain = Fountain.build(req.body);
    return res.status(201).json({ fountain });
};

export const getFountain = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const fountain = await Fountain.findByPk(req.params.id);
    return res.status(200).json({ fountain });
};

export const updateFountain = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const fountain = await Fountain.findByPk(req.params.id);
    if (!fountain)
        return res.status(404).json({ message: "Fountain not found" });
    await fountain.update(req.body);
    return res.status(200).json({ fountain });
};

export const deleteFountain = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const fountain = await Fountain.findByPk(req.params.id);
    if (!fountain)
        return res.status(404).json({ message: "Fountain not found" });
    await fountain.destroy();
    return res.sendStatus(204);
};

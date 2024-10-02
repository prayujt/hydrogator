import { Request, Response } from "express";
import { Fountain } from "../models/fountain.model";

export const getFountains = async (
    _req: Request,
    res: Response,
): Promise<Response> => {
    const fountains = await Fountain.findAll();
    return res.status(200).json(fountains.map((fountain) => fountain.toJSON()));
};

export const createFountain = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const fountain = await Fountain.create(req.body);
    return res.status(201).json(fountain.toJSON());
};

export const getFountain = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const fountain = await Fountain.findByPk(req.params.id);
    return res.status(200).json(fountain.toJSON());
};

export const updateFountain = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const fountain = await Fountain.findByPk(req.params.id);
    if (!fountain)
        return res.status(404).json({ message: "Fountain not found" });
    await fountain.update(req.body);
    return res.status(200).json(fountain.toJSON());
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

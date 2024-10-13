import { Request, Response } from "express";
import { Fountain } from "../models/fountain.model";
import { Review } from "../models/review.model";

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
    const fountain = await Fountain.findByPk(req.params.fountainId, {
        include: [
            {
                model: Review,
                as: "reviews",
            },
        ],
    });
    return res.status(200).json(fountain.toJSON());
};

export const updateFountain = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const fountain = await Fountain.findByPk(req.params.fountainId);
    if (!fountain)
        return res.status(404).json({ message: "Fountain not found" });
    await fountain.update(req.body);
    return res.status(200).json(fountain.toJSON());
};

export const deleteFountain = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const fountain = await Fountain.findByPk(req.params.fountainId);
    if (!fountain)
        return res.status(404).json({ message: "Fountain not found" });
    await fountain.destroy();
    return res.sendStatus(204);
};


export const createFountainReview = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const fountainId = req.params.fountainId;

    const review = await Review.create({
        fountainId,
        ...req.body,
    });
    return res.status(201).json(review.toJSON());
};

import { Request, Response } from "express";

import { Building } from "../models/building.model";
import { Fountain } from "../models/fountain.model";
import { Review } from "../models/review.model";
import { Like } from "../models/like.model";

import { AuthRequest } from "../middleware";

import { sequelize } from "../database";

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
        attributes: {
            include: [[sequelize.col("building.name"), "buildingName"]],
        },
        include: [
            {
                model: Review,
                as: "reviews",
            },
            {
                model: Building,
                as: "building",
                attributes: [],
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
    req: AuthRequest,
    res: Response,
): Promise<Response> => {
    const fountainId = req.params.fountainId;

    const review = await Review.create({
        ...req.body,
        fountainId,
        userId: req.user.id,
    });
    return res.status(201).json(review.toJSON());
};

export const likeFountain = async (
    req: AuthRequest,
    res: Response,
): Promise<Response> => {
    const fountainId = req.params.fountainId;
    const userId = req.user.id;

    const like = await Like.findOne({
        where: { fountainId, userId },
    });

    if (like) await like.destroy();
    else await Like.create({ fountainId, userId });
    return res.status(200).json({ liked: !!like });
};

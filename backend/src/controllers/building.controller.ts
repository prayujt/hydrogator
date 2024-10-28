import { Request, Response } from "express";
import { Building } from "../models/building.model";
import { Fountain } from "../models/fountain.model";
import { Review } from "../models/review.model";
import { Like } from "../models/like.model";

export const getBuildings = async (
    _req: Request,
    res: Response,
): Promise<Response> => {
    const buildings = await Building.findAll({
        include: [
            {
                model: Fountain,
                as: "fountains",
                attributes: [],
            },
        ],
        attributes: {
            include: [
                [
                    Building.sequelize.fn(
                        "COUNT",
                        Building.sequelize.col("fountains.id"),
                    ),
                    "fountainCount",
                ],
            ],
        },
        group: ["Building.id"],
    });
    return res.status(200).json(buildings.map((building) => building.toJSON()));
};

export const createBuilding = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const building = await Building.create(req.body);
    return res.status(201).json(building.toJSON());
};

export const getBuildingFountains = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const fountains = await Fountain.findAll({
        where: { buildingId: req.params.buildingId },
        // include count of reviews and likes
        attributes: {
            include: [
                [
                    Fountain.sequelize.fn(
                        "COUNT",
                        Fountain.sequelize.col("reviews.id"),
                    ),
                    "reviewCount",
                ],
                [
                    Fountain.sequelize.fn(
                        "COUNT",
                        Fountain.sequelize.fn(
                            "DISTINCT",
                            Fountain.sequelize.col("likes.userId"),
                        ),
                    ),
                    "likeCount",
                ],
            ],
        },
        include: [
            {
                model: Review,
                as: "reviews",
                attributes: [],
            },
            {
                model: Like,
                as: "likes",
                attributes: [],
            },
        ],
        group: ["Fountain.id"],
    });
    return res.status(200).json(fountains.map((fountain) => fountain.toJSON()));
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

import { Request, Response } from "express";
import { Review } from "../models/review.model";

export const getFountainReviews = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const fountainId = req.params.id;

    const reviews = await Review.findAll({ where: { fountainId } });
    return res.status(200).json(reviews.map((review) => review.toJSON()));
};

export const createReview = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const fountainId = req.params.id;

    const review = await Review.create({
        fountainId,
        ...req.body,
    });
    return res.status(201).json(review.toJSON());
};

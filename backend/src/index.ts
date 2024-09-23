import { Fountain } from "./models/fountain.model";
import { Review } from "./models/review.model";
import { User } from "./models/user.model";

import {
    createFountain,
    getFountains,
} from "./controllers/fountain.controller";
import {
    createReview,
    getFountainReviews,
} from "./controllers/review.controller";

import express, { Express } from "express";
import * as dotenv from "dotenv";

const syncModels = async (): Promise<void> => {
    await Fountain.sync({ alter: true });
    await Review.sync({ alter: true });
    await User.sync({ alter: true });
};

dotenv.config();
syncModels();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/fountains", getFountains);
app.post("/fountains", createFountain);
app.put("/fountain/:id", createFountain);
app.delete("/fountains/:id", createFountain);

app.get("/fountains/:id/reviews", getFountainReviews);
app.post("/fountains/:id/reviews", createReview);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

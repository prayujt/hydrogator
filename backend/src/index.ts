import {
    createFountain,
    getFountains,
} from "./controllers/fountain.controller";

import { Fountain } from "./models/fountain.model";
import { Review } from "./models/review.model";
import { User } from "./models/user.model";

import express, { Express } from "express";
import * as dotenv from "dotenv";

const syncModels = async (): Promise<void> => {
    await Fountain.sync();
    await Review.sync();
    await User.sync();
};

dotenv.config();
syncModels();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/fountains", getFountains);
app.post("/fountain", createFountain);
app.put("/fountain/:id", createFountain);
app.delete("/fountain/:id", createFountain);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

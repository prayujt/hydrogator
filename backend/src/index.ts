import { Building } from "./models/building.model";
import { Fountain } from "./models/fountain.model";
import { Review } from "./models/review.model";
import { User } from "./models/user.model";

import {
    createFountain,
    deleteFountain,
    getFountain,
    updateFountain,
    createFountainReview,
} from "./controllers/fountain.controller";
import {
    register,
    signIn,
    generateForgotCode,
    resetPassword,
    validateForgotCode,
    updateUser,
} from "./controllers/user.controller";
import {
    getBuildings,
    createBuilding,
} from "./controllers/building.controller";

import { authMiddleware } from "./middleware";

import express, { Express } from "express";
import * as dotenv from "dotenv";
import cors from "cors";

const syncModels = async (): Promise<void> => {
    await Building.sync();
    await Fountain.sync();
    await User.sync();
    await Review.sync();
};

dotenv.config();
syncModels();

const app: Express = express();
const port = process.env.PORT || 3000;

const corsOptions = {
    origin: "http://localhost:8081",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());

// error handling middleware
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

app.post("/register", register);
app.post("/signIn", signIn);
app.post("/generateForgot", generateForgotCode);
app.post("/validateForgot", validateForgotCode);
app.post("/resetPassword", resetPassword);
app.put("/profile", authMiddleware, updateUser);

app.get("/fountain/:fountainId", getFountain);
app.post("/fountain", createFountain);
app.put("/fountain/:fountainId", updateFountain);
app.delete("/fountain/:fountainId", deleteFountain);

app.post("/fountains/:fountainId/reviews", createFountainReview);

app.get("/buildings", getBuildings);
app.post("/buildings", createBuilding);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

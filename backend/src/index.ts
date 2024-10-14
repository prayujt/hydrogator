import { Building } from "./models/building.model"
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
    validateForgotCode,
    updateUser,
} from "./controllers/user.controller";

import { authMiddleware } from "./middleware";

import express, { Express } from "express";
import * as dotenv from "dotenv";
import cors from "cors";

const syncModels = async (): Promise<void> => {
    await Building.sync({ alter: true });
    await Fountain.sync({ alter: true });
    await User.sync({ alter: true });
    await Review.sync({ alter: true });
};

dotenv.config();
syncModels();

const app: Express = express();
const port = process.env.PORT || 3000;

const corsOptions = {
    origin: 'http://localhost:8081',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  
app.use(cors(corsOptions));

app.use(express.json());

app.post("/register", register);
app.post("/signIn", signIn);
app.post("/generateForgot", generateForgotCode);
app.post("/validateForgot", validateForgotCode);
app.put('/profile', authMiddleware, updateUser);

app.get("/fountain/:fountainId", getFountain);
app.post("/fountain", createFountain);
app.put("/fountain/:fountainId", updateFountain);
app.delete("/fountain/:fountainId", deleteFountain);

app.post("/fountains/:fountainId/reviews", createFountainReview);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

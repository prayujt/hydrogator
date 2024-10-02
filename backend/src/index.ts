import { Fountain } from "./models/fountain.model";
import { Review } from "./models/review.model";
import { User } from "./models/user.model";
import cors from "cors";

import {
    createFountain,
    getFountains,
} from "./controllers/fountain.controller";
import {
    createReview,
    getFountainReviews,
} from "./controllers/review.controller";
import {
    register,
    signIn,
    generateForgotCode,
    validateForgotCode,
} from "./controllers/user.controller";

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

const corsOptions = {
    origin: 'http://localhost:8081', // Replace with your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  };
  
app.use(cors(corsOptions));

app.use(express.json());

app.post("/register", register);
app.post("/signIn", signIn);
app.post("/generateForgot", generateForgotCode);
app.post("/validateForgot", validateForgotCode);

app.get("/fountains", getFountains);
app.post("/fountains", createFountain);
app.put("/fountain/:id", createFountain);
app.delete("/fountains/:id", createFountain);

app.get("/fountains/:id/reviews", getFountainReviews);
app.post("/fountains/:id/reviews", createReview);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

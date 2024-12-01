import { Building } from "./models/building.model";
import { Fountain } from "./models/fountain.model";
import { Review } from "./models/review.model";
import { User } from "./models/user.model";
import { Like } from "./models/like.model";

import {
  createFountain,
  createFountainReview,
  deleteFountain,
  getFountain,
  likeFountain,
  updateFountain,
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
  getBuilding,
  getBuildings,
  getBuildingFountains,
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
  await Like.sync();
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

app.get("/buildings", getBuildings);
app.post("/buildings", createBuilding);
app.get("/buildings/:buildingId", authMiddleware, getBuilding);
app.get(
  "/buildings/:buildingId/fountains",
  authMiddleware,
  getBuildingFountains,
);

app.post("/fountains", createFountain);
app.get("/fountains/:fountainId", authMiddleware, getFountain);
app.put("/fountains/:fountainId", updateFountain);
app.delete("/fountains/:fountainId", deleteFountain);

app.post(
  "/fountains/:fountainId/reviews",
  authMiddleware,
  createFountainReview,
);
app.post("/fountains/:fountainId/like", authMiddleware, likeFountain);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

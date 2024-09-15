import { createFountain, getFountains } from "./controllers/fountain.controller";
import { sync } from "./database";

import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();
//sync();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/fountains", getFountains);
app.post("/fountain", createFountain);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

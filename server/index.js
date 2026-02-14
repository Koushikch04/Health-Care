import mongoose from "mongoose";
import dotenv from "dotenv";

import { createApp } from "./app.js";
import scheduleJobs from "./cron/cronJobs.js";

dotenv.config();

const app = createApp();
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;

mongoose
  .connect(MONGO_URL)
  .then(async () => {
    console.log("Database connected");
    app.listen(PORT);
    console.log("Server started successfully");
    scheduleJobs();
  })
  .catch((err) => console.log(err));


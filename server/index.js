import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.get("/", (req, res) => {
  res.send("Sever Home Page");
});

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;
mongoose
  .connect(MONGO_URL)
  .then(async () => {
    console.log("Database connected");
    app.listen(PORT);
    console.log("Server started successfully");
  })
  .catch((err) => console.log(err));
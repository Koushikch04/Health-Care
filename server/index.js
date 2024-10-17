import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import MongoDBStore from "connect-mongodb-session";

import authRoutes from "./routes/auth.js";

dotenv.config();
const MONGO_URL = process.env.MONGO_URL;

const app = express();
const store = new (MongoDBStore(session))({
  uri: MONGO_URL,
  collection: "sessions",
});

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use("/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("Sever Home Page");
});

const PORT = process.env.PORT;
mongoose
  .connect(MONGO_URL)
  .then(async () => {
    console.log("Database connected");
    app.listen(PORT);
    console.log("Server started successfully");
  })
  .catch((err) => console.log(err));

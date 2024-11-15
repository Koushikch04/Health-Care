import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import scheduleJobs from "./cron/cronJobs.js";

import Appointment from "./models/Appointment.js";
import Speciality from "./models/Specialty.js";
import Review from "./models/Review.js";
import Doctor from "./models/Doctor.js";

// import session from "express-session";
// import MongoDBStore from "connect-mongodb-session";

import authRoutes from "./routes/auth.js";
import doctorRoutes from "./routes/doctor.js";
import appointmentRoutes from "./routes/appointment.js";
import specialtyRoutes from "./routes/specialty.js";
import profileRoutes from "./routes/profile.js";
import findSpecialtyRoutes from "./routes/findSpecialty.js";
import reviewRoutes from "./routes/review.js";
import adminRoutes from "./routes/admin.js";

import { verifyToken } from "./middleware/authVerification.js";

dotenv.config();
const MONGO_URL = process.env.MONGO_URL;

const app = express();
// const store = new (MongoDBStore(session))({
//   uri: MONGO_URL,
//   collection: "sessions",
// });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://health-care-red-five.vercel.app",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     store: store,
//     cookie: {
//       maxAge: 1000 * 60 * 60,
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//     },
//   })
// );

app.use("/auth", authRoutes);
app.use("/appointment", appointmentRoutes);
app.use("/doctor", doctorRoutes);
app.use("/specialty", specialtyRoutes);
app.use("/profile", profileRoutes);
app.use("/health/specialty", findSpecialtyRoutes);
app.use("/review/", reviewRoutes);
app.use("/admin/", adminRoutes);

app.get("/", verifyToken, (req, res) => {
  res.send("Sever Home Page");
});

app.get("/test", (req, res) => {
  res.send("Hello");
});

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

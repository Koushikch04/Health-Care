import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import doctorRoutes from "./routes/doctor.js";
import appointmentRoutes from "./routes/appointment.js";
import specialtyRoutes from "./routes/specialty.js";
import profileRoutes from "./routes/profile.js";
import findSpecialtyRoutes from "./routes/findSpecialty.js";
import reviewRoutes from "./routes/review.js";
import adminRoutes from "./routes/admin.js";
import { verifyToken } from "./middleware/authVerification.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { createAppError } from "./utils/appError.js";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://health-care-red-five.vercel.app",
];

const getAllowedOrigins = () => {
  const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS;
  if (!configuredOrigins) {
    return DEFAULT_ALLOWED_ORIGINS;
  }

  const parsedOrigins = configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return parsedOrigins.length > 0 ? parsedOrigins : DEFAULT_ALLOWED_ORIGINS;
};

export const createApp = () => {
  const app = express();
  const allowedOrigins = getAllowedOrigins();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  app.use(express.json());

  const globalApiLimiter = rateLimit({
    windowMs: Number(process.env.GLOBAL_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.GLOBAL_RATE_LIMIT_MAX) || 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: "failure",
      msg: "Too many requests from this IP, please try again later.",
    },
  });

  app.use(globalApiLimiter);

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (origin.endsWith(".vercel.app")) return callback(null, true);

        return callback(
          createAppError(403, "Not allowed by CORS", {
            code: "CORS_ORIGIN_DENIED",
          }),
        );
      },
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
      credentials: true,
    }),
  );

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

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};


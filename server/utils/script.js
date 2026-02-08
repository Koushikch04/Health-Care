import mongoose from "mongoose";
import Review from "../models/Review.js"; // Adjust path to your model
import { backupModelData } from "./exportData.js"; // Adjust path to utility

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../.env");

dotenv.config({ path: envPath });

// 🔍 hard proof the value exists
console.log("MONGO_URI:", process.env.MONGO_URL);

const runMigrationBackup = async () => {
  try {
    // 1. Connect to your MongoDB Atlas Cluster
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to database for backup...");

    // 2. Run backups for your required models
    // You can add more models to this array as needed
    await Promise.all([
      backupModelData(Review),
      // backupModelData(OtherModel),
    ]);

    console.log("Migration backup completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration backup failed:", error);
    process.exit(1);
  }
};

runMigrationBackup();

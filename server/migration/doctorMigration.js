import mongoose from "mongoose";
import { config } from "dotenv";

import Doctor from "../models/Doctor.js";

config();
const MONGO_URL = process.env.MONGO_URL;

async function connectDB() {
  try {
    if (!MONGO_URL) {
      throw new Error("Missing MONGO_URL in environment.");
    }
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB for migration");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

async function migrateDoctors() {
  try {
    // Update doctors missing new fields with default values
    const result = await Doctor.updateMany(
      {
        $or: [
          // { email: { $exists: false } },
          // { phone: { $exists: false } },
          // { profilePicture: { $exists: false } },
          // { biography: { $exists: false } },
          // { gender: { $exists: false } },
          // { password: { $exists: false } },
          // { name: { $exists: false } },
        ],
      },
      {
        $set: {
          // name: {
          //   firstName: "David",
          //   lastName: "Wilson",
          // },
          registrationStatus: "approved",
        },
      }
    );
    console.log(
      `Migration complete. ${result.nModified} doctor records updated.`
    );
  } catch (error) {
    console.error("Migration failed", error);
  } finally {
    mongoose.connection.close();
  }
}

// connectDB().then(migrateDoctors).catch(console.error);

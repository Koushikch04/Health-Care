import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
async function connectDB() {
  try {
    await mongoose.connect(
      "mongodb+srv://chk240404:root12@cluster0.dgqbi.mongodb.net/HealthCare?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Connected to MongoDB for migration");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

async function migrateAppointments() {
  try {
    // Update doctors missing new fields with default values
    const result = await Appointment.updateMany(
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
          reviewed: "false",
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

connectDB().then(migrateAppointments);

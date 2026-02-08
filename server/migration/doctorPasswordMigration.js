import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

import Doctor from "../models/Doctor.js";

dotenv.config();
const MONGO_URL = process.env.MONGO_URL;

// Connect to your MongoDB
if (!MONGO_URL) {
  throw new Error("Missing MONGO_URL in environment.");
}
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the Doctor model

// Function to update each doctor's password
async function updatePasswords() {
  try {
    // Retrieve all doctors
    const doctors = await Doctor.find();

    for (let doctor of doctors) {
      // Remove "Dr. " prefix and spaces, then add "12" at the end
      const cleanName =
        doctor.name
          .replace(/^Dr\.?\s*/, "")
          .replace(/\s+/g, "")
          .toLowerCase() + "12";

      // Generate the bcrypt hash for the password
      const hashedPassword = await bcrypt.hash(cleanName, 10);

      // Update the doctor's password
      await Doctor.updateOne({ _id: doctor._id }, { password: hashedPassword });
      console.log(`Updated password for Dr. ${doctor.name}`);
    }

    console.log("All passwords updated successfully!");
  } catch (error) {
    console.error("Error updating passwords:", error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the update function
// updatePasswords();

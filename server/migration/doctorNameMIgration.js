import mongoose from "mongoose";
import dotenv from "dotenv";

import Doctor from "../models/Doctor.js";

dotenv.config();
const MONGO_URL = process.env.MONGO_URL;

async function migrateDoctors() {
  try {
    if (!MONGO_URL) {
      throw new Error("Missing MONGO_URL in environment.");
    }
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Fetch all doctors
    const doctors = await Doctor.find({});

    for (const doctor of doctors) {
        console.log(`Doctor ID: ${doctor._id}, Name: ${doctor.name}`);
  
    //     if (typeof doctor.name === 'string') {
    //       // Split the old name format into first and last names
    //       const [firstName, ...lastNameParts] = doctor.name.split(' ');
    //       const lastName = lastNameParts.join(' ');
  
    //       // Create the new name structure
    //       doctor.name = {
    //         firstName: firstName || undefined,
    //         lastName: lastName || undefined,
    //       };

    //   // Save the updated doctor record
    //   await doctor.save();
    //   console.log(`Updated doctor: ${doctor.email}`);
    }

  } 
}
catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
  }

// Run the migration
migrateDoctors()

import mongoose from "mongoose";
import Doctor from "../models/Doctor.js";

const MONGO_URI = process.env.MONGO_URL;

async function migrateDoctors() {
  try {
    await mongoose.connect(
      "mongodb+srv://chk240404:root12@cluster0.dgqbi.mongodb.net/HealthCare?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

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

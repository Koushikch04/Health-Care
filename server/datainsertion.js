import mongoose from "mongoose";
import dotenv from "dotenv";

import Specialty from "./models/Specialty.js";
import Doctor from "./models/Doctor.js";

dotenv.config();
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const newSpecialties = [
  { name: "Cardiologist", description: "Heart Health" },
  { name: "Geriatrician", description: "Care for elderly patients" },
  { name: "Endocrinologist", description: "Hormone and gland health" },
  { name: "Rheumatologist", description: "Joint and autoimmune diseases" },
  {
    name: "Urologist",
    description: "Urinary tract and male reproductive system",
  },
  { name: "Ophthalmologist", description: "Eye health and surgery" },
  { name: "Psychiatrist", description: "Mental health specialist" },
  {
    name: "Anesthesiologist",
    description: "Pain management during procedures",
  },
  {
    name: "Plastic Surgeon",
    description: "Reconstructive and cosmetic surgery",
  },
  {
    name: "Sports Medicine Specialist",
    description: "Injury prevention and treatment for athletes",
  },
  { name: "Oncologist", description: "Cancer treatment and care" },
];

// Function to add specialties
const addSpecialties = async () => {
  for (const specialty of newSpecialties) {
    const existingSpecialty = await Specialty.findOne({ name: specialty.name });
    if (!existingSpecialty) {
      await Specialty.create(specialty);
      console.log(`Added specialty: ${specialty.name}`);
    } else {
      console.log(`Specialty already exists: ${specialty.name}`);
    }
  }
};

// Sample doctors to add
const doctors = [
  {
    name: "Dr. John Doe",
    experience: 10,
    rating: 4.5,
    profile: "Experienced cardiologist with a focus on heart health.",
    cost: 200,
    specialty: "Cardiologist",
  },
  {
    name: "Dr. Jane Smith",
    experience: 15,
    rating: 4.8,
    profile: "Expert in geriatrics and elder care.",
    cost: 250,
    specialty: "Geriatrician",
  },
  {
    name: "Dr. Emily White",
    experience: 8,
    rating: 4.6,
    profile: "Specializing in hormone-related health issues.",
    cost: 220,
    specialty: "Endocrinologist",
  },
  {
    name: "Dr. James Brown",
    experience: 12,
    rating: 4.7,
    profile: "Focused on joint and autoimmune disorders.",
    cost: 230,
    specialty: "Rheumatologist",
  },
  {
    name: "Dr. Sarah Davis",
    experience: 6,
    rating: 4.4,
    profile: "Expert in urinary tract and male reproductive health.",
    cost: 180,
    specialty: "Urologist",
  },
  {
    name: "Dr. Alan Green",
    experience: 10,
    rating: 4.3,
    profile: "Specializes in eye health and surgery.",
    cost: 210,
    specialty: "Ophthalmologist",
  },
  {
    name: "Dr. Lisa Black",
    experience: 7,
    rating: 4.5,
    profile: "Psychiatrist focused on mental health care.",
    cost: 240,
    specialty: "Psychiatrist",
  },
];

// Function to add doctors
const addDoctors = async () => {
  for (const doctor of doctors) {
    const specialty = await Specialty.findOne({ name: doctor.specialty });
    if (specialty) {
      doctor.specialty = specialty._id; // Replace name with ObjectId
      await Doctor.create(doctor);
      console.log(`Added doctor: ${doctor.name}`);
    } else {
      console.log(`Specialty not found for doctor: ${doctor.name}`);
    }
  }
};

// Execute functions
// const run = async () => {
//   await addSpecialties();
//   // await addDoctors();
//   mongoose.connection.close();
// };

// run().catch((err) => console.error(err));

const additionalDoctors = [
  {
    name: "Dr. Maria Thompson",
    experience: 5,
    rating: 4.2,
    profile:
      "Specializes in pediatric care with a focus on childhood diseases.",
    cost: 150,
    specialty: "Pediatrician",
  },
  {
    name: "Dr. Michael Johnson",
    experience: 12,
    rating: 4.6,
    profile:
      "Expert in orthopedic surgery with extensive experience in sports injuries.",
    cost: 300,
    specialty: "Orthopedic Surgeon",
  },
  {
    name: "Dr. Laura Williams",
    experience: 8,
    rating: 4.7,
    profile: "Experienced in treating patients with skin conditions.",
    cost: 180,
    specialty: "Dermatologist",
  },
  {
    name: "Dr. Kevin Brown",
    experience: 11,
    rating: 4.4,
    profile: "Specializing in reproductive health and gynecology.",
    cost: 220,
    specialty: "Gynecologist/Obstetrician",
  },
  {
    name: "Dr. Rachel Green",
    experience: 14,
    rating: 4.5,
    profile: "Focused on mental health and psychotherapy.",
    cost: 200,
    specialty: "Psychiatrist",
  },
  {
    name: "Dr. Steven Miller",
    experience: 10,
    rating: 4.3,
    profile: "Specializing in cancer treatment and patient care.",
    cost: 350,
    specialty: "Oncologist",
  },
  {
    name: "Dr. Natalie Wilson",
    experience: 6,
    rating: 4.1,
    profile:
      "Provides comprehensive care for patients with diabetes and thyroid issues.",
    cost: 190,
    specialty: "Endocrinologist",
  },
  {
    name: "Dr. George Martinez",
    experience: 9,
    rating: 4.8,
    profile: "Expert in diagnosing and treating joint disorders.",
    cost: 240,
    specialty: "Rheumatologist",
  },
  {
    name: "Dr. Betty Adams",
    experience: 7,
    rating: 4.3,
    profile: "Specializes in urinary health and men's reproductive health.",
    cost: 210,
    specialty: "Urologist",
  },
  {
    name: "Dr. Tom Harris",
    experience: 13,
    rating: 4.6,
    profile: "Experienced in eye surgeries and vision correction.",
    cost: 280,
    specialty: "Ophthalmologist",
  },
  {
    name: "Dr. Angela Lewis",
    experience: 5,
    rating: 4.2,
    profile: "Specializing in pain management and anesthesia.",
    cost: 200,
    specialty: "Anesthesiologist",
  },
  {
    name: "Dr. Daniel Clark",
    experience: 9,
    rating: 4.4,
    profile: "Focuses on reconstructive and cosmetic surgery.",
    cost: 400,
    specialty: "Plastic Surgeon",
  },
  {
    name: "Dr. Linda Scott",
    experience: 4,
    rating: 4.0,
    profile: "Specializes in sports injuries and rehabilitation.",
    cost: 170,
    specialty: "Sports Medicine Specialist",
  },
];

// Function to add additional doctors
const addAdditionalDoctors = async () => {
  for (const doctor of additionalDoctors) {
    const specialty = await Specialty.findOne({ name: doctor.specialty });
    if (specialty) {
      doctor.specialty = specialty._id; // Replace name with ObjectId
      await Doctor.create(doctor);
      console.log(`Added doctor: ${doctor.name}`);
    } else {
      console.log(`Specialty not found for doctor: ${doctor.name}`);
    }
  }
};

// Execute the addition of additional doctors
const addAddionalDoctorsHelper = async () => {
  await addAdditionalDoctors();
  mongoose.connection.close(); // Close the connection after adding
};

// Call the function to add doctors
addAddionalDoctorsHelper().catch((err) => console.error(err));

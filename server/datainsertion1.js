import mongoose from "mongoose";
import dotenv from "dotenv";

import Specialty from "./models/Specialty.js";
import Doctor from "./models/Doctor.js";

dotenv.config();
const MONGO_URL = process.env.MONGO_URL;
console.log(MONGO_URL);

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// New specializations to add
const newSpecializations = [
  {
    name: "Acupuncturist",
    description: "Pain relief and holistic healing using acupuncture",
  },
  {
    name: "Allergist",
    description:
      "Diagnosis and treatment of allergies and immune system disorders",
  },
  {
    name: "Angiologist",
    description: "Treatment of vascular diseases and disorders",
  },
  {
    name: "Anthroposophic Doctor",
    description: "Anthroposophical medicine integrating holistic approaches",
  },
  {
    name: "Forensic Specialist",
    description: "Application of medical knowledge in legal cases",
  },
  {
    name: "Gastroenterologist",
    description: "Specializes in digestive health and gastroenterology",
  },
  {
    name: "Hand Surgeon",
    description: "Specializes in surgical procedures of the hand and wrist",
  },
  {
    name: "Hematologist",
    description: "Focuses on blood disorders and diseases",
  },
  {
    name: "Homeopathic Doctor",
    description: "Treats patients using homeopathic methods",
  },
  {
    name: "Infectious Disease Specialist",
    description: "Diagnosis and treatment of infectious diseases",
  },
  {
    name: "Manual Therapist",
    description: "Provides manual therapy for pain and mobility",
  },
  {
    name: "Maxillofacial Surgeon",
    description: "Surgical treatment of face, mouth, and jaw conditions",
  },
  {
    name: "Nephrologist",
    description: "Specializes in kidney health and related disorders",
  },
  {
    name: "Occupational Therapist",
    description: "Assists patients in improving daily function and occupation",
  },
  {
    name: "ENT Specialist",
    description: "Treats ear, nose, and throat conditions",
  },
  {
    name: "Pathologist",
    description: "Diagnosis of diseases through lab and tissue analysis",
  },
  {
    name: "Pulmonologist",
    description: "Focuses on respiratory health and diseases",
  },
  {
    name: "Tropical Medicine Specialist",
    description: "Treatment of diseases specific to tropical regions",
  },
  {
    name: "Surgeon",
    description: "Performs general and specialized surgical operations",
  },
  {
    name: "Radiologist",
    description: "Uses imaging to diagnose and treat conditions",
  },
  {
    name: "Orthodontist",
    description: "Focuses on alignment and correction of teeth",
  },
  {
    name: "Oral Surgeon",
    description: "Specializes in surgical procedures of the mouth and jaw",
  },
  {
    name: "Periodontist",
    description: "Treats gum disease and oral inflammation",
  },
  {
    name: "Reconstructive Dentist",
    description: "Provides restorative and reconstructive dental care",
  },
];

// Function to add new specialties if they don’t exist
const addSpecialties = async () => {
  for (const specialty of newSpecializations) {
    const existingSpecialty = await Specialty.findOne({ name: specialty.name });
    if (!existingSpecialty) {
      await Specialty.create(specialty);
      console.log(`Added specialty: ${specialty.name}`);
    } else {
      console.log(`Specialty already exists: ${specialty.name}`);
    }
  }
};

// Sample doctors for new specializations
// Sample doctors for new specializations
const newDoctors = [
  {
    name: "Dr. Alice Liu",
    experience: 7,
    rating: 4.3,
    profile: "Expert in acupuncture for pain management and holistic healing.",
    cost: 180,
    specialty: "Acupuncturist",
  },
  {
    name: "Dr. Samuel Kim",
    experience: 10,
    rating: 4.7,
    profile:
      "Specialist in diagnosing and treating immune and allergy disorders.",
    cost: 220,
    specialty: "Allergist",
  },
  {
    name: "Dr. Elena Rodriguez",
    experience: 12,
    rating: 4.8,
    profile: "Renowned for expertise in vascular disease management.",
    cost: 250,
    specialty: "Angiologist",
  },
  {
    name: "Dr. Jonathan Hughes",
    experience: 9,
    rating: 4.5,
    profile: "Integrates holistic practices in anthroposophic medicine.",
    cost: 200,
    specialty: "Anthroposophic Doctor",
  },
  {
    name: "Dr. Rachel Adams",
    experience: 15,
    rating: 4.9,
    profile: "Specializes in forensic pathology and legal case consultations.",
    cost: 300,
    specialty: "Forensic Specialist",
  },
  {
    name: "Dr. Michael Brown",
    experience: 20,
    rating: 4.6,
    profile:
      "Expert in digestive health and advanced gastroenterology procedures.",
    cost: 280,
    specialty: "Gastroenterologist",
  },
  {
    name: "Dr. Amy Wilson",
    experience: 8,
    rating: 4.4,
    profile: "Specialized in surgical treatment for hand and wrist conditions.",
    cost: 230,
    specialty: "Hand Surgeon",
  },
  {
    name: "Dr. Sophia Nguyen",
    experience: 10,
    rating: 4.7,
    profile: "Experienced in diagnosing and treating blood disorders.",
    cost: 220,
    specialty: "Hematologist",
  },
  {
    name: "Dr. Tom Patel",
    experience: 6,
    rating: 4.1,
    profile: "Practices homeopathic methods for holistic healing.",
    cost: 180,
    specialty: "Homeopathic Doctor",
  },
  {
    name: "Dr. Emma Clarke",
    experience: 11,
    rating: 4.6,
    profile: "Expert in managing and treating infectious diseases.",
    cost: 250,
    specialty: "Infectious Disease Specialist",
  },
  {
    name: "Dr. Jason Lee",
    experience: 7,
    rating: 4.3,
    profile: "Specializes in manual therapy for pain relief and mobility.",
    cost: 200,
    specialty: "Manual Therapist",
  },
  {
    name: "Dr. Olivia Scott",
    experience: 14,
    rating: 4.8,
    profile: "Expert in facial, mouth, and jaw surgery.",
    cost: 320,
    specialty: "Maxillofacial Surgeon",
  },
  {
    name: "Dr. John Singh",
    experience: 13,
    rating: 4.7,
    profile: "Specialist in kidney health and nephrology.",
    cost: 240,
    specialty: "Nephrologist",
  },
  {
    name: "Dr. Lisa White",
    experience: 9,
    rating: 4.5,
    profile:
      "Helps patients regain daily function through occupational therapy.",
    cost: 210,
    specialty: "Occupational Therapist",
  },
  {
    name: "Dr. Robert Green",
    experience: 15,
    rating: 4.8,
    profile: "Focuses on ear, nose, and throat health.",
    cost: 220,
    specialty: "ENT Specialist",
  },
  {
    name: "Dr. Sarah Hall",
    experience: 12,
    rating: 4.9,
    profile: "Specializes in diagnosing diseases through tissue analysis.",
    cost: 280,
    specialty: "Pathologist",
  },
  {
    name: "Dr. Daniel Martin",
    experience: 16,
    rating: 4.7,
    profile: "Expert in respiratory health and pulmonology.",
    cost: 300,
    specialty: "Pulmonologist",
  },
  {
    name: "Dr. Clara Hill",
    experience: 7,
    rating: 4.2,
    profile: "Specialist in treating tropical region-specific diseases.",
    cost: 240,
    specialty: "Tropical Medicine Specialist",
  },
  {
    name: "Dr. Andrew King",
    experience: 20,
    rating: 4.9,
    profile: "Performs general and specialized surgical operations.",
    cost: 350,
    specialty: "Surgeon",
  },
  {
    name: "Dr. Michelle Baker",
    experience: 10,
    rating: 4.6,
    profile: "Uses advanced imaging for diagnosis and treatment planning.",
    cost: 270,
    specialty: "Radiologist",
  },
  {
    name: "Dr. Ethan Turner",
    experience: 8,
    rating: 4.5,
    profile: "Specializes in orthodontic care for teeth alignment.",
    cost: 190,
    specialty: "Orthodontist",
  },
  {
    name: "Dr. Jacob Cooper",
    experience: 9,
    rating: 4.6,
    profile: "Experienced in oral and jaw surgery.",
    cost: 230,
    specialty: "Oral Surgeon",
  },
  {
    name: "Dr. Grace Young",
    experience: 11,
    rating: 4.8,
    profile: "Expert in gum disease treatment and inflammation control.",
    cost: 210,
    specialty: "Periodontist",
  },
  {
    name: "Dr. Megan Ross",
    experience: 12,
    rating: 4.7,
    profile: "Focuses on restorative and reconstructive dental care.",
    cost: 240,
    specialty: "Reconstructive Dentist",
  },
];

// Function to add doctors linked to new specializations
const addDoctors = async () => {
  for (const doctor of newDoctors) {
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

// Execute functions to add specializations and doctors
const run = async () => {
  await addSpecialties();
  await addDoctors();
  mongoose.connection.close();
};

run().catch((err) => console.error(err));

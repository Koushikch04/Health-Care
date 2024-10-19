import mongoose from "mongoose";
import Specialty from "./models/Specialty.js"; // Adjust the path as necessary
import Doctor from "./models/Doctor.js"; // Adjust the path as necessary

// Connection URI
const mongoURI =
  "mongodb+srv://chk240404:root12@cluster0.dgqbi.mongodb.net/HealthCare?retryWrites=true&w=majority&appName=Cluster0";
// Connect to MongoDB
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB");

    //     // const specialties = [
    //     //   {
    //     //     name: "Dentist",
    //     //     description: "Dental Care",
    //     //   },
    //     //   {
    //     //     name: "Gynecologist/Obstetrician",
    //     //     description: "Women's Health",
    //     //   },
    //     //   {
    //     //     name: "General Physician",
    //     //     description: "Primary Care",
    //     //   },
    //     //   {
    //     //     name: "Dermatologist",
    //     //     description: "Skin Care",
    //     //   },
    //     // ];

    //     // Insert specialties and get their IDs
    //     const specialtyDocs = await Specialty.find();

    // const specialtyMap = specialtyDocs.reduce((acc, specialty) => {
    //   acc[specialty.name] = specialty._id;
    //   return acc;
    // }, {});

    //     const doctors = [
    //       {
    //         name: "Dr. Alice Johnson",
    //         experience: 12,
    //         rating: 4.7,
    //         image: "/Images/Appointment/DoctorCard/doctor.png",
    //         cost: 1500,
    //         profile: "Specializes in cosmetic and restorative dentistry.",
    //         specialty: specialtyMap["Dentist"],
    //       },
    //       {
    //         name: "Dr. Bob Smith",
    //         experience: 8,
    //         rating: 4.5,
    //         image: "/Images/Appointment/DoctorCard/doctor.png",
    //         cost: 1500,
    //         profile: "Expert in pediatric and general dentistry.",
    //         specialty: specialtyMap["Dentist"],
    //       },
    //       {
    //         name: "Dr. Carol Brown",
    //         experience: 15,
    //         rating: 4.9,
    //         image: "/Images/Appointment/DoctorCard/doctor.png",
    //         cost: 500,
    //         profile:
    //           "Experienced in high-risk pregnancies and gynecological surgeries.",
    //         specialty: specialtyMap["Gynecologist/Obstetrician"],
    //       },
    //       {
    //         name: "Dr. David Wilson",
    //         experience: 10,
    //         rating: 4.6,
    //         image: "/Images/Appointment/DoctorCard/doctor.png",
    //         cost: 2500,
    //         profile: "Focuses on women's reproductive health and menopause.",
    //         specialty: specialtyMap["Gynecologist/Obstetrician"],
    //       },
    //       {
    //         name: "Dr. Emily Davis",
    //         experience: 7,
    //         rating: 4.3,
    //         image: "/Images/Appointment/DoctorCard/doctor.png",
    //         cost: 2000,
    //         profile:
    //           "Provides comprehensive care and treatment for common illnesses.",
    //         specialty: specialtyMap["General Physician"],
    //       },
    //       {
    //         name: "Dr. Frank Miller",
    //         experience: 9,
    //         rating: 4.4,
    //         image: "/Images/Appointment/DoctorCard/doctor.png",
    //         cost: 1500,
    //         profile:
    //           "Specializes in preventive medicine and chronic disease management.",
    //         specialty: specialtyMap["General Physician"],
    //       },
    //       {
    //         name: "Dr. Grace Lee",
    //         experience: 11,
    //         rating: 4.8,
    //         image: "/Images/Appointment/DoctorCard/doctor.png",
    //         cost: 1000,
    //         profile: "Expert in skin conditions and cosmetic dermatology.",
    //         specialty: specialtyMap["Dermatologist"],
    //       },
    //       {
    //         name: "Dr. Henry Martinez",
    //         experience: 6,
    //         rating: 4.2,
    //         image: "/Images/Appointment/DoctorCard/doctor.png",
    //         cost: 500,
    //         profile: "Specializes in acne treatment and skin cancer screenings.",
    //         specialty: specialtyMap["Dermatologist"],
    //       },
    //     ];

    //     const additionalDoctors = [
    //       {
    //         name: "Dr. Alice Chen",
    //         experience: 9,
    //         rating: 4.6,
    //         image: "/Images/Appointment/DoctorCard/doctor.png",
    //         cost: 1800,
    //         profile: "Specializes in aesthetic and restorative dentistry.",
    //         specialty: specialtyMap["Dentist"],
    //       },
    //       {
    //         name: "Dr. Maya Patel",
    //         experience: 14,
    //         rating: 4.8,
    //         image: "/Images/Appointment/DoctorCard/doctor.png",
    //         cost: 3000,
    //         profile: "Expert in obstetrics and gynecological health.",
    //         specialty: specialtyMap["Gynecologist/Obstetrician"],
    //       },
    //       {
    //         name: "Dr. Jake Thompson",
    //         experience: 5,
    //         rating: 4.1,
    //         image: "/Images/Appointment/DoctorCard/doctor.png",
    //         cost: 1200,
    //         profile: "Provides general medical care and treatment.",
    //         specialty: specialtyMap["General Physician"],
    //       },
    //       {
    //         name: "Dr. Sarah O'Connor",
    //         experience: 10,
    //         rating: 4.7,
    //         image: "/Images/Appointment/DoctorCard/doctor.png",
    //         cost: 1500,
    //         profile: "Specializes in skin disorders and dermatological treatments.",
    //         specialty: specialtyMap["Dermatologist"],
    //       },
    //       {
    //         name: "Dr. Kevin Liu",
    //         experience: 11,
    //         rating: 4.4,
    //         image: "/Images/Appointment/DoctorCard/doctor.png",
    //         cost: 2000,
    //         profile: "Focuses on chronic disease management and preventive care.",
    //         specialty: specialtyMap["General Physician"],
    //       },
    //       {
    //         name: "Dr. Emma Wilson",
    //         experience: 13,
    //         rating: 4.9,
    //         image: "/Images/Appointment/DoctorCard/doctor.png",
    //         cost: 2200,
    //         profile: "Expert in complex obstetric cases and reproductive health.",
    //         specialty: specialtyMap["Gynecologist/Obstetrician"],
    //       },
    //       {
    //         name: "Dr. Noah Brown",
    //         experience: 8,
    //         rating: 4.5,
    //         image: "/Images/Appointment/DoctorCard/doctor.png",
    //         cost: 1600,
    //         profile:
    //           "Specializes in preventive dermatology and skin cancer screenings.",
    //         specialty: specialtyMap["Dermatologist"],
    //       },
    //     ];

    //     // Insert additional doctors
    //     await Doctor.insertMany(additionalDoctors);

    //     // Insert doctors

    //     console.log("Specialties and doctors inserted successfully");

    //     // Close the database connection
    //     mongoose.connection.close();
    //   })
    //   .catch((error) => {
    //     console.error("Error connecting to MongoDB", error);

    const specialtyDocs = await Specialty.find();
    const specialtyMap = specialtyDocs.reduce((acc, specialty) => {
      acc[specialty.name] = specialty._id;
      return acc;
    }, {});

    // Insert additional specialties

    const additionalSpecialties = [
      {
        name: "Pediatrician",
        description: "Child Health Care",
      },
      {
        name: "Cardiologist",
        description: "Heart Health",
      },
      {
        name: "Orthopedic Surgeon",
        description: "Bone and Joint Care",
      },
      {
        name: "Neurologist",
        description: "Brain and Nerve Disorders",
      },
    ];

    const additionalSpecialtyDocs = await Specialty.insertMany(
      additionalSpecialties
    );

    additionalSpecialtyDocs.forEach((specialty) => {
      specialtyMap[specialty.name] = specialty._id;
    });
    // New doctors associated with the additional specialties
    const additionalDoctors = [
      {
        name: "Dr. Susan Wright",
        experience: 10,
        rating: 4.5,
        image: "/Images/Appointment/DoctorCard/doctor.png",
        cost: 1200,
        profile: "Specializes in children's health and development.",
        specialty: specialtyMap["Pediatrician"],
      },
      {
        name: "Dr. Michael Johnson",
        experience: 15,
        rating: 4.8,
        image: "/Images/Appointment/DoctorCard/doctor.png",
        cost: 2500,
        profile: "Expert in diagnosing and treating heart conditions.",
        specialty: specialtyMap["Cardiologist"],
      },
      {
        name: "Dr. Linda Smith",
        experience: 12,
        rating: 4.6,
        image: "/Images/Appointment/DoctorCard/doctor.png",
        cost: 2000,
        profile: "Specializes in orthopedic surgery and sports injuries.",
        specialty: specialtyMap["Orthopedic Surgeon"],
      },
      {
        name: "Dr. Robert King",
        experience: 8,
        rating: 4.7,
        image: "/Images/Appointment/DoctorCard/doctor.png",
        cost: 1800,
        profile: "Focuses on neurological disorders and treatments.",
        specialty: specialtyMap["Neurologist"],
      },
    ];

    //   });

    await Doctor.insertMany(additionalDoctors);

    console.log("Specialties and doctors inserted successfully");

    // Close the database connection
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });

// Add the new specialties and doctors to your existing code

import Specialty from "../models/Specialty.js";
import Doctor from "../models/Doctor.js";
export const getAllSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find();
    res.json(specialties);
  } catch (error) {
    res.status(500).json({ message: "Error fetching specialties", error });
  }
};

export const getSpecialityDetails = async (req, res) => {
  try {
    // Fetch specialties
    const specialties = await Specialty.find();

    // Fetch all doctors
    const doctors = await Doctor.find();

    // Map doctors to their specialties
    const specialtiesWithDoctors = specialties.map((specialty) => {
      const specialtyDoctors = doctors.filter(
        (doctor) => doctor.specialty.toString() === specialty._id.toString()
      );

      return {
        name: specialty.name,
        url: "#", // Replace with actual URL if needed
        specialty: specialty.description,
        doctors: specialtyDoctors.map((doctor) => ({
          name: doctor.name,
          experience: doctor.experience,
          rating: doctor.rating,
          image: doctor.image || "/Images/Appointment/DoctorCard/doctor.png",
          cost: doctor.cost,
          profile: doctor.profile,
        })),
      };
    });

    res.json(specialtiesWithDoctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

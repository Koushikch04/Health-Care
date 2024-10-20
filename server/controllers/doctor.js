import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Specialty from "../models/Specialty.js";

export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("specialty");
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving doctors", error });
  }
};

// Get doctors by specialty
export const getDoctorsBySpecialty = async (req, res) => {
  const specialtyId = req.params.id;

  try {
    const specialty = await Specialty.findById(specialtyId);
    if (!specialty) {
      return res.status(404).json({ message: "Specialty not found" });
    }

    const doctors = await Doctor.find({ specialty: specialtyId }).populate(
      "specialty"
    );
    res.status(200).json(doctors);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving doctors by specialty", error });
  }
};

// Create a new doctor (optional, add if needed)
export const createDoctor = async (req, res) => {
  const { name, experience, rating, profile, cost, specialty, image } =
    req.body;

  try {
    const newDoctor = new Doctor({
      name,
      experience,
      rating,
      profile,
      cost,
      specialty,
      image,
    });

    const savedDoctor = await newDoctor.save();
    res.status(201).json(savedDoctor);
  } catch (error) {
    res.status(500).json({ message: "Error creating doctor", error });
  }
};

// In your appointment controller
export const getDoctorAppointmentsForDate = async (req, res) => {
  const { doctorId, date } = req.params;

  try {
    const appointments = await Appointment.find({
      doctor: doctorId,
      date: new Date(date),
    }).select("time");

    return res.status(200).json(appointments);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error retrieving appointments", error });
  }
};

// Update a doctor's information (optional, add if needed)
export const updateDoctor = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ message: "Error updating doctor", error });
  }
};

// Delete a doctor (optional, add if needed)
export const deleteDoctor = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(id);
    if (!deletedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting doctor", error });
  }
};

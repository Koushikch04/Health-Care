import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Specialty from "../models/Specialty.js";

//doctor login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let person;

    person = await Doctor.findOne({ email });
    if (!person) return res.status(400).json({ msg: "User does not exist" });
    const matched = bcrypt.compareSync(password, person.password);
    if (!matched) return res.status(401).json({ msg: "Invalid Credentials" });
    person.password = "";
    const token = jwt.sign({ id: person._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    person.role = "doctor";

    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    return res.status(200).json({
      token,
      person,
      role: "doctor",
      expiresAt,
    });
  } catch (err) {
    console.log("login error:", err);
  }
};

//Get all doctors
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

export const getDoctorAppointments = async (req, res) => {
  const { date } = req.query;
  console.log(req.user.id);

  try {
    const query = { doctor: req.user.id };

    if (date) {
      query.date = new Date(date);
    }

    const appointments = await Appointment.find(query);

    console.log(appointments);

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

export const getDoctorAppointmentStatistics = async (req, res) => {
  const doctorId = req.query.doctorId;

  if (!doctorId) {
    return res.status(400).json({
      success: false,
      message: "Doctor ID is required",
    });
  }

  try {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const totalAppointments = await Appointment.countDocuments({
      doctor: doctorId,
    });
    const pendingAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: "scheduled",
    });
    const completedAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: "completed",
    });

    const revenue = completedAppointments * doctor.cost;

    const statistics = {
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      revenue,
    };

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error("Error fetching appointment statistics for doctor:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        msg: "Invalid Doctor ID",
      });
    }

    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};

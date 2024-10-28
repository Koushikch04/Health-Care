import Appointment from "../models/Appointment.js";

export const createAppointment = async (req, res) => {
  const { patientName, reasonForVisit, additionalNotes, date, time, doctorId } =
    req.body;

  if (!patientName || !date || !time || !req.user.id || !doctorId) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  try {
    const newAppointment = new Appointment({
      doctor: doctorId,
      user: req.user.id,
      patientName,
      reasonForVisit,
      additionalNotes,
      date,
      time,
    });

    const savedAppointment = await newAppointment.save();
    return res.status(201).json(savedAppointment);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating appointment", error });
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    // console.log(req.userId);
    const appointments = await Appointment.find({ user: req.user.id })
      .populate("doctor", "name experience rating")
      .sort({ createdAt: -1 });

    return res.status(200).json(appointments);
  } catch (error) {
    console.log(error.message);

    return res
      .status(500)
      .json({ msg: "Error retrieving appointments", error });
  }
};

const fetchAvailableTimeSlots = async (doctorId, selectedDate) => {
  try {
    const response = await fetch(
      `http://localhost:8000/appointment/available-slots/doctor/${doctorId}/date/${selectedDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${yourToken}`, // Include the token if authentication is required
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch available time slots");
    }

    const availableSlots = await response.json();
    console.log("Available Time Slots:", availableSlots);
    return availableSlots;
  } catch (error) {
    console.error("Error fetching available time slots:", error);
  }
};

// Function to generate time slots
const generateTimeSlots = () => {
  const slots = [];
  const startTime = 8 * 60; // 8:00 AM in minutes
  const endTime = 17 * 60; // 5:00 PM in minutes

  for (let time = startTime; time <= endTime; time += 15) {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;
    slots.push(formattedTime);
  }
  return slots;
};

export const getAvailableTimeSlots = async (req, res) => {
  const { doctorId, date } = req.params;

  try {
    // Fetch appointments for the specified doctor and date
    const appointments = await Appointment.find({
      doctor: doctorId,
      date: new Date(date),
    }).select("time");

    const bookedTimes = appointments.map((app) => app.time);
    const allSlots = generateTimeSlots();

    // Filter out booked slots
    const availableSlots = allSlots.filter(
      (slot) => !bookedTimes.includes(slot)
    );

    return res.status(200).json(availableSlots);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error retrieving available time slots", error });
  }
};

export const cancelAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (appointment.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this appointment." });
    }

    appointment.status = "canceled";
    await appointment.save();

    return res
      .status(200)
      .json({ message: "Appointment canceled successfully.", appointment });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: "Error canceling appointment", error });
  }
};

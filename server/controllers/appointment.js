import Appointment from "../models/Appointment";

export const createAppointment = async (req, res) => {
  const { patientName, reasonForVisit, additionalNotes, date, time } = req.body;

  // Check if required fields are provided
  if (!patientName || !date || !time || !req.user.id) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  try {
    const newAppointment = new Appointment({
      doctor: req.body.doctor, // Ensure doctor ID is passed in the request body
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
    const appointments = await Appointment.find({ user: req.user.id })
      .populate("doctor", "name experience rating") // Populate doctor details if needed
      .sort({ createdAt: -1 }); // Sort appointments by creation date

    return res.status(200).json(appointments);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error retrieving appointments", error });
  }
};

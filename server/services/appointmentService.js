import Appointment from "../models/Appointment.js";
import { getUtcDayBounds } from "../utils/date.js";
import { APPOINTMENT_STATUSES } from "../utils/appointmentStateMachine.js";

const generateTimeSlots = () => {
  const slots = [];
  const startTime = 8 * 60;
  const endTime = 17 * 60;

  for (let time = startTime; time <= endTime; time += 15) {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    slots.push(
      `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
    );
  }

  return slots;
};

export const getAvailableSlots = async (doctorId, date) => {
  const dayBounds = getUtcDayBounds(date);
  if (!dayBounds) {
    return null;
  }

  const appointments = await Appointment.find({
    doctor: doctorId,
    date: {
      $gte: dayBounds.start,
      $lte: dayBounds.end,
    },
    status: APPOINTMENT_STATUSES.SCHEDULED,
  }).select("time");

  const bookedTimes = new Set(appointments.map((appointment) => appointment.time));
  return generateTimeSlots().filter((slot) => !bookedTimes.has(slot));
};

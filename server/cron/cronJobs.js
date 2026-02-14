import cron from "node-cron";
import Appointment from "../models/Appointment.js";
import {
  APPOINTMENT_ACTIONS,
  APPOINTMENT_STATUSES,
  getAllowedFromStatuses,
} from "../utils/appointmentStateMachine.js";

let isRunning = false;

export const processOverdueAppointments = async ({
  now = new Date(),
  batchSize = 100,
} = {}) => {
  // Fetch scheduled appointments only
  const appointments = await Appointment.find({
    status: APPOINTMENT_STATUSES.SCHEDULED,
  }).limit(batchSize);

  const overdueAppointments = [];

  for (const appointment of appointments) {
    // Combine date + time into a single Date object
    const appointmentDateTime = new Date(appointment.date);

    const [hours, minutes] = appointment.time.split(":").map(Number);

    appointmentDateTime.setUTCHours(hours, minutes, 0, 0);
    if (appointmentDateTime < now) {
      overdueAppointments.push(appointment);
    }
  }

  if (!overdueAppointments.length) {
    return { matchedCount: 0, modifiedCount: 0 };
  }

  const overdueIds = overdueAppointments.map((a) => a._id);

  // Mark appointments as completed (bulk update)
  const result = await Appointment.updateMany(
    {
      _id: { $in: overdueIds },
      status: {
        $in: getAllowedFromStatuses(APPOINTMENT_ACTIONS.COMPLETE),
      },
    },
    { $set: { status: APPOINTMENT_STATUSES.COMPLETED } },
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

const scheduleJobs = () => {
  console.log("schedule file running");

  // Every minute
  cron.schedule("*/5 * * * *", async () => {
    if (isRunning) return;
    isRunning = true;

    console.log("cron file running");

    try {
      const result = await processOverdueAppointments();
      console.log(`${result.modifiedCount} appointments completed`);
    } catch (error) {
      console.error("Error processing cron job:", error);
    } finally {
      isRunning = false;
    }
  });
};

export default scheduleJobs;

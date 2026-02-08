import cron from "node-cron";
import Appointment from "../models/Appointment.js";
import Review from "../models/Review.js";
import Doctor from "../models/Doctor.js";

let isRunning = false;

const scheduleJobs = () => {
  console.log("schedule file running");

  // Every minute
  cron.schedule("* * * * *", async () => {
    if (isRunning) return;
    isRunning = true;

    console.log("cron file running");

    try {
      const now = new Date();
      const batchSize = 100;

      // Fetch scheduled appointments only
      const appointments = await Appointment.find({
        status: "scheduled",
      }).limit(batchSize);

      const overdueAppointments = [];

      for (const appointment of appointments) {
        // Combine date + time into a single Date object
        const appointmentDateTime = new Date(appointment.date);

        const [hours, minutes] = appointment.time.split(":").map(Number);

        appointmentDateTime.setUTCHours(hours, minutes, 0, 0);
        console.log(
          `Checking appointment ${appointment._id} at ${appointmentDateTime} against now ${now}`,
        );

        if (appointmentDateTime < now) {
          overdueAppointments.push(appointment);
        }
      }

      if (!overdueAppointments.length) {
        console.log("No overdue appointments");
        return;
      }

      const overdueIds = overdueAppointments.map((a) => a._id);

      // Mark appointments as completed (bulk update)
      await Appointment.updateMany(
        { _id: { $in: overdueIds } },
        { $set: { status: "completed" } },
      );

      // Create reviews safely
      for (const appointment of overdueAppointments) {
        if (appointment.reviewed) continue;

        const doctor = await Doctor.findById(appointment.doctor);
        if (!doctor) continue;

        const reviewExists = await Review.exists({
          appointment: appointment._id,
        });

        if (!reviewExists) {
          await Review.create({
            doctor: appointment.doctor,
            user: appointment.user,
            appointment: appointment._id,
            specialty: doctor.specialty,
            rating: 5,
          });
        }

        await Appointment.updateOne(
          { _id: appointment._id },
          { $set: { reviewed: true } },
        );
      }

      console.log(`${overdueAppointments.length} appointments completed`);
    } catch (error) {
      console.error("Error processing cron job:", error);
    } finally {
      isRunning = false;
    }
  });
};

export default scheduleJobs;

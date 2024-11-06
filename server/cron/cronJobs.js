import cron from "node-cron";
import Appointment from "../models/Appointment.js";
import Review from "../models/Review.js";
import Doctor from "../models/Doctor.js";

const scheduleJobs = () => {
  console.log("schedule file running");

  cron.schedule("* * * * *", async () => {
    try {
      console.log("cron file running");

      const now = new Date();
      const batchSize = 100;

      // Find scheduled appointments that are overdue and mark them as completed
      const appointmentsToComplete = await Appointment.find({
        date: { $lt: now },
        status: "scheduled",
      }).limit(batchSize);

      // If appointments found, mark as completed and create reviews
      console.log(appointmentsToComplete.length);

      if (appointmentsToComplete.length > 0) {
        for (let appointment of appointmentsToComplete) {
          appointment.status = "completed";
          await appointment.save();

          const doctor = await Doctor.findById(appointment.doctor);

          //   if (doctor) {
          //     await Review.create({
          //       doctor: appointment.doctor,
          //       user: appointment.user,
          //       appointment: appointment._id,
          //       specialty: doctor.specialty,
          //       rating: 5,
          //     });
          //   } else {
          //     console.error(
          //       `Doctor not found for appointment ${appointment._id}`
          //     );
          //   }
        }
        console.log(
          `${appointmentsToComplete.length} completed appointments processed.`
        );
      }
    } catch (error) {
      console.error("Error processing cron job:", error);
    }
  });
};

export default scheduleJobs;

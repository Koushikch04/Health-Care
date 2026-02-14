import Appointment from "../models/Appointment.js";
import { processOverdueAppointments } from "../cron/cronJobs.js";
import { createDoctorFixture, createUserWithToken } from "./helpers/fixtures.js";
import { getUtcDateStringWithOffset } from "./helpers/time.js";

describe("Cron appointment processing", () => {
  test("marks overdue scheduled appointments as completed", async () => {
    const { profile } = await createUserWithToken({
      email: "cron-user@example.com",
    });
    const { doctor } = await createDoctorFixture({
      email: "cron-doctor@example.com",
    });

    const yesterday = getUtcDateStringWithOffset(-1);
    const appointment = await Appointment.create({
      doctor: doctor._id,
      user: profile._id,
      patientName: "Cron User",
      reasonForVisit: "",
      additionalNotes: "",
      date: new Date(`${yesterday}T00:00:00.000Z`),
      time: "08:00",
      status: "scheduled",
    });

    const result = await processOverdueAppointments({
      now: new Date(),
      batchSize: 100,
    });
    expect(result.modifiedCount).toBeGreaterThanOrEqual(1);

    const updated = await Appointment.findById(appointment._id);
    expect(updated.status).toBe("completed");
  });
});


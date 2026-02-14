import request from "supertest";

import Appointment from "../models/Appointment.js";
import { app, createDoctorFixture, createUserWithToken } from "./helpers/fixtures.js";
import { getUtcDateStringWithOffset } from "./helpers/time.js";

describe("Review restrictions", () => {
  test("rejects review creation for non-completed appointments", async () => {
    const { token, profile } = await createUserWithToken({
      email: "review-user@example.com",
    });
    const { doctor } = await createDoctorFixture({
      email: "review-doctor@example.com",
    });

    const appointment = await Appointment.create({
      doctor: doctor._id,
      user: profile._id,
      patientName: "Review User",
      reasonForVisit: "Follow up",
      additionalNotes: "",
      date: new Date(`${getUtcDateStringWithOffset(2)}T00:00:00.000Z`),
      time: "12:00",
      status: "scheduled",
    });

    const reviewRes = await request(app)
      .post("/review")
      .set("Authorization", `Bearer ${token}`)
      .send({
        doctorId: doctor._id.toString(),
        userId: profile._id.toString(),
        appointmentId: appointment._id.toString(),
        rating: 5,
        comment: "Great",
      });

    expect(reviewRes.status).toBe(400);
    expect(reviewRes.body).toMatchObject({
      error: "Only completed appointments can be reviewed.",
    });
  });
});


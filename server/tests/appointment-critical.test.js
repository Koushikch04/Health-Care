import request from "supertest";

import Appointment from "../models/Appointment.js";
import { app, createDoctorFixture, createUserWithToken } from "./helpers/fixtures.js";
import { getUtcDateStringWithOffset } from "./helpers/time.js";

describe("Appointment critical flows", () => {
  test("state machine rejects illegal double-cancel transition", async () => {
    const { token } = await createUserWithToken({
      email: "state-user@example.com",
    });
    const { doctor } = await createDoctorFixture({
      email: "state-doctor@example.com",
    });

    const date = getUtcDateStringWithOffset(2);
    const createRes = await request(app)
      .post("/appointment")
      .set("Authorization", `Bearer ${token}`)
      .send({
        patientName: "State User",
        reasonForVisit: "Follow-up",
        additionalNotes: "",
        date,
        time: "09:30",
        doctorId: doctor._id.toString(),
      });

    expect(createRes.status).toBe(201);
    const appointmentId = createRes.body._id;

    const firstCancel = await request(app)
      .delete(`/appointment/${appointmentId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(firstCancel.status).toBe(200);

    const secondCancel = await request(app)
      .delete(`/appointment/${appointmentId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(secondCancel.status).toBe(409);
  });

  test("slot booking race allows only one booking", async () => {
    const { token } = await createUserWithToken({
      email: "race-user@example.com",
    });
    const { doctor } = await createDoctorFixture({
      email: "race-doctor@example.com",
    });

    const payload = {
      patientName: "Race User",
      reasonForVisit: "Race",
      additionalNotes: "",
      date: getUtcDateStringWithOffset(3),
      time: "10:00",
      doctorId: doctor._id.toString(),
    };

    const [res1, res2] = await Promise.all([
      request(app).post("/appointment").set("Authorization", `Bearer ${token}`).send(payload),
      request(app).post("/appointment").set("Authorization", `Bearer ${token}`).send(payload),
    ]);

    const statuses = [res1.status, res2.status].sort((a, b) => a - b);
    expect(statuses).toEqual([201, 409]);
  });

  test("date normalization and availability lookup block booked slot", async () => {
    const { token } = await createUserWithToken({
      email: "date-user@example.com",
    });
    const { doctor } = await createDoctorFixture({
      email: "date-doctor@example.com",
    });

    const day = getUtcDateStringWithOffset(4);
    const createRes = await request(app)
      .post("/appointment")
      .set("Authorization", `Bearer ${token}`)
      .send({
        patientName: "Date User",
        reasonForVisit: "Check",
        additionalNotes: "",
        date: `${day}T17:45:00.000Z`,
        time: "09:30",
        doctorId: doctor._id.toString(),
      });

    expect(createRes.status).toBe(201);

    const saved = await Appointment.findById(createRes.body._id);
    expect(saved.date.toISOString()).toBe(`${day}T00:00:00.000Z`);

    const slotsRes = await request(app)
      .get(`/appointment/available-slots/doctor/${doctor._id.toString()}/date/${day}`)
      .set("Authorization", `Bearer ${token}`);

    expect(slotsRes.status).toBe(200);
    expect(slotsRes.body).not.toContain("09:30");
  });

  test("availability strategy toggle returns equivalent slots for array and bitmask", async () => {
    const { token } = await createUserWithToken({
      email: "strategy-user@example.com",
    });
    const { doctor } = await createDoctorFixture({
      email: "strategy-doctor@example.com",
    });

    const candidate = new Date();
    candidate.setUTCDate(candidate.getUTCDate() + 1);
    while (candidate.getUTCDay() === 0 || candidate.getUTCDay() === 6) {
      candidate.setUTCDate(candidate.getUTCDate() + 1);
    }
    const day = candidate.toISOString().slice(0, 10);
    const createRes = await request(app)
      .post("/appointment")
      .set("Authorization", `Bearer ${token}`)
      .send({
        patientName: "Strategy User",
        reasonForVisit: "Strategy parity check",
        additionalNotes: "",
        date: day,
        time: "10:15",
        doctorId: doctor._id.toString(),
      });
    expect(createRes.status).toBe(201);

    const [arrayRes, bitmaskRes] = await Promise.all([
      request(app)
        .get(
          `/appointment/available-slots/doctor/${doctor._id.toString()}/date/${day}?strategy=array`
        )
        .set("Authorization", `Bearer ${token}`),
      request(app)
        .get(
          `/appointment/available-slots/doctor/${doctor._id.toString()}/date/${day}?strategy=bitmask`
        )
        .set("Authorization", `Bearer ${token}`),
    ]);

    expect(arrayRes.status).toBe(200);
    expect(bitmaskRes.status).toBe(200);
    expect(arrayRes.body).toEqual(bitmaskRes.body);
    expect(arrayRes.body).not.toContain("10:15");
  });

  test("unauthorized user cannot cancel someone else's appointment", async () => {
    const { token: ownerToken } = await createUserWithToken({
      email: "owner-user@example.com",
    });
    const { token: attackerToken } = await createUserWithToken({
      email: "attacker-user@example.com",
    });
    const { doctor } = await createDoctorFixture({
      email: "cancel-doctor@example.com",
    });

    const createRes = await request(app)
      .post("/appointment")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        patientName: "Owner User",
        reasonForVisit: "Consultation",
        additionalNotes: "",
        date: getUtcDateStringWithOffset(5),
        time: "11:15",
        doctorId: doctor._id.toString(),
      });
    expect(createRes.status).toBe(201);

    const cancelRes = await request(app)
      .delete(`/appointment/${createRes.body._id}`)
      .set("Authorization", `Bearer ${attackerToken}`);

    expect(cancelRes.status).toBe(403);
    expect(cancelRes.body.message).toMatch(/Not authorized/i);
  });
});


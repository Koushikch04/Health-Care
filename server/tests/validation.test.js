import request from "supertest";

import { app, createUserWithToken } from "./helpers/fixtures.js";

describe("Validation layer", () => {
  test("returns consistent validation error shape", async () => {
    const { token } = await createUserWithToken({
      email: "validation-user@example.com",
    });

    const res = await request(app)
      .post("/appointment")
      .set("Authorization", `Bearer ${token}`)
      .send({
        patientName: "",
      });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
      },
    });
    expect(Array.isArray(res.body.error.details)).toBe(true);
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });
});


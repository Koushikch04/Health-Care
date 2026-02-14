import request from "supertest";

import { app, createUserWithToken } from "./helpers/fixtures.js";

describe("Auth and authorization guards", () => {
  test("enforces token presence and admin role checks", async () => {
    const noTokenRes = await request(app).get("/appointment");
    expect(noTokenRes.status).toBe(403);
    expect(noTokenRes.body).toMatchObject({
      success: false,
      error: { code: "AUTH_MISSING_TOKEN" },
    });

    const { token } = await createUserWithToken({
      email: "guard-user@example.com",
    });
    const adminRes = await request(app)
      .get("/admin/users")
      .set("Authorization", `Bearer ${token}`);

    expect(adminRes.status).toBe(403);
    expect(adminRes.body).toMatchObject({
      success: false,
      error: { code: "AUTH_ADMIN_REQUIRED" },
    });
  });
});


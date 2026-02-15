import request from "supertest";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { jest } from "@jest/globals";

import Account from "../models/Account.js";
import UserProfile from "../models/UserProfile.js";
import InviteToken from "../models/InviteToken.js";
import { app } from "./helpers/fixtures.js";

describe("Auth onboarding critical flows", () => {
  test("blocks login for pending accounts", async () => {
    const passwordHash = await bcrypt.hash("Password123!", 10);
    await Account.create({
      email: "pending-login@example.com",
      password: passwordHash,
      roles: ["user"],
      status: "pending",
    });

    const res = await request(app).post("/auth/login").send({
      email: "pending-login@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(403);
    expect(res.body.msg).toMatch(/setup pending/i);
  });

  test("completes invite setup and activates account", async () => {
    const rawToken = "plain-invite-token";
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const passwordHash = await bcrypt.hash("OldPassword123!", 10);

    const account = await Account.create({
      email: "invite-user@example.com",
      password: passwordHash,
      roles: ["user"],
      status: "pending",
    });

    await InviteToken.create({
      accountId: account._id,
      email: account.email,
      tokenHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const res = await request(app).post("/auth/invite/complete").send({
      token: rawToken,
      newPassword: "NewPassword123!",
    });

    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/password set successfully/i);

    const updatedAccount = await Account.findById(account._id);
    expect(updatedAccount.status).toBe("active");
    expect(await bcrypt.compare("NewPassword123!", updatedAccount.password)).toBe(true);

    const usedInvite = await InviteToken.findOne({ accountId: account._id });
    expect(usedInvite.usedAt).not.toBeNull();
  });

  test("reactivates soft-deleted account and profile on register", async () => {
    const passwordHash = await bcrypt.hash("OldPassword123!", 10);

    const account = await Account.create({
      email: "reactivate-user@example.com",
      password: passwordHash,
      roles: ["user"],
      status: "blocked",
      isDeleted: true,
      deletedAt: new Date(),
    });

    await UserProfile.create({
      accountId: account._id,
      name: {
        firstName: "Old",
        lastName: "Name",
      },
      contact: {
        phone: 9999999999,
      },
      dob: new Date("1990-01-01T00:00:00.000Z"),
      gender: "Male",
      isDeleted: true,
      deletedAt: new Date(),
    });

    const res = await request(app).post("/auth/register/user").send({
      firstName: "New",
      lastName: "Name",
      email: "reactivate-user@example.com",
      phone: "8888888888",
      password: "BrandNew123!",
      dob: "1992-02-02",
      gender: "Female",
    });

    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/reactivated successfully/i);

    const reloadedAccount = await Account.findById(account._id);
    const reloadedProfile = await UserProfile.findOne({ accountId: account._id });

    expect(reloadedAccount.isDeleted).toBe(false);
    expect(reloadedAccount.status).toBe("active");
    expect(await bcrypt.compare("BrandNew123!", reloadedAccount.password)).toBe(true);

    expect(reloadedProfile.isDeleted).toBe(false);
    expect(reloadedProfile.name.firstName).toBe("New");
    expect(reloadedProfile.name.lastName).toBe("Name");
  });

  test("rolls back account creation when profile creation fails during register", async () => {
    const createSpy = jest
      .spyOn(UserProfile, "create")
      .mockRejectedValueOnce(new Error("Injected profile failure"));

    const res = await request(app).post("/auth/register/user").send({
      firstName: "Txn",
      lastName: "Rollback",
      email: "txn-rollback@example.com",
      phone: "7777777777",
      password: "Password123!",
      dob: "1993-03-03",
      gender: "Male",
    });

    expect(res.status).toBe(500);

    const account = await Account.findOne({ email: "txn-rollback@example.com" });
    expect(account).toBeNull();

    createSpy.mockRestore();
  });
});


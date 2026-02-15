import request from "supertest";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { jest } from "@jest/globals";

import Account from "../models/Account.js";
import UserProfile from "../models/UserProfile.js";
import InviteToken from "../models/InviteToken.js";
import { app } from "./helpers/fixtures.js";

const TEST_PASSWORD = "testpass-1";
const TEST_OLD_PASSWORD = "testpass-old";
const TEST_NEW_PASSWORD = "testpass-new";
const TEST_REACTIVATED_PASSWORD = "testpass-reactivated";
const TEST_INVITE_TOKEN = "test-invite-token-nonsecret";

describe("Auth onboarding critical flows", () => {
  test("blocks login for pending accounts", async () => {
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
    await Account.create({
      email: "pending-login@example.com",
      password: passwordHash,
      roles: ["user"],
      status: "pending",
    });

    const res = await request(app).post("/auth/login").send({
      email: "pending-login@example.com",
      password: TEST_PASSWORD,
    });

    expect(res.status).toBe(403);
    expect(res.body.msg).toMatch(/setup pending/i);
  });

  test("completes invite setup and activates account", async () => {
    const rawToken = TEST_INVITE_TOKEN;
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const passwordHash = await bcrypt.hash(TEST_OLD_PASSWORD, 10);

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
      newPassword: TEST_NEW_PASSWORD,
    });

    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/password set successfully/i);

    const updatedAccount = await Account.findById(account._id);
    expect(updatedAccount.status).toBe("active");
    expect(await bcrypt.compare(TEST_NEW_PASSWORD, updatedAccount.password)).toBe(true);

    const usedInvite = await InviteToken.findOne({ accountId: account._id });
    expect(usedInvite.usedAt).not.toBeNull();
  });

  test("reactivates soft-deleted account and profile on register", async () => {
    const passwordHash = await bcrypt.hash(TEST_OLD_PASSWORD, 10);

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
      password: TEST_REACTIVATED_PASSWORD,
      dob: "1992-02-02",
      gender: "Female",
    });

    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/reactivated successfully/i);

    const reloadedAccount = await Account.findById(account._id);
    const reloadedProfile = await UserProfile.findOne({ accountId: account._id });

    expect(reloadedAccount.isDeleted).toBe(false);
    expect(reloadedAccount.status).toBe("active");
    expect(await bcrypt.compare(TEST_REACTIVATED_PASSWORD, reloadedAccount.password)).toBe(true);

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
      password: TEST_PASSWORD,
      dob: "1993-03-03",
      gender: "Male",
    });

    expect(res.status).toBe(500);

    const account = await Account.findOne({ email: "txn-rollback@example.com" });
    expect(account).toBeNull();

    createSpy.mockRestore();
  });
});

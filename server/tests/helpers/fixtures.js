import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { createApp } from "../../app.js";
import Account from "../../models/Account.js";
import UserProfile from "../../models/UserProfile.js";
import DoctorProfile from "../../models/DoctorProfile.js";
import Specialty from "../../models/Specialty.js";

export const app = createApp();

export const createUserWithToken = async ({
  email = "user@example.com",
  password = "Password123!",
} = {}) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const account = await Account.create({
    email: email.toLowerCase(),
    password: passwordHash,
    roles: ["user"],
  });

  const profile = await UserProfile.create({
    accountId: account._id,
    name: {
      firstName: "Test",
      lastName: "User",
    },
    contact: {
      phone: 9999999999,
      emergency: 1111111111,
    },
    dob: new Date("1994-01-01T00:00:00.000Z"),
    gender: "Male",
  });

  const token = jwt.sign(
    {
      accountId: account._id,
      role: "user",
      roles: ["user"],
      profileId: profile._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  return {
    token,
    account,
    profile,
  };
};

export const createDoctorFixture = async ({
  email = "doctor@example.com",
  password = "Password123!",
  specialtyName = "Cardiology",
} = {}) => {
  const specialty = await Specialty.create({
    name: specialtyName,
    description: "Test specialty",
  });

  const passwordHash = await bcrypt.hash(password, 10);
  const account = await Account.create({
    email: email.toLowerCase(),
    password: passwordHash,
    roles: ["doctor"],
  });

  const doctor = await DoctorProfile.create({
    accountId: account._id,
    name: {
      firstName: "Test",
      lastName: "Doctor",
    },
    phone: 1234567890,
    gender: "Male",
    biography: "Bio",
    experience: 5,
    cost: 500,
    specialty: specialty._id,
    registrationStatus: "approved",
  });

  return { account, doctor, specialty };
};

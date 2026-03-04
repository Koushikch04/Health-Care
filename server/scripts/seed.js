import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";

import Account from "../models/Account.js";
import AdminProfile from "../models/AdminProfile.js";
import Appointment from "../models/Appointment.js";
import DoctorProfile from "../models/DoctorProfile.js";
import Review from "../models/Review.js";
import Specialty from "../models/Specialty.js";
import UserProfile from "../models/UserProfile.js";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/HealthCare";
const SEED_DOMAIN = "@seed.healthcare.local";
const DEFAULT_PASSWORD = "Seed@123";
const FORCE_SEED = String(process.env.FORCE_SEED || "").toLowerCase() === "true";

const FIRST_NAMES = [
  "Aarav",
  "Vihaan",
  "Ishaan",
  "Anaya",
  "Aditi",
  "Saanvi",
  "Reyansh",
  "Riya",
  "Kavya",
  "Arjun",
  "Meera",
  "Nisha",
  "Rohan",
  "Dev",
  "Priya",
  "Ira",
  "Tanvi",
  "Kabir",
  "Rahul",
  "Neha",
];

const LAST_NAMES = [
  "Sharma",
  "Patel",
  "Singh",
  "Kumar",
  "Reddy",
  "Gupta",
  "Joshi",
  "Iyer",
  "Nair",
  "Khanna",
  "Banerjee",
  "Jain",
  "Desai",
  "Mishra",
  "Kapoor",
];

const REASONS = [
  "Routine follow-up for hypertension",
  "Migraine episodes with light sensitivity",
  "Persistent lower back pain",
  "Seasonal allergic rhinitis symptoms",
  "Thyroid medication review",
  "Type 2 diabetes monthly check-in",
  "Knee pain after sports activity",
  "Intermittent chest discomfort assessment",
  "Anxiety and sleep quality concerns",
  "Post-viral fatigue and weakness",
];

const NOTE_SNIPPETS = [
  "Patient reports symptoms improved after medication adjustment.",
  "Vitals stable; advised hydration, diet plan, and follow-up tests.",
  "Recommended physiotherapy and posture correction exercises.",
  "Prescribed short course and asked for review in two weeks.",
  "Discussed lifestyle changes with measurable goals.",
  "Lab investigations advised before next visit.",
];

const REVIEW_COMMENTS = [
  "Doctor explained everything clearly and adjusted my treatment plan well.",
  "Very patient consultation and practical advice for daily routine.",
  "Follow-up was smooth, and symptoms are now much better.",
  "Professional experience overall, diagnosis felt accurate.",
  "Good bedside manner and clear next steps after tests.",
  "Helpful visit with realistic recommendations.",
];

const SPECIALTIES = [
  ["Cardiology", "Heart and blood vessel related conditions"],
  ["Dermatology", "Skin, hair, and nail care"],
  ["Neurology", "Nervous system disorders and headaches"],
  ["Orthopedics", "Bones, joints, and musculoskeletal injuries"],
  ["Endocrinology", "Hormonal disorders including diabetes and thyroid"],
  ["Pulmonology", "Respiratory system and lung diseases"],
  ["ENT", "Ear, nose, and throat treatments"],
  ["Psychiatry", "Mental health evaluation and treatment"],
];

const APPOINTMENT_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const randomDateBetween = (start, end) => {
  const ts = rand(start.getTime(), end.getTime());
  const dt = new Date(ts);
  dt.setUTCHours(0, 0, 0, 0);
  return dt;
};

const buildName = () => ({
  firstName: pick(FIRST_NAMES),
  lastName: pick(LAST_NAMES),
});

const clearPreviousSeedData = async () => {
  const escapedSeedDomain = escapeRegex(SEED_DOMAIN);
  const seededAccounts = await Account.find({
    email: { $regex: `${escapedSeedDomain}$`, $options: "i" },
  }).select("_id");

  if (!seededAccounts.length) return;

  const accountIds = seededAccounts.map((doc) => doc._id);
  const doctorProfiles = await DoctorProfile.find({
    accountId: { $in: accountIds },
  }).select("_id");
  const userProfiles = await UserProfile.find({
    accountId: { $in: accountIds },
  }).select("_id");

  const doctorIds = doctorProfiles.map((doc) => doc._id);
  const userIds = userProfiles.map((doc) => doc._id);

  const appointments = await Appointment.find({
    $or: [{ doctor: { $in: doctorIds } }, { user: { $in: userIds } }],
  }).select("_id");
  const appointmentIds = appointments.map((doc) => doc._id);

  await Review.deleteMany({
    $or: [
      { appointment: { $in: appointmentIds } },
      { doctor: { $in: doctorIds } },
      { user: { $in: userIds } },
    ],
  });
  await Appointment.deleteMany({
    _id: { $in: appointmentIds },
  });
  await AdminProfile.deleteMany({ accountId: { $in: accountIds } });
  await DoctorProfile.deleteMany({ accountId: { $in: accountIds } });
  await UserProfile.deleteMany({ accountId: { $in: accountIds } });
  await Account.deleteMany({ _id: { $in: accountIds } });
};

const createSpecialties = async () => {
  const operations = SPECIALTIES.map(([name, description]) => ({
    updateOne: {
      filter: { name },
      update: { $set: { name, description } },
      upsert: true,
    },
  }));
  await Specialty.bulkWrite(operations);
  return Specialty.find({ name: { $in: SPECIALTIES.map((s) => s[0]) } });
};

const createAdmin = async (passwordHash) => {
  const email = `seed.admin${SEED_DOMAIN}`;
  const [account] = await Account.create([
    {
      email,
      password: passwordHash,
      roles: ["admin"],
      status: "active",
    },
  ]);

  await AdminProfile.create({
    accountId: account._id,
    name: { firstName: "Seed", lastName: "Admin" },
    role: "admin",
    permissions: {
      userManagement: true,
      doctorManagement: true,
      appointmentManagement: true,
      analyticsView: true,
    },
  });
};

const createDoctors = async (specialties, passwordHash) => {
  const doctorCount = 14;
  const doctors = [];

  for (let index = 1; index <= doctorCount; index += 1) {
    const name = buildName();
    const email = `seed.doctor${index}${SEED_DOMAIN}`;
    const specialty = specialties[index % specialties.length];

    const [account] = await Account.create([
      {
        email,
        password: passwordHash,
        roles: ["doctor"],
        status: "active",
      },
    ]);

    const profile = await DoctorProfile.create({
      accountId: account._id,
      name,
      gender: index % 3 === 0 ? "Female" : "Male",
      phone: Number(`98${rand(10000000, 99999999)}`),
      biography: `${specialty.name} specialist focused on evidence-based treatment and continuity of care.`,
      experience: rand(4, 24),
      cost: rand(400, 1800),
      specialty: specialty._id,
      registrationStatus: "approved",
      availability: {
        workingDays: [1, 2, 3, 4, 5, 6],
        workingHours: { start: "09:00", end: "17:00" },
        breaks: [{ start: "13:00", end: "14:00" }],
        slotIntervalMinutes: 30,
      },
    });

    doctors.push(profile);
  }

  return doctors;
};

const createUsers = async (passwordHash) => {
  const userCount = 80;
  const users = [];

  for (let index = 1; index <= userCount; index += 1) {
    const name = buildName();
    const email = `seed.user${index}${SEED_DOMAIN}`;
    const dobYear = rand(1968, 2004);
    const dobMonth = rand(0, 11);
    const dobDate = rand(1, 28);

    const [account] = await Account.create([
      {
        email,
        password: passwordHash,
        roles: ["user"],
        status: "active",
      },
    ]);

    const profile = await UserProfile.create({
      accountId: account._id,
      name,
      contact: {
        phone: Number(`97${rand(10000000, 99999999)}`),
        emergency: Number(`96${rand(10000000, 99999999)}`),
      },
      dob: new Date(Date.UTC(dobYear, dobMonth, dobDate)),
      gender: index % 3 === 0 ? "Female" : index % 5 === 0 ? "Other" : "Male",
    });

    users.push(profile);
  }

  return users;
};

const createAppointments = async ({ doctors, users }) => {
  const appointments = [];
  const uniqueKeys = new Set();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const pastStart = new Date(today);
  pastStart.setUTCDate(today.getUTCDate() - 180);

  const futureEnd = new Date(today);
  futureEnd.setUTCDate(today.getUTCDate() + 21);

  const targetCount = 650;
  let guard = 0;

  while (appointments.length < targetCount && guard < targetCount * 20) {
    guard += 1;
    const doctor = pick(doctors);
    const user = pick(users);
    const slot = pick(APPOINTMENT_SLOTS);

    const isPast = Math.random() < 0.78;
    const date = isPast
      ? randomDateBetween(pastStart, today)
      : randomDateBetween(today, futureEnd);
    const dateKey = date.toISOString().slice(0, 10);
    const uniqueKey = `${doctor._id.toString()}|${dateKey}|${slot}`;
    if (uniqueKeys.has(uniqueKey)) continue;
    uniqueKeys.add(uniqueKey);

    let status = "scheduled";
    if (isPast) {
      const roll = Math.random();
      if (roll < 0.64) status = "completed";
      else if (roll < 0.88) status = "canceled";
      else status = "scheduled";
    } else if (Math.random() < 0.1) {
      status = "canceled";
    }

    const patientName = `${user.name?.firstName || "Patient"} ${user.name?.lastName || ""}`.trim();

    appointments.push({
      doctor: doctor._id,
      user: user._id,
      patientName,
      reasonForVisit: pick(REASONS),
      additionalNotes: Math.random() < 0.6 ? pick(NOTE_SNIPPETS) : "",
      date,
      time: slot,
      status,
      reviewed: false,
    });
  }

  return Appointment.insertMany(appointments);
};

const createReviewsAndRatings = async ({ appointments, doctors }) => {
  const reviewDocs = [];
  const appointmentIdsToMarkReviewed = [];

  for (const appt of appointments) {
    if (appt.status !== "completed") continue;
    if (Math.random() > 0.62) continue;

    reviewDocs.push({
      doctor: appt.doctor,
      user: appt.user,
      appointment: appt._id,
      rating: rand(3, 5),
      comment: pick(REVIEW_COMMENTS),
      createdAt: new Date(
        appt.date.getTime() + rand(1, 5) * 24 * 60 * 60 * 1000,
      ),
    });
    appointmentIdsToMarkReviewed.push(appt._id);
  }

  if (reviewDocs.length) {
    await Review.insertMany(reviewDocs, { ordered: false });
    await Appointment.updateMany(
      { _id: { $in: appointmentIdsToMarkReviewed } },
      { $set: { reviewed: true } },
    );
  }

  const ratingStats = await Review.aggregate([
    {
      $group: {
        _id: "$doctor",
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const ratingByDoctor = new Map(
    ratingStats.map((doc) => [
      doc._id.toString(),
      { average: Number(doc.average.toFixed(2)), count: doc.count },
    ]),
  );

  const updates = doctors.map((doctor) => {
    const rating = ratingByDoctor.get(doctor._id.toString()) || {
      average: 0,
      count: 0,
    };
    return {
      updateOne: {
        filter: { _id: doctor._id },
        update: { $set: { rating } },
      },
    };
  });

  await DoctorProfile.bulkWrite(updates);
  return reviewDocs.length;
};

const run = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log(`[seed] Connected to ${MONGO_URL}`);

    const [accountCount, doctorCount, userCount, appointmentCount, reviewCount] =
      await Promise.all([
        Account.countDocuments(),
        DoctorProfile.countDocuments(),
        UserProfile.countDocuments(),
        Appointment.countDocuments(),
        Review.countDocuments(),
      ]);

    const hasExistingData =
      accountCount > 0 ||
      doctorCount > 0 ||
      userCount > 0 ||
      appointmentCount > 0 ||
      reviewCount > 0;

    if (hasExistingData && !FORCE_SEED) {
      console.log(
        "[seed] Skipped: database already has data. Seed runs only on empty DB by default.",
      );
      console.log("[seed] Set FORCE_SEED=true to reseed seed-generated records.");
      return;
    }

    if (FORCE_SEED) {
      await clearPreviousSeedData();
    }

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const specialties = await createSpecialties();
    await createAdmin(passwordHash);
    const doctors = await createDoctors(specialties, passwordHash);
    const users = await createUsers(passwordHash);
    const appointments = await createAppointments({ doctors, users });
    const createdReviewCount = await createReviewsAndRatings({
      appointments,
      doctors,
    });

    const statusSummary = appointments.reduce(
      (acc, item) => {
        acc[item.status] += 1;
        return acc;
      },
      { scheduled: 0, completed: 0, canceled: 0 },
    );

    console.log("[seed] Completed.");
    console.log(`[seed] Admin login: seed.admin${SEED_DOMAIN} / ${DEFAULT_PASSWORD}`);
    console.log(`[seed] Doctor/User password for all seed accounts: ${DEFAULT_PASSWORD}`);
    console.log(`[seed] Specialties: ${specialties.length}`);
    console.log(`[seed] Doctors: ${doctors.length}`);
    console.log(`[seed] Users: ${users.length}`);
    console.log(
      `[seed] Appointments: ${appointments.length} (scheduled=${statusSummary.scheduled}, completed=${statusSummary.completed}, canceled=${statusSummary.canceled})`,
    );
    console.log(`[seed] Reviews: ${createdReviewCount}`);
  } catch (error) {
    console.error("[seed] Failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();

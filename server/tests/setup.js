import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
  process.env.OTP_LENGTH = process.env.OTP_LENGTH || "6";

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);

  const { default: Appointment } = await import("../models/Appointment.js");
  await Appointment.syncIndexes();
});

beforeEach(async () => {
  const { collections } = mongoose.connection;
  const deletePromises = Object.values(collections).map((collection) =>
    collection.deleteMany({})
  );
  await Promise.all(deletePromises);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});


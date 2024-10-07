import mongoose from "mongoose";

const Schema = mongoose.Schema;

const nameSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    min: 2,
    max: 50,
  },
  lastName: {
    type: String,
    required: false,
    min: 2,
    max: 50,
  },
});

const emailSchema = new Schema({
  type: String,
  required: true,
  unique: true,
  max: 50,
  match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
});

const phoneSchema = new Schema({
  phone: {
    type: Number,
    required: true,
  },
  emergency: {
    type: Number,
    required: false,
  },
});
const userSchema = new Schema({
  name: nameSchema,
  contact: phoneSchema,
  email: emailSchema,
  password: {
    type: String,
    required: true,
    min: 8,
  },
  appointments: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],
    default: [],
  },
});

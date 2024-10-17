import mongoose from "mongoose";

const Schema = mongoose.Schema;

const OtpSchema = Schema({
  email: {
    type: String,
    required: true,
  },
  otpNumber: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    default: Date.now,
    // expires: 60 * 5,
    expires: "1m",
  },
});

const Otp = mongoose.model("Otp", OtpSchema);

export default Otp;

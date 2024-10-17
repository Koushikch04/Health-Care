import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import dotenv from "dotenv";

import sendMail from "../middleware/sendMail.js";

import User from "../models/User.js";
import Otp from "../models/Otp.js";

export const validateAndOtpSender = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user)
      return res.status(401).json({
        title: "Failed",
        message: "UserId does not exist!",
        status: "failure",
      });
    await Otp.deleteMany({ email });

    const otpNumber = otpGenerator.generate(process.env.OTP_LENGTH, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    await sendMail({ email: email, otp: otpNumber });
    const otp = new Otp({ email, otpNumber });
    await otp.save();

    return res.status(201).json({
      title: "Success",
      message: "Otp sent Successfully!",
      status: "success",
    });
  } catch (error) {
    return res
      .status(501)
      .json({ message: error.message, title: "Failure", status: "Failure" });
  }
};

export const validateOtp = async (req, res) => {
  try {
    const { email, otpNumber } = req.body;
    const otp = await Otp.findOne({ email, otpNumber });

    if (!otp) {
      return res.status(401).json({
        title: "Validation Failed",
        message: "Invalid OTP!",
        status: "failure",
      });
    }

    // if (!req.session) {
    //   return res.status(500).json({
    //     title: "Session Error",
    //     message: "Session is not initialized.",
    //     status: "failure",
    //   });
    // }
    // req.session.verifiedEmail = email;

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });

    await Otp.deleteOne({ email, otpNumber });

    return res.status(200).json({
      message: "OTP successfully validated!",
      status: "success",
      title: "Success!",
      token,
    });
  } catch (error) {
    return res
      .status(510)
      .json({ title: "Error", message: error.message, status: "failure" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        title: "Unauthorized",
        message: "Token is missing. Please validate your OTP first.",
        status: "failure",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        title: "Unauthorized",
        message: "Token is invalid or has expired.",
        status: "failure",
      });
    }
    const email = decoded.email;

    // if (!req.session || req.session.verifiedEmail !== email) {
    //   return res.status(403).json({
    //     title: "Unauthorized",
    //     message: "You must verify your OTP before changing the password.",
    //     status: "failure",
    //   });
    // }
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const user = await User.findOneAndUpdate(
      { email: email },
      { password: passwordHash },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        title: "User Not Found",
        message: "User not found for this email!",
        status: "failure",
      });
    }

    // delete req.session.verifiedEmail;

    return res.status(200).json({
      title: "Success!",
      message: "Password changed successfully! ",
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({
      title: "Password reset error",
      message: error.message,
      status: "failure",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    let person;
    const salt = await bcrypt.genSalt();
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    let matched = false;
    person = await User.findOne({ email: email });
    console.log(person, email);
    if (bcrypt.compareSync(oldPassword, person.password)) {
      matched = true;
      person = await User.findOneAndUpdate(
        { email },
        { password: newPasswordHash }
      );
      console.log(await User.find({ email: email }), newPasswordHash);
    }
    if (!matched) {
      return res.status(404).json({
        title: "Failure!",
        message: "Old password did not match",
        status: "failure",
      });
    }
    return res.status(200).json({
      title: "Success!",
      message: "Password changed successfully! ",
      status: "success",
    });
  } catch (error) {
    return res.status(501).json({
      title: "Password reset error",
      message: error.message,
      status: "failure",
    });
  }
};

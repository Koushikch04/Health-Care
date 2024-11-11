import bcrypt from "bcrypt";
import User from "../models/User.js";
import { login as adminLogin } from "./admin.js";
import { login as userLogin } from "./user.js";
import { login as doctorLogin } from "./doctor.js";
export const registerUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      emergency,
      password,
      dob,
      gender,
    } = req.body;

    if (!email) return res.status(400).json({ msg: "Email is required." });
    if (!firstName || !lastName || !phone || !password || !dob || !gender) {
      return res.status(400).json({ msg: "All fields are required." });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json({ msg: "Email already exists." });
    }

    const date = new Date(dob);
    if (isNaN(date.getTime()))
      return res.status(400).json({ msg: "Invalid Date of Birth." });

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const userData = {
      name: { firstName, lastName },
      contact: { phone, emergency },
      email,
      password: passwordHash,
      dob: date,
      gender,
      // profileImage,
    };

    const person = new User(userData);
    await person.save();

    res.status(201).json({ msg: "User registered successfully", person });
  } catch (err) {
    console.log(err);

    if (err.code === 11000) {
      return res.status(409).json({ msg: "Email already exists." });
    }

    res.status(500).json({ msg: "An internal server error occurred." });
  }
};

export const login = async (req, res, next) => {
  try {
    const { userType } = req.body;
    console.log(userType);

    let handler;
    if (userType === "user") {
      handler = userLogin;
    } else if (userType === "doctor") {
      handler = doctorLogin;
    } else if (userType === "admin") {
      handler = adminLogin;
    } else {
      return res.status(400).json({ msg: "Invalid user type" });
    }
    return handler(req, res);
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ msg: "An internal server error occurred." });
  }
};

export const logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully." });
};

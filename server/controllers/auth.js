import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
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

    if (!email) return res.status(400).json({ error: "Email is required." });
    if (!firstName || !lastName || !phone || !password || !dob || !gender) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists." });
    }

    const date = new Date(dob);
    if (isNaN(date.getTime()))
      return res.status(400).json({ error: "Invalid Date of Birth." });

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const userData = {
      name: { firstName, lastName },
      contact: { phone, emergency },
      email,
      password: passwordHash,
      dob: date,
      gender,
    };

    const user = new User(userData);
    await user.save();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.log(err);

    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already exists." });
    }

    res.status(500).json({ error: "An internal server error occurred." });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let person;
    person = await User.findOne({ email });
    if (!person) return res.status(400).json({ msg: "User does not exist. " });
    const matched = bcrypt.compareSync(password, person.password);

    if (!matched) return res.status(401).json({ msg: "Invalid Credentials" });
    person.password = "";

    // const token = jwt.sign({ id: person._id }, process.env.JWT_SECRET);
    // await person.populate("appointment.appointmentid");
    // req.session.isLoggedIn = true;

    const token = jwt.sign({ id: person._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token, person });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

export const logout = (req, res) => {
  // req.session.destroy((err) => {
  //   if (err) {
  //     return res.status(500).json({ error: "Could not log out." });
  //   }
  // });
  res.status(200).json({ message: "Logged out successfully." });
};

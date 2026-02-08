import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Account from "../models/Account.js";
import UserProfile from "../models/UserProfile.js";
import DoctorProfile from "../models/DoctorProfile.js";
import AdminProfile from "../models/AdminProfile.js";

const rolePriority = ["superadmin", "admin", "doctor", "user"];

const pickPrimaryRole = (roles = []) => {
  for (const role of rolePriority) {
    if (roles.includes(role)) return role;
  }
  return "user";
};
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

    const existingAccount = await Account.findOne({
      email: email.toLowerCase(),
    });
    if (existingAccount) {
      return res.status(409).json({ msg: "Email already exists." });
    }

    const date = new Date(dob);
    if (isNaN(date.getTime()))
      return res.status(400).json({ msg: "Invalid Date of Birth." });

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const account = await Account.create({
      email: email.toLowerCase(),
      password: passwordHash,
      roles: ["user"],
    });

    const profile = await UserProfile.create({
      accountId: account._id,
      name: { firstName, lastName },
      contact: { phone, emergency },
      dob: date,
      gender,
    });

    res.status(201).json({
      msg: "User registered successfully",
      person: profile,
      account: { id: account._id, email: account.email, roles: account.roles },
    });
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required." });
    }

    const account = await Account.findOne({ email: email.toLowerCase() });
    if (!account) {
      return res.status(400).json({ msg: "User does not exist." });
    }

    if (account.status === "blocked") {
      return res.status(403).json({ msg: "Account is blocked." });
    }

    const matched = await bcrypt.compare(password, account.password);
    if (!matched) {
      return res.status(401).json({ msg: "Invalid Credentials" });
    }

    const primaryRole = pickPrimaryRole(account.roles);

    let person = null;
    if (primaryRole === "doctor") {
      person = await DoctorProfile.findOne({ accountId: account._id }).populate(
        "specialty"
      );
    } else if (primaryRole === "admin" || primaryRole === "superadmin") {
      person = await AdminProfile.findOne({ accountId: account._id });
    } else {
      person = await UserProfile.findOne({ accountId: account._id });
    }

    if (primaryRole === "doctor" && person) {
      person = { ...person.toObject(), rating: person.rating?.average ?? 0 };
    }

    const token = jwt.sign(
      {
        accountId: account._id,
        role: primaryRole,
        roles: account.roles,
        profileId: person?._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    account.lastLogin = new Date();
    await account.save();

    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    return res.status(200).json({
      token,
      person,
      role: primaryRole,
      roles: account.roles,
      account: { id: account._id, email: account.email, roles: account.roles },
      expiresAt,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ msg: "An internal server error occurred." });
  }
};

export const logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully." });
};

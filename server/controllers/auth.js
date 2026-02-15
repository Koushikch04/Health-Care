import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";
import Account from "../models/Account.js";
import UserProfile from "../models/UserProfile.js";
import DoctorProfile from "../models/DoctorProfile.js";
import AdminProfile from "../models/AdminProfile.js";
import InviteToken from "../models/InviteToken.js";

const rolePriority = ["superadmin", "admin", "doctor", "user"];

const pickPrimaryRole = (roles = []) => {
  for (const role of rolePriority) {
    if (roles.includes(role)) return role;
  }
  return "user";
};
export const registerUser = async (req, res, next) => {
  const session = await mongoose.startSession();
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

    const date = new Date(dob);
    if (isNaN(date.getTime()))
      return res.status(400).json({ msg: "Invalid Date of Birth." });

    await session.startTransaction();

    const existingAccount = await Account.findOne({
      email: email.toLowerCase(),
    }).session(session);

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    if (existingAccount && !existingAccount.isDeleted) {
      await session.abortTransaction();
      return res.status(409).json({ msg: "Email already exists." });
    }

    let account;
    let profile;

    if (existingAccount?.isDeleted) {
      existingAccount.password = passwordHash;
      existingAccount.roles = ["user"];
      existingAccount.status = "active";
      existingAccount.isDeleted = false;
      existingAccount.deletedAt = null;
      account = await existingAccount.save({ session });

      const existingProfile = await UserProfile.findOne({
        accountId: account._id,
      }).session(session);

      if (existingProfile) {
        existingProfile.name = { firstName, lastName };
        existingProfile.contact = { phone, emergency };
        existingProfile.dob = date;
        existingProfile.gender = gender;
        existingProfile.isDeleted = false;
        existingProfile.deletedAt = null;
        profile = await existingProfile.save({ session });
      } else {
        [profile] = await UserProfile.create(
          [
            {
              accountId: account._id,
              name: { firstName, lastName },
              contact: { phone, emergency },
              dob: date,
              gender,
              isDeleted: false,
              deletedAt: null,
            },
          ],
          { session }
        );
      }
    } else {
      [account] = await Account.create(
        [
          {
            email: email.toLowerCase(),
            password: passwordHash,
            roles: ["user"],
          },
        ],
        { session }
      );

      [profile] = await UserProfile.create(
        [
          {
            accountId: account._id,
            name: { firstName, lastName },
            contact: { phone, emergency },
            dob: date,
            gender,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();

    res.status(existingAccount?.isDeleted ? 200 : 201).json({
      msg: existingAccount?.isDeleted
        ? "Account reactivated successfully"
        : "User registered successfully",
      person: profile,
      account: { id: account._id, email: account.email, roles: account.roles },
    });
  } catch (err) {
    console.log(err);
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    if (err.code === 11000) {
      return res.status(409).json({ msg: "Email already exists." });
    }

    res.status(500).json({ msg: "An internal server error occurred." });
  } finally {
    session.endSession();
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

    if (account.isDeleted) {
      return res.status(403).json({ msg: "Account is deleted." });
    }

    if (account.status === "blocked") {
      return res.status(403).json({ msg: "Account is blocked." });
    }

    if (account.status === "pending") {
      return res.status(403).json({
        msg: "Account setup pending. Please use your invite email to set password.",
      });
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

export const completeInviteSetup = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const inviteToken = await InviteToken.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!inviteToken) {
      return res.status(400).json({
        msg: "Invite link is invalid or expired.",
      });
    }

    const account = await Account.findById(inviteToken.accountId);
    if (!account || account.isDeleted) {
      return res.status(404).json({ msg: "Account not found." });
    }

    const isSamePassword = await bcrypt.compare(newPassword, account.password);
    if (isSamePassword) {
      return res.status(400).json({
        msg: "New password must be different from the current password.",
      });
    }

    const salt = await bcrypt.genSalt();
    account.password = await bcrypt.hash(newPassword, salt);
    account.status = "active";
    await account.save();

    inviteToken.usedAt = new Date();
    await inviteToken.save();

    await InviteToken.updateMany(
      {
        accountId: account._id,
        usedAt: null,
        _id: { $ne: inviteToken._id },
      },
      {
        $set: { usedAt: new Date() },
      }
    );

    return res.status(200).json({
      msg: "Password set successfully. You can now log in.",
    });
  } catch (error) {
    return res.status(500).json({ msg: "An internal server error occurred." });
  }
};

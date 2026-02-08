import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Account from "../models/Account.js";
import UserProfile from "../models/UserProfile.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const account = await Account.findOne({ email: email.toLowerCase() });
    if (!account) return res.status(400).json({ msg: "User does not exist. " });
    if (!account.roles.includes("user")) {
      return res.status(403).json({ msg: "Access denied." });
    }

    const matched = bcrypt.compareSync(password, account.password);
    if (!matched) return res.status(401).json({ msg: "Invalid Credentials" });

    const person = await UserProfile.findOne({ accountId: account._id });

    const token = jwt.sign(
      {
        accountId: account._id,
        role: "user",
        roles: account.roles,
        profileId: person?._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    return res.status(200).json({
      token,
      person,
      role: "user",
      expiresAt,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ msg: "An internal server error occurred." });
  }
};

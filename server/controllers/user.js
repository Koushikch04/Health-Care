import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let person;
    person = await User.findOne({ email });
    if (!person) return res.status(400).json({ msg: "User does not exist. " });
    const matched = bcrypt.compareSync(password, person.password);

    if (!matched) return res.status(401).json({ msg: "Invalid Credentials" });
    person.password = "";

    const token = jwt.sign({ id: person._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

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

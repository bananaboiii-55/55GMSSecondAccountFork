import express from "express";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { User } from "../models/index.js";
const router = express.Router();

const hashPassword = (password, salt) =>
  crypto.scryptSync(password, salt, 64).toString("hex");

const generateSalt = () => crypto.randomBytes(16).toString("hex");

router.post("/signup", async (req, res) => {
  let { password, username } = req.body;

  if (!password || !username) {
    return res.status(400).json({ error: "Not enough arguments" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password too short" });
  }
  if (username.length < 3) {
    return res.status(400).json({ error: "Username too short" });
  }

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    const uuid = uuidv4();

    const user = await User.create({
      uuid,
      username,
      passwordHash,
      salt,
      premium: false,
    });

    res.status(200).json({
      uuid: user.uuid,
      username: user.username,
      premium: user.premium,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});

router.post("/login", async (req, res) => {
  let { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Not enough arguments" });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const passwordHash = hashPassword(password, user.salt);
    if (passwordHash !== user.passwordHash) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.status(200).json({
      uuid: user.uuid,
      username: user.username,
      premium: user.premium,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
});

export default router;

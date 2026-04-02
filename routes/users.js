import express from "express";
import { User } from "../models/index.js";
const router = express.Router();

router.post("/checkPremium", async (req, res) => {
  let { uuid } = req.body;

  if (!uuid) {
    return res.status(400).json({ error: "Not enough arguments" });
  }

  try {
    const user = await User.findByPk(uuid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ premium: user.premium });
  } catch (error) {
    console.error("checkPremium error:", error);
    res.status(500).json({ error: "An error occurred while checking premium status." });
  }
});

router.post("/uploadSave", async (req, res) => {
  let saveData = req.body;
  let uuid = req.headers["uuid"];

  if (saveData == null || !uuid) {
    return res.status(400).json({ error: "Not enough arguments" });
  }

  try {
    const user = await User.findByPk(uuid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.saveData = typeof saveData === "string" ? saveData : JSON.stringify(saveData);
    await user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("uploadSave error:", error);
    res.status(500).json({ error: "An error occurred while uploading your save." });
  }
});

router.post("/readSave", async (req, res) => {
  let { uuid } = req.body;

  if (!uuid) {
    return res.status(400).json({ error: "Not enough arguments" });
  }

  try {
    const user = await User.findByPk(uuid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ saveData: user.saveData || null });
  } catch (error) {
    console.error("readSave error:", error);
    res.status(500).json({ error: "An error occurred while reading your save." });
  }
});

export default router;

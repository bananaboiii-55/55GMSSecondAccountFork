import express from "express";
import axios from "axios";
const router = express.Router();

router.post("/signup", async (req, res) => {
  let { password, username, premium = false } = req.body;

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
    const response = await axios.post(
      "https://db.55gms.com/api/signup",
      {
        username,
        password,
        premium,
      },
      {
        headers: {
          Authorization: process.env.workerAUTH,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  let { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Not enough arguments" });
  }

  try {
    const response = await axios.post(
      "https://db.55gms.com/api/login",
      {
        username,
        password,
      },
      {
        headers: {
          Authorization: process.env.workerAUTH,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Invalid Email or password" });
  }
});

export default router;

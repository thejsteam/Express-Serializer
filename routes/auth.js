const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { validationResult } = require("express-validator");
const { User, RefreshToken } = require("../models"); // Import your User model
const { serializeUser } = require("../utils/serializer"); // Import the serializer function

router.use(express.json());

// Register a new user
router.post("/register", async (req, res) => {
  const { username, password, email, phone_number } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      phone_number,
    });

    const serializedUser = serializeUser(user);

    res.json({ message: "User registered successfully", user: serializedUser });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map((err) => err.message);
      return res.status(400).json({ errors: validationErrors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      let errorMessage = "This field is already taken";

      if (error.fields.username) {
        errorMessage = "Username is already taken";
      } else if (error.fields.email) {
        errorMessage = "Email is already taken";
      } else if (error.fields.phone_number) {
        errorMessage = "Phone number is already taken";
      }

      return res.status(400).json({ error: errorMessage });
    } else {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      res.status(401).json({ error: "Invalid credentials here" });
      return;
    }

    if (!bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ error: "Invalid credentials compared" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      "testkey123",
      {
        expiresIn: "5m", // Token expiration time
      }
    );

    // Check if the user already has a refresh token
    let refreshToken = await RefreshToken.findOne({
      where: { user_id: user.id },
    });

    if (!refreshToken) {
      // If no refresh token exists, generate a new one
      refreshToken = jwt.sign({ userId: user.id }, "refreshKey", {
        expiresIn: "1d",
      });

      // Create a new refresh token entry
      await RefreshToken.create({
        user_id: user.id,
        refresh_token: refreshToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      });
    } else {
      // If a refresh token already exists, update its expiration time
      refreshToken.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Update expiration to 1 day from now
      await refreshToken.save();
      refreshToken = refreshToken.refresh_token; // Get the updated refresh token value
    }

    const serializedUser = serializeUser(user);

    res.json({ token, refreshToken });
    //, user: serializedUser
  } catch (err) {
    console.error("Error retrieving user:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;

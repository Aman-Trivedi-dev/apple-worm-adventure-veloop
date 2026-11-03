import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";

const router = express.Router();

// Initialize Google OAuth2 Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST: Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Check required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required",
      });
    }

    // 2. Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // 3. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 4. Check if user already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // 5. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 6. Create user
    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    // 7. Send response without password hash
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        totalScore: user.totalScore,
        coins: user.coins,
        unlockedLevel: user.unlockedLevel,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// POST: Login an existing user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Also check user.passwordHash exists in case the user registered via Google only
    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 5. Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6. Send successful response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        totalScore: user.totalScore,
        coins: user.coins,
        unlockedLevel: user.unlockedLevel,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// POST: Google Login
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    // 1. Check Google credential
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    // 2. Verify Google credential
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.email_verified) {
      return res.status(401).json({
        success: false,
        message: "Google account verification failed",
      });
    }

    // 3. Normalize email
    const normalizedEmail = payload.email.trim().toLowerCase();

    // 4. Find existing user
    let user = await User.findOne({
      email: normalizedEmail,
    });

    // 5. Create user if not already registered
    if (!user) {
      const username =
        payload.name ||
        normalizedEmail.split("@")[0];

      // Generate a random password hash for Google-only accounts
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const passwordHash = await bcrypt.hash(randomPassword, 12);

      user = await User.create({
        username,
        email: normalizedEmail,
        passwordHash,
      });
    }

    // 6. Generate application JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 7. Return user and token
    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        totalScore: user.totalScore,
        coins: user.coins,
        unlockedLevel: user.unlockedLevel,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(401).json({
      success: false,
      message: "Google login failed. Please try again.",
    });
  }
});

export default router;
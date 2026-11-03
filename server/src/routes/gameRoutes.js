import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// POST: Update game progress
router.post("/progress", protect, async (req, res) => {
  try {
    const { score, coins, completedLevel } = req.body || {};

    // 1. Validate input
    if (
      typeof score !== "number" ||
      typeof coins !== "number" ||
      typeof completedLevel !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Score, coins, and completedLevel must be numbers",
      });
    }

    if (score < 0 || coins < 0 || completedLevel < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid game progress values",
      });
    }

    // 2. Update logged-in user's progress using req.userId from authMiddleware
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $max: {
          totalScore: score,
          unlockedLevel: completedLevel + 1,
        },
        $inc: {
          coins: coins,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Send response
    return res.status(200).json({
      success: true,
      message: "Game progress updated successfully",
      user,
    });
  } catch (error) {
    console.error("Game progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET: Fetch logged-in user's game progress
router.get("/progress", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("username totalScore coins unlockedLevel")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Game progress fetched successfully",
      progress: {
        username: user.username,
        totalScore: user.totalScore,
        coins: user.coins,
        unlockedLevel: user.unlockedLevel,
      },
    });
  } catch (error) {
    console.error("Get progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
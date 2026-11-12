
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getGameProgress,
  completeLevel,
} from "../controllers/gameController.js";

const router = express.Router();

// Fetch logged-in user's game progress
router.get("/progress", protect, getGameProgress);

// Complete a game level
router.post("/complete", protect, completeLevel);

export default router;

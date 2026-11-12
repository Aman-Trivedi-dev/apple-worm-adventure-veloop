
import express from "express";

import {
  createAdRewardSession,
  completeAdReward,
} from "../controllers/adController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Both routes require a logged-in user
router.post("/session", protect, createAdRewardSession);
router.post("/complete", protect, completeAdReward);

export default router;

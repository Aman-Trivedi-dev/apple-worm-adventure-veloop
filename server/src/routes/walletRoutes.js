import express from "express";

import {
  getBalance,
  getHistory,
} from "../controllers/walletController.js";

// Import your existing authentication middleware here
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get logged-in user's wallet balance
router.get("/balance", protect, getBalance);

// Get logged-in user's wallet transaction history
router.get("/history", protect, getHistory);

export default router;
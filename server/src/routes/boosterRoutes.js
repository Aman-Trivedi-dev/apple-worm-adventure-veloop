
import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  buyBooster,
  getBoosterInventory,
  useBooster,
} from "../controllers/boosterController.js";

const router = express.Router();

router.post("/purchase", protect, buyBooster);
router.get("/inventory", protect, getBoosterInventory);
router.post("/activate", protect, useBooster);

export default router;

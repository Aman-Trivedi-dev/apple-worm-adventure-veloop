import express from "express";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import gameRoutes from "./routes/gameRoutes.js";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Apple Worm Adventure API is running!"
  });
});


app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

app.use("/api/game", gameRoutes);
app.use("/api/auth", authRoutes);

export default app;
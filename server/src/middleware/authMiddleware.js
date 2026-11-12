
import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      // Temporary JWT diagnostics
      console.log(
        "JWT secret loaded:",
        Boolean(process.env.JWT_SECRET)
      );

      console.log(
        "JWT secret length:",
        process.env.JWT_SECRET?.length
      );

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      req.userId = decoded.userId;
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError.message);

      const isExpired = jwtError.name === "TokenExpiredError";

      return res.status(401).json({
        success: false,
        message: isExpired
          ? "Token expired, please log in again"
          : "Invalid token",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default protect;

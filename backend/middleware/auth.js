import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware to protect routes that require authentication
 */
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Handle admin token
      if (decoded.id === "admin") {
        req.user = {
          _id: "admin",
          role: "admin",
          name: "Admin",
          email: process.env.ADMIN_EMAIL,
          isActive: true,
          profile: {
            id: "admin",
            name: "Admin",
            email: process.env.ADMIN_EMAIL,
            role: "admin",
            avatarUrl: null,
            points: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };
        return next();
      }

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          status: "error",
          message: "User not found",
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(401).json({
          status: "error",
          message: "User account is deactivated",
        });
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "No token provided",
    });
  }
};

/**
 * Middleware to restrict access to admin users only
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      status: "error",
      message: "Access denied. Admin privileges required.",
    });
  }
};

/**
 * Middleware to check if user owns the resource or is admin
 */
const authorize = (resourceUserId) => {
  return (req, res, next) => {
    if (
      req.user.role === "admin" ||
      req.user._id.toString() === resourceUserId.toString()
    ) {
      next();
    } else {
      return res.status(403).json({
        status: "error",
        message: "Access denied. You can only modify your own resources.",
      });
    }
  };
};

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export { protect, admin, authorize, generateToken };

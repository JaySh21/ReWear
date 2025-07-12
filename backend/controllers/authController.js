import User from "../models/User.js";
import { generateToken } from "../middleware/auth.js";

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "User with this email already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user: user.profile,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Registration failed",
      error: error.message,
    });
  }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Handle admin login
    if (role === "admin") {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminEmail || !adminPassword) {
        return res.status(500).json({
          status: "error",
          message: "Admin credentials not configured",
        });
      }

      if (email !== adminEmail || password !== adminPassword) {
        return res.status(401).json({
          status: "error",
          message: "Invalid admin credentials",
        });
      }

      // Create admin user object for token generation
      const adminUser = {
        _id: "admin",
        role: "admin",
        name: "Admin",
        email: adminEmail,
        profile: {
          id: "admin",
          name: "Admin",
          email: adminEmail,
          role: "admin",
          avatarUrl: null,
          points: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const token = generateToken(adminUser._id);

      res.json({
        status: "success",
        message: "Admin login successful",
        data: {
          user: adminUser.profile,
          token,
        },
      });
      return;
    }

    // Handle regular user login
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      status: "success",
      message: "Login successful",
      data: {
        user: user.profile,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Login failed",
      error: error.message,
    });
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProfile = async (req, res) => {
  try {
    res.json({
      status: "success",
      data: req.user.profile,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to get user profile",
      error: error.message,
    });
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, avatarUrl } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      status: "success",
      message: "Profile updated successfully",
      data: user.profile,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

/**
 * Logout user (optional server-side logout)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const logout = async (req, res) => {
  try {
    // For JWT tokens, logout is typically handled client-side
    // But we can log the logout event or perform any cleanup
    res.json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Logout failed",
      error: error.message,
    });
  }
}; 
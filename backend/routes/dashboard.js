import express from "express";
import { protect } from "../middleware/auth.js";
import { getDashboardData } from "../controllers/index.js";

const router = express.Router();

// GET /api/dashboard - Get all dashboard data for the logged-in user
router.get("/", protect, getDashboardData);

export default router;

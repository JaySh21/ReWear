import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getPointsBalance,
  getPointsHistory,
  redeemItem,
} from "../controllers/index.js";

const router = express.Router();

/**
 * @swagger
 * /api/points/balance:
 *   get:
 *     summary: Get current user's points balance
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Points balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: integer
 *                     totalEarned:
 *                       type: integer
 *                     totalSpent:
 *                       type: integer
 *                     totalTransactions:
 *                       type: integer
 */
router.get("/balance", protect, getPointsBalance);

/**
 * @swagger
 * /api/points/history:
 *   get:
 *     summary: Get user's points transaction history
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 */
router.get("/history", protect, getPointsHistory);

/**
 * @swagger
 * /api/points/redeem/{itemId}:
 *   post:
 *     summary: Redeem an item using points
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID to redeem
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pointsUsed
 *             properties:
 *               pointsUsed:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Item redeemed successfully
 *       400:
 *         description: Insufficient points or invalid request
 *       404:
 *         description: Item not found
 */
router.post("/redeem/:itemId", protect, redeemItem);

export default router;

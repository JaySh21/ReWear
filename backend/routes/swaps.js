import express from "express";
import { protect } from "../middleware/auth.js";
import { validateSwapRequest } from "../middleware/validate.js";
import {
  getUserSwaps,
  requestSwap,
  acceptSwap,
  rejectSwap,
  completeSwap,
} from "../controllers/index.js";

const router = express.Router();

/**
 * @swagger
 * /api/swaps:
 *   get:
 *     summary: Get user's swaps
 *     tags: [Swaps]
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
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected, completed]
 *     responses:
 *       200:
 *         description: Swaps retrieved successfully
 */
router.get("/", protect, getUserSwaps);

/**
 * @swagger
 * /api/swaps/request:
 *   post:
 *     summary: Request a swap or redemption
 *     tags: [Swaps]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestItemId
 *               - type
 *             properties:
 *               requestItemId:
 *                 type: string
 *               offeredItemId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [swap, points]
 *               pointsUsed:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Swap request created successfully
 *       400:
 *         description: Validation error or insufficient points
 *       404:
 *         description: Item not found
 */
router.post("/request", protect, validateSwapRequest, requestSwap);

/**
 * @swagger
 * /api/swaps/{id}/accept:
 *   post:
 *     summary: Accept a swap request
 *     tags: [Swaps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Swap ID
 *     responses:
 *       200:
 *         description: Swap accepted successfully
 *       400:
 *         description: Swap is not in pending status
 *       403:
 *         description: Not authorized to accept this swap
 *       404:
 *         description: Swap not found
 */
router.post("/:id/accept", protect, acceptSwap);

/**
 * @swagger
 * /api/swaps/{id}/reject:
 *   post:
 *     summary: Reject a swap request
 *     tags: [Swaps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Swap ID
 *     responses:
 *       200:
 *         description: Swap rejected successfully
 *       400:
 *         description: Swap is not in pending status
 *       403:
 *         description: Not authorized to reject this swap
 *       404:
 *         description: Swap not found
 */
router.post("/:id/reject", protect, rejectSwap);

/**
 * @swagger
 * /api/swaps/{id}/complete:
 *   post:
 *     summary: Complete a swap
 *     tags: [Swaps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Swap ID
 *     responses:
 *       200:
 *         description: Swap completed successfully
 *       400:
 *         description: Swap is not in accepted status
 *       403:
 *         description: Not authorized to complete this swap
 *       404:
 *         description: Swap not found
 */
router.post("/:id/complete", protect, completeSwap);

export default router;

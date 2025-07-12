import express from "express";
import { protect, admin } from "../middleware/auth.js";
import { validateItemApproval } from "../middleware/validate.js";
import {
  getAdminDashboard,
  getAllUsers,
  updateUser,
  approveItem,
  removeItem,
  getAllItemsAdmin,
  getAllSwaps,
} from "../controllers/index.js";

const router = express.Router();

router.use(protect);
router.use(admin);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get("/dashboard", getAdminDashboard);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with pagination and filtering
 *     tags: [Admin]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get("/users", getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put("/users/:id", updateUser);

/**
 * @swagger
 * /api/admin/items:
 *   get:
 *     summary: Get all items with admin filtering
 *     tags: [Admin]
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
 *           enum: [pending, listed, swapped, rejected]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Items retrieved successfully
 */
router.get("/items", getAllItemsAdmin);

/**
 * @swagger
 * /api/admin/items/{id}/approve:
 *   put:
 *     summary: Approve or reject an item
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [listed, rejected]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item approved/rejected successfully
 *       400:
 *         description: Item is not in pending status
 *       404:
 *         description: Item not found
 */
router.put("/items/:id/approve", validateItemApproval, approveItem);

/**
 * @swagger
 * /api/admin/items/{id}:
 *   delete:
 *     summary: Remove an item (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID to remove
 *     responses:
 *       200:
 *         description: Item removed successfully
 *       404:
 *         description: Item not found
 */
router.delete("/items/:id", removeItem);

/**
 * @swagger
 * /api/admin/swaps:
 *   get:
 *     summary: Get all swaps with admin filtering
 *     tags: [Admin]
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [swap, points]
 *     responses:
 *       200:
 *         description: Swaps retrieved successfully
 */
router.get("/swaps", getAllSwaps);

export default router;

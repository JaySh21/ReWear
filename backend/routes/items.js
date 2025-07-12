import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { validateItemCreation } from "../middleware/validate.js";
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  toggleLike,
  getTrendingItems,
  getMyItems,
} from "../controllers/index.js";

const router = express.Router();

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items with filtering and pagination
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [tops, bottoms, dresses, outerwear, shoes, accessories, other]
 *         description: Filter by category
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [swap, points]
 *         description: Filter by type
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *           enum: [XS, S, M, L, XL, XXL, OS, NA]
 *         description: Filter by size
 *       - in: query
 *         name: condition
 *         schema:
 *           type: string
 *           enum: [new, like-new, good, fair, poor]
 *         description: Filter by condition
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, and tags
 *     responses:
 *       200:
 *         description: Items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Item'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get("/", getAllItems);

// Trending items endpoint
router.get("/trending", getTrendingItems);

router.get("/my-items", protect, getMyItems);

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found
 */
router.get("/:id", getItemById);

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - type
 *               - size
 *               - condition
 *               - images
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *               category:
 *                 type: string
 *                 enum: [tops, bottoms, dresses, outerwear, shoes, accessories, other]
 *               type:
 *                 type: string
 *                 enum: [swap, points]
 *               size:
 *                 type: string
 *                 enum: [XS, S, M, L, XL, XXL, OS, NA]
 *               condition:
 *                 type: string
 *                 enum: [new, like-new, good, fair, poor]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               pointCost:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Item created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Item'
 *       400:
 *         description: Validation error
 */
router.post("/", protect, validateItemCreation, createItem);

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Update an item
 *     tags: [Items]
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               type:
 *                 type: string
 *               size:
 *                 type: string
 *               condition:
 *                 type: string
 *               images:
 *                 type: array
 *               tags:
 *                 type: array
 *               pointCost:
 *                 type: number
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Item not found
 */
router.put("/:id", protect, updateItem);

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Delete an item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Item not found
 */
router.delete("/:id", protect, deleteItem);

/**
 * @swagger
 * /api/items/{id}/like:
 *   post:
 *     summary: Toggle like on an item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *       404:
 *         description: Item not found
 */
router.post("/:id/like", protect, toggleLike);

export default router;

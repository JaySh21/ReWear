import Item from "../models/Item.js";
import User from "../models/User.js";

/**
 * Get all items with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { category, type, size, condition, search } = req.query;

    let query = { status: "approved" };
    const filters = {};

    if (category) filters.category = category;
    if (type) filters.type = type;
    if (size) filters.size = size;
    if (condition) filters.condition = condition;

    let items;
    let total;

    if (search) {
      items = await Item.search(search, filters, limit, page);
      const searchQuery = {
        $and: [
          { status: "approved" },
          {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
              { tags: { $in: [new RegExp(search, "i")] } },
            ],
          },
        ],
      };
      if (Object.keys(filters).length > 0) {
        searchQuery.$and.push(filters);
      }
      total = await Item.countDocuments(searchQuery);
    } else {
      if (Object.keys(filters).length > 0) {
        query = { ...query, ...filters };
      }
      const skip = (page - 1) * limit;
      items = await Item.find(query)
        .populate("uploader", "name avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      total = await Item.countDocuments(query);
    }

    const pages = Math.ceil(total / limit);

    res.json({
      status: "success",
      data: items.map((item) => item.summary),
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to get items",
      error: error.message,
    });
  }
};

/**
 * Get item by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "uploader",
      "name avatarUrl"
    );

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Item not found",
      });
    }

    await item.incrementViews();

    res.json({
      status: "success",
      data: item.details,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to get item",
      error: error.message,
    });
  }
};

/**
 * Create a new item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      size,
      condition,
      images,
      tags,
      pointCost,
    } = req.body;

    const item = await Item.create({
      title,
      description,
      category,
      type,
      size,
      condition,
      images,
      tags: tags || [],
      pointCost: type === "points" ? pointCost : undefined,
      uploader: req.user._id,
      status: "pending", // All items start as pending for admin approval
    });

    // Points will be awarded when item is approved by admin
    // const uploadPoints = parseInt(process.env.POINTS_PER_UPLOAD) || 50;
    // if (uploadPoints > 0) {
    //   await req.user.updatePoints(uploadPoints, "upload");
    // }

    res.status(201).json({
      status: "success",
      message: "Item created successfully and sent for admin approval",
      data: item.summary,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to create item",
      error: error.message,
    });
  }
};

/**
 * Update an item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Item not found",
      });
    }

    if (
      item.uploader.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to update this item",
      });
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("uploader", "name avatarUrl");

    res.json({
      status: "success",
      message: "Item updated successfully",
      data: updatedItem.summary,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update item",
      error: error.message,
    });
  }
};

/**
 * Delete an item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Item not found",
      });
    }

    if (
      item.uploader.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to delete this item",
      });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({
      status: "success",
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete item",
      error: error.message,
    });
  }
};

/**
 * Toggle like on an item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const toggleLike = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Item not found",
      });
    }

    const updatedItem = await item.toggleLike(req.user._id);

    res.json({
      status: "success",
      message: "Like toggled successfully",
      data: {
        likes: updatedItem.likes.length,
        isLiked: updatedItem.likes.includes(req.user._id),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to toggle like",
      error: error.message,
    });
  }
};

/**
 * Get trending items
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getTrendingItems = async (req, res) => {
  try {
    const items = await Item.getTrending(9);
    res.json({ status: "success", data: items.map((item) => item.summary) });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to get trending items",
      error: error.message,
    });
  }
};

/**
 * Get only the authenticated user's items, with swap status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getMyItems = async (req, res) => {
  try {
    const userId = req.user._id;
    // Find all items uploaded by this user
    const items = await Item.find({ uploader: userId }).lean();

    // For each item, find the most recent swap (if any)
    const Swap = require("../models/Swap.js");
    const itemIds = items.map((item) => item._id);
    const swaps = await Swap.find({
      requestItem: { $in: itemIds },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Map itemId to latest swap status
    const itemSwapStatus = {};
    swaps.forEach((swap) => {
      if (!itemSwapStatus[swap.requestItem]) {
        itemSwapStatus[swap.requestItem] = swap.status;
      }
    });

    // Attach status to each item
    const itemsWithStatus = items.map((item) => ({
      ...item,
      swapStatus:
        itemSwapStatus[item._id?.toString()] || item.status || "available",
    }));

    res.json({
      status: "success",
      data: itemsWithStatus,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to get your items",
      error: error.message,
    });
  }
};

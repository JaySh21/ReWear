import User from "../models/User.js";
import Item from "../models/Item.js";
import Swap from "../models/Swap.js";
import PointsLedger from "../models/PointsLedger.js";

/**
 * Get admin dashboard statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const pendingItems = await Item.countDocuments({ status: "pending" });
    const totalSwaps = await Swap.countDocuments();
    const pendingSwaps = await Swap.countDocuments({ status: "pending" });

    const recentItems = await Item.find()
      .populate("uploader", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentSwaps = await Swap.find()
      .populate("requester", "name")
      .populate("requestItem", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    const pointsStats = await PointsLedger.getSystemStats();

    res.json({
      status: "success",
      data: {
        counts: {
          totalUsers,
          totalItems,
          pendingItems,
          totalSwaps,
          pendingSwaps,
        },
        recentActivity: {
          items: recentItems.map((item) => ({
            id: item._id,
            title: item.title,
            uploader: item.uploader.name,
            status: item.status,
            createdAt: item.createdAt,
          })),
          swaps: recentSwaps.map((swap) => ({
            id: swap._id,
            type: swap.type,
            status: swap.status,
            requester: swap.requester.name,
            requestItem: swap.requestItem.title,
            createdAt: swap.createdAt,
          })),
        },
        pointsStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to get dashboard statistics",
      error: error.message,
    });
  }
};

/**
 * Get all users with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { role, search } = req.query;

    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);
    const pages = Math.ceil(total / limit);

    res.json({
      status: "success",
      data: users.map((user) => user.profile),
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
      message: "Failed to get users",
      error: error.message,
    });
  }
};

/**
 * Update user (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({
      status: "success",
      message: "User updated successfully",
      data: updatedUser.profile,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update user",
      error: error.message,
    });
  }
};

/**
 * Approve or reject an item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const approveItem = async (req, res) => {
  try {
    console.log('Approve item request:', { itemId: req.params.id, body: req.body });
    
    const { status, reason } = req.body;
    const itemId = req.params.id;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Item not found",
      });
    }

    console.log('Found item:', { id: item._id, status: item.status, uploader: item.uploader });

    if (item.status !== "pending") {
      return res.status(400).json({
        status: "error",
        message: "Item is not in pending status",
      });
    }

    item.status = status;
    if (reason) {
      item.adminNotes = reason;
    }
    // Handle admin approval - don't set approvedBy for admin since it's not a real user
    if (req.user.role === "admin") {
      item.approvedBy = null; // Admin doesn't have a real user ID
    } else {
      item.approvedBy = req.user._id;
    }
    item.approvedAt = new Date();
    await item.save();

    console.log('Item saved with new status:', item.status);

    // If approved, give points to uploader
    if (status === "approved") {
      const uploadPoints = parseInt(process.env.POINTS_PER_UPLOAD) || 50;
      console.log('Giving uploader points:', uploadPoints);
      
      if (uploadPoints > 0) {
        const uploader = await User.findById(item.uploader);
        if (uploader) {
          try {
            await uploader.updatePoints(uploadPoints, "upload", itemId);
            console.log('Uploader points updated successfully');
          } catch (error) {
            console.error('Error updating uploader points:', error);
            // Don't fail the approval if points update fails
          }
        }
      }
    }

    res.json({
      status: "success",
      message: `Item ${status === "approved" ? "approved" : "rejected"} successfully`,
      data: item.summary,
    });
  } catch (error) {
    console.error('Error in approveItem:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to approve item",
      error: error.message,
    });
  }
};

/**
 * Get all items with admin filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllItemsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { status, search } = req.query;

    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const items = await Item.find(query)
      .populate("uploader", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Item.countDocuments(query);
    const pages = Math.ceil(total / limit);

    res.json({
      status: "success",
      data: items.map((item) => ({
        ...item.summary,
        uploader: item.uploader,
        createdAt: item.createdAt,
      })),
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
 * Remove an item (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const removeItem = async (req, res) => {
  try {
    console.log('Remove item request:', { itemId: req.params.id });
    
    const itemId = req.params.id;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Item not found",
      });
    }

    console.log('Found item to remove:', { id: item._id, title: item.title });

    // Delete the item
    await Item.findByIdAndDelete(itemId);

    console.log('Item removed successfully');

    res.json({
      status: "success",
      message: "Item removed successfully",
    });
  } catch (error) {
    console.error('Error in removeItem:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to remove item",
      error: error.message,
    });
  }
};

/**
 * Get all swaps with admin filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllSwaps = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { status, type } = req.query;

    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const swaps = await Swap.find(query)
      .populate("requester", "name email")
      .populate("requestItem", "title")
      .populate("offeredItem", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Swap.countDocuments(query);
    const pages = Math.ceil(total / limit);

    res.json({
      status: "success",
      data: swaps.map((swap) => ({
        id: swap._id,
        type: swap.type,
        status: swap.status,
        pointsUsed: swap.pointsUsed,
        requestItem: swap.requestItem,
        offeredItem: swap.offeredItem,
        requester: swap.requester,
        notes: swap.notes,
        createdAt: swap.createdAt,
        updatedAt: swap.updatedAt,
      })),
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
      message: "Failed to get swaps",
      error: error.message,
    });
  }
}; 
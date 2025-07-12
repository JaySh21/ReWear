import PointsLedger from "../models/PointsLedger.js";
import User from "../models/User.js";
import Item from "../models/Item.js";

/**
 * Get current user's points balance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPointsBalance = async (req, res) => {
  try {
    const balance = req.user.points;
    const stats = await PointsLedger.getUserStats(req.user._id);

    res.json({
      status: "success",
      data: {
        balance,
        ...stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to get points balance",
      error: error.message,
    });
  }
};

/**
 * Get user's points transaction history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPointsHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const transactions = await PointsLedger.getUserHistory(
      req.user._id,
      limit,
      page
    );
    const total = await PointsLedger.countDocuments({ userId: req.user._id });
    const pages = Math.ceil(total / limit);

    res.json({
      status: "success",
      data: transactions.map((transaction) => ({
        id: transaction._id,
        delta: transaction.delta,
        reason: transaction.reason,
        previousBalance: transaction.previousBalance,
        newBalance: transaction.newBalance,
        description: transaction.description,
        item: transaction.itemId
          ? {
              id: transaction.itemId._id,
              title: transaction.itemId.title,
              images: transaction.itemId.images,
            }
          : null,
        swap: transaction.swapId
          ? {
              id: transaction.swapId._id,
              type: transaction.swapId.type,
              status: transaction.swapId.status,
            }
          : null,
        admin: transaction.adminId
          ? {
              id: transaction.adminId._id,
              name: transaction.adminId.name,
            }
          : null,
        createdAt: transaction.createdAt,
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
      message: "Failed to get transaction history",
      error: error.message,
    });
  }
};

/**
 * Redeem an item using points
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const redeemItem = async (req, res) => {
  try {
    const { pointsUsed } = req.body;
    const itemId = req.params.itemId;

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Item not found",
      });
    }

    if (item.status !== "listed") {
      return res.status(400).json({
        status: "error",
        message: "Item is not available for redemption",
      });
    }

    if (item.type !== "points") {
      return res.status(400).json({
        status: "error",
        message: "This item is not available for points redemption",
      });
    }

    if (item.pointCost > req.user.points) {
      return res.status(400).json({
        status: "error",
        message: "Insufficient points for this item",
      });
    }

    if (pointsUsed !== item.pointCost) {
      return res.status(400).json({
        status: "error",
        message: "Points used must match the item's point cost",
      });
    }

    // Deduct points from user
    await req.user.updatePoints(-pointsUsed, "redemption", itemId);

    // Mark item as redeemed
    item.status = "redeemed";
    item.redeemedBy = req.user._id;
    item.redeemedAt = new Date();
    await item.save();

    res.json({
      status: "success",
      message: "Item redeemed successfully",
      data: {
        item: item.summary,
        pointsUsed,
        newBalance: req.user.points,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to redeem item",
      error: error.message,
    });
  }
}; 
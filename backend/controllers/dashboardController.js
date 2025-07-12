import Item from "../models/Item.js";
import Swap from "../models/Swap.js";
import PointsLedger from "../models/PointsLedger.js";

/**
 * Get all dashboard data for the logged-in user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's items with swap status
    const items = await Item.find({ uploader: userId })
      .sort({ createdAt: -1 });

    // For each item, find the most recent swap (if any)
    const itemIds = items.map((item) => item._id);
    const itemSwaps = await Swap.find({
      requestItem: { $in: itemIds },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Map itemId to latest swap status
    const itemSwapStatus = {};
    itemSwaps.forEach((swap) => {
      if (!itemSwapStatus[swap.requestItem]) {
        itemSwapStatus[swap.requestItem] = swap.status;
      }
    });

    // Attach status to each item and convert to summary format
    const itemsWithStatus = items.map((item) => ({
      ...item.summary,
      swapStatus:
        itemSwapStatus[item._id?.toString()] || item.status || "available",
    }));
    
    // Get user's swaps
    const swaps = await Swap.getByUser(userId);
    
    // Get points balance and stats
    const balance = await PointsLedger.getUserBalance(userId);
    const stats = await PointsLedger.getUserStats(userId);
    
    res.json({
      status: "success",
      data: {
        items: itemsWithStatus,
        swaps,
        points: { balance, ...stats },
        user: req.user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to load dashboard data",
      error: error.message,
    });
  }
}; 
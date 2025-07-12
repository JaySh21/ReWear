import Swap from "../models/Swap.js";
import Item from "../models/Item.js";
import User from "../models/User.js";

/**
 * Get user's swaps
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserSwaps = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { status } = req.query;

    const swaps = await Swap.getByUser(req.user._id, status, limit, page);
    const total = await Swap.countDocuments({
      $or: [
        { requester: req.user._id },
        { requestItemOwner: req.user._id },
        { offeredItemOwner: req.user._id },
      ],
      ...(status && { status }),
    });

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
        requestItemOwner: swap.requestItemOwner,
        offeredItemOwner: swap.offeredItemOwner,
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

/**
 * Request a swap or redemption
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const requestSwap = async (req, res) => {
  try {
    const { requestItemId, offeredItemId, type, pointsUsed, notes } = req.body;

    const requestItem = await Item.findById(requestItemId);
    if (!requestItem) {
      return res.status(404).json({
        status: "error",
        message: "Request item not found",
      });
    }

    if (requestItem.status !== "listed") {
      return res.status(400).json({
        status: "error",
        message: "Item is not available for swap",
      });
    }

    if (requestItem.uploader.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: "error",
        message: "Cannot request your own item",
      });
    }

    let offeredItem = null;
    let offeredItemOwner = null;

    if (type === "swap") {
      if (!offeredItemId) {
        return res.status(400).json({
          status: "error",
          message: "Offered item is required for swap type",
        });
      }

      offeredItem = await Item.findById(offeredItemId);
      if (!offeredItem) {
        return res.status(404).json({
          status: "error",
          message: "Offered item not found",
        });
      }

      if (offeredItem.status !== "listed") {
        return res.status(400).json({
          status: "error",
          message: "Offered item is not available for swap",
        });
      }

      if (offeredItem.uploader.toString() !== req.user._id.toString()) {
        return res.status(400).json({
          status: "error",
          message: "You can only offer your own items",
        });
      }

      offeredItemOwner = offeredItem.uploader;
    } else if (type === "points") {
      if (!pointsUsed || pointsUsed <= 0) {
        return res.status(400).json({
          status: "error",
          message:
            "Points used is required and must be positive for points type",
        });
      }

      if (requestItem.type !== "points") {
        return res.status(400).json({
          status: "error",
          message: "This item is not available for points redemption",
        });
      }

      if (requestItem.pointCost > req.user.points) {
        return res.status(400).json({
          status: "error",
          message: "Insufficient points for this item",
        });
      }

      if (pointsUsed !== requestItem.pointCost) {
        return res.status(400).json({
          status: "error",
          message: "Points used must match the item's point cost",
        });
      }
    }

    const swap = await Swap.create({
      type,
      requestItem: requestItemId,
      offeredItem: offeredItemId,
      requester: req.user._id,
      requestItemOwner: requestItem.uploader,
      offeredItemOwner,
      pointsUsed: type === "points" ? pointsUsed : undefined,
      notes,
    });

    res.status(201).json({
      status: "success",
      message: "Swap request created successfully",
      data: swap,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to create swap request",
      error: error.message,
    });
  }
};

/**
 * Accept a swap request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const acceptSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({
        status: "error",
        message: "Swap not found",
      });
    }

    if (swap.status !== "pending") {
      return res.status(400).json({
        status: "error",
        message: "Swap is not in pending status",
      });
    }

    if (
      swap.requestItemOwner.toString() !== req.user._id.toString() &&
      swap.offeredItemOwner?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to accept this swap",
      });
    }

    await swap.accept();

    res.json({
      status: "success",
      message: "Swap accepted successfully",
      data: swap,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to accept swap",
      error: error.message,
    });
  }
};

/**
 * Reject a swap request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const rejectSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({
        status: "error",
        message: "Swap not found",
      });
    }

    if (swap.status !== "pending") {
      return res.status(400).json({
        status: "error",
        message: "Swap is not in pending status",
      });
    }

    if (
      swap.requestItemOwner.toString() !== req.user._id.toString() &&
      swap.offeredItemOwner?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to reject this swap",
      });
    }

    // No points deduction or PointsLedger update on rejection
    await swap.reject();

    res.json({
      status: "success",
      message: "Swap rejected successfully",
      data: swap,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to reject swap",
      error: error.message,
    });
  }
};

/**
 * Complete a swap
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const completeSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({
        status: "error",
        message: "Swap not found",
      });
    }

    if (swap.status !== "accepted") {
      return res.status(400).json({
        status: "error",
        message: "Swap is not in accepted status",
      });
    }

    if (
      swap.requester.toString() !== req.user._id.toString() &&
      swap.requestItemOwner.toString() !== req.user._id.toString() &&
      swap.offeredItemOwner?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to complete this swap",
      });
    }

    await swap.complete();

    res.json({
      status: "success",
      message: "Swap completed successfully",
      data: swap,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to complete swap",
      error: error.message,
    });
  }
};

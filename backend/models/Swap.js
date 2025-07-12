import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     Swap:
 *       type: object
 *       required:
 *         - requester
 *         - requestItem
 *         - type
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated swap ID
 *         requester:
 *           type: string
 *           description: Reference to User making the request
 *         requestItem:
 *           type: string
 *           description: Reference to Item being requested
 *         offeredItem:
 *           type: string
 *           description: Reference to Item being offered (null for points redemption)
 *         type:
 *           type: string
 *           description: Type of swap (swap or points)
 *           enum: [swap, points]
 *         status:
 *           type: string
 *           description: Current status of the swap
 *           enum: [pending, accepted, rejected, completed]
 *           default: pending
 *         pointsUsed:
 *           type: number
 *           description: Points used for redemption (only for points type)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const swapSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requester is required"],
    },
    requestItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Request item is required"],
    },
    offeredItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      default: null,
      validate: {
        validator: function (v) {
          if (this.type === "swap" && !v) {
            return false;
          }
          if (this.type === "points" && v) {
            return false;
          }
          return true;
        },
        message:
          "Offered item is required for swap type, but should be null for points type",
      },
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: {
        values: ["swap", "points"],
        message: 'Type must be either "swap" or "points"',
      },
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "rejected", "completed"],
        message:
          "Status must be one of: pending, accepted, rejected, completed",
      },
      default: "pending",
    },
    pointsUsed: {
      type: Number,
      min: [0, "Points used cannot be negative"],
      validate: {
        validator: function (v) {
          if (this.type === "points" && (!v || v <= 0)) {
            return false;
          }
          if (this.type === "swap" && v && v > 0) {
            return false;
          }
          return true;
        },
        message:
          "Points used is required for points type, but should be 0 for swap type",
      },
    },
    requestItemOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Request item owner is required"],
    },
    offeredItemOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

swapSchema.index({ requester: 1 });
swapSchema.index({ requestItem: 1 });
swapSchema.index({ offeredItem: 1 });
swapSchema.index({ status: 1 });
swapSchema.index({ type: 1 });
swapSchema.index({ createdAt: -1 });
swapSchema.index({ requester: 1, status: 1 });
swapSchema.index({ requestItemOwner: 1, status: 1 });

swapSchema.virtual("summary").get(function () {
  return {
    id: this._id,
    type: this.type,
    status: this.status,
    pointsUsed: this.pointsUsed,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
});

swapSchema.virtual("details").get(function () {
  return {
    id: this._id,
    type: this.type,
    status: this.status,
    pointsUsed: this.pointsUsed,
    notes: this.notes,
    completedAt: this.completedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
});

swapSchema.pre("save", function (next) {
  if (this.type === "points") {
    if (this.offeredItem) {
      return next(
        new Error("Offered item should be null for points type swaps")
      );
    }
    if (!this.pointsUsed || this.pointsUsed <= 0) {
      return next(
        new Error(
          "Points used is required and must be positive for points type"
        )
      );
    }
  }

  if (this.type === "swap") {
    if (!this.offeredItem) {
      return next(new Error("Offered item is required for swap type"));
    }
    if (this.pointsUsed && this.pointsUsed > 0) {
      return next(new Error("Points used should be 0 for swap type"));
    }
  }

  next();
});

swapSchema.methods.accept = async function () {
  if (this.status !== "pending") {
    throw new Error("Only pending swaps can be accepted");
  }

  const mongoose = require("mongoose");
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    this.status = "accepted";
    const Item = mongoose.model("Item");
    const User = mongoose.model("User");
    const PointsLedger = mongoose.model("PointsLedger");

    // Mark items as reserved
    await Item.findByIdAndUpdate(
      this.requestItem,
      { status: "reserved" },
      { session }
    );
    if (this.offeredItem) {
      await Item.findByIdAndUpdate(
        this.offeredItem,
        { status: "reserved" },
        { session }
      );
    }

    // Points logic for points swap
    if (this.type === "points") {
      // Deduct points from requester, add ledger entry
      const requester = await User.findById(this.requester).session(session);
      const requestItem = await Item.findById(this.requestItem).session(
        session
      );
      if (!requester || !requestItem)
        throw new Error("Requester or item not found");
      if (requester.points < this.pointsUsed)
        throw new Error("Insufficient points");
      await PointsLedger.createEntry({
        userId: requester._id,
        delta: -this.pointsUsed,
        reason: "swap",
        itemId: requestItem._id,
        swapId: this._id,
        description: `Points deducted for accepting swap of item ${requestItem.title}`,
      });
      // Optionally, add points to item owner (if needed by business logic)
      const owner = await User.findById(this.requestItemOwner).session(session);
      if (owner) {
        await PointsLedger.createEntry({
          userId: owner._id,
          delta: this.pointsUsed,
          reason: "swap",
          itemId: requestItem._id,
          swapId: this._id,
          description: `Points received for item swapped: ${requestItem.title}`,
        });
      }
    }

    await this.save({ session });
    await session.commitTransaction();
    session.endSession();
    return this;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

swapSchema.methods.reject = async function () {
  if (this.status !== "pending") {
    throw new Error("Only pending swaps can be rejected");
  }

  this.status = "rejected";

  const Item = mongoose.model("Item");
  await Item.findByIdAndUpdate(this.requestItem, { status: "listed" });

  if (this.offeredItem) {
    await Item.findByIdAndUpdate(this.offeredItem, { status: "listed" });
  }

  return this.save();
};

swapSchema.methods.complete = async function () {
  if (this.status !== "accepted") {
    throw new Error("Only accepted swaps can be completed");
  }

  this.status = "completed";
  this.completedAt = new Date();

  const Item = mongoose.model("Item");
  await Item.findByIdAndUpdate(this.requestItem, { status: "swapped" });

  if (this.offeredItem) {
    await Item.findByIdAndUpdate(this.offeredItem, { status: "swapped" });
  }

  // Handle points transaction for points type
  if (this.type === "points") {
    const User = mongoose.model("User");
    const requester = await User.findById(this.requester);
    await requester.updatePoints(-this.pointsUsed, "item_redemption");
  }

  return this.save();
};

// Static method to get swaps by user
swapSchema.statics.getByUser = function (userId, status = null, limit = 20, page = 1) {
  const query = {
    $or: [
      { requester: userId },
      { requestItemOwner: userId },
      { offeredItemOwner: userId },
    ],
  };

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("requester", "name avatarUrl")
    .populate("requestItem", "title images")
    .populate("offeredItem", "title images")
    .populate("requestItemOwner", "name avatarUrl")
    .populate("offeredItemOwner", "name avatarUrl");
};

// Static method to get pending swaps for admin
swapSchema.statics.getPending = function () {
  return this.find({ status: "pending" })
    .sort({ createdAt: -1 })
    .populate("requester", "name avatarUrl")
    .populate("requestItem", "title images")
    .populate("offeredItem", "title images")
    .populate("requestItemOwner", "name avatarUrl")
    .populate("offeredItemOwner", "name avatarUrl");
};

export default mongoose.model("Swap", swapSchema);

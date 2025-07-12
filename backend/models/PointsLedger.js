import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     PointsLedger:
 *       type: object
 *       required:
 *         - userId
 *         - delta
 *         - reason
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ledger entry ID
 *         userId:
 *           type: string
 *           description: Reference to User
 *         itemId:
 *           type: string
 *           description: Reference to Item (optional)
 *         delta:
 *           type: number
 *           description: Point change (positive or negative)
 *         reason:
 *           type: string
 *           description: Reason for point change
 *           enum: [upload, swap, redeem, manual, item_redemption]
 *         previousBalance:
 *           type: number
 *           description: User's balance before this transaction
 *         newBalance:
 *           type: number
 *           description: User's balance after this transaction
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const pointsLedgerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      default: null,
    },
    swapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Swap",
      default: null,
    },
    delta: {
      type: Number,
      required: [true, "Delta is required"],
      validate: {
        validator: function (v) {
          return v !== 0; // Delta should not be zero
        },
        message: "Delta cannot be zero",
      },
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      enum: {
        values: [
          "upload",
          "swap",
          "redeem",
          "manual",
          "item_redemption",
          "admin_adjustment",
        ],
        message:
          "Reason must be one of: upload, swap, redeem, manual, item_redemption, admin_adjustment",
      },
    },
    previousBalance: {
      type: Number,
      required: [true, "Previous balance is required"],
      min: [0, "Previous balance cannot be negative"],
    },
    newBalance: {
      type: Number,
      required: [true, "New balance is required"],
      min: [0, "New balance cannot be negative"],
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
pointsLedgerSchema.index({ userId: 1 });
pointsLedgerSchema.index({ itemId: 1 });
pointsLedgerSchema.index({ swapId: 1 });
pointsLedgerSchema.index({ reason: 1 });
pointsLedgerSchema.index({ createdAt: -1 });
pointsLedgerSchema.index({ userId: 1, createdAt: -1 });

// Virtual for transaction summary
pointsLedgerSchema.virtual("summary").get(function () {
  return {
    id: this._id,
    delta: this.delta,
    reason: this.reason,
    previousBalance: this.previousBalance,
    newBalance: this.newBalance,
    createdAt: this.createdAt,
  };
});

// Virtual for transaction details
pointsLedgerSchema.virtual("details").get(function () {
  return {
    id: this._id,
    delta: this.delta,
    reason: this.reason,
    previousBalance: this.previousBalance,
    newBalance: this.newBalance,
    description: this.description,
    createdAt: this.createdAt,
  };
});

// Pre-save middleware to validate balance consistency
pointsLedgerSchema.pre("save", function (next) {
  // Validate that new balance equals previous balance plus delta
  if (this.newBalance !== this.previousBalance + this.delta) {
    return next(
      new Error("New balance must equal previous balance plus delta")
    );
  }

  // Validate that new balance is not negative
  if (this.newBalance < 0) {
    return next(new Error("New balance cannot be negative"));
  }

  next();
});

// Static method to get user's transaction history
pointsLedgerSchema.statics.getUserHistory = function (
  userId,
  limit = 50,
  page = 1
) {
  const skip = (page - 1) * limit;
  return this.find({ userId })
    .populate("itemId", "title images")
    .populate("swapId", "type status")
    .populate("adminId", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get user's balance
pointsLedgerSchema.statics.getUserBalance = async function (userId) {
  const id = new mongoose.Types.ObjectId(userId.toString());
  const latestEntry = await this.findOne({ userId: id })
    .sort({ createdAt: -1 })
    .select("newBalance");

  return latestEntry ? latestEntry.newBalance : 0;
};

// Static method to get transaction statistics
pointsLedgerSchema.statics.getUserStats = async function (userId) {
  const id = new mongoose.Types.ObjectId(userId.toString());
  const stats = await this.aggregate([
    { $match: { userId: id } },
    {
      $group: {
        _id: null,
        totalEarned: {
          $sum: {
            $cond: [{ $gt: ["$delta", 0] }, "$delta", 0],
          },
        },
        totalSpent: {
          $sum: {
            $cond: [{ $lt: ["$delta", 0] }, { $abs: "$delta" }, 0],
          },
        },
        totalTransactions: { $sum: 1 },
      },
    },
  ]);

  return stats[0] || { totalEarned: 0, totalSpent: 0, totalTransactions: 0 };
};

// Static method to create a ledger entry
pointsLedgerSchema.statics.createEntry = async function (data) {
  const {
    userId,
    delta,
    reason,
    itemId = null,
    swapId = null,
    description = null,
    adminId = null,
  } = data;

  // Get current user balance
  const User = mongoose.model("User");
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const previousBalance = user.points;
  const newBalance = Math.max(0, previousBalance + delta);

  // Create ledger entry
  const entry = await this.create({
    userId,
    itemId,
    swapId,
    delta,
    reason,
    previousBalance,
    newBalance,
    description,
    adminId,
  });

  // Update user's points
  user.points = newBalance;
  await user.save();

  return entry;
};

// Static method to get system-wide statistics
pointsLedgerSchema.statics.getSystemStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalPointsEarned: {
          $sum: {
            $cond: [{ $gt: ["$delta", 0] }, "$delta", 0],
          },
        },
        totalPointsSpent: {
          $sum: {
            $cond: [{ $lt: ["$delta", 0] }, { $abs: "$delta" }, 0],
          },
        },
        totalTransactions: { $sum: 1 },
        uniqueUsers: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        _id: 0,
        totalPointsEarned: 1,
        totalPointsSpent: 1,
        totalTransactions: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
      },
    },
  ]);

  return (
    stats[0] || {
      totalPointsEarned: 0,
      totalPointsSpent: 0,
      totalTransactions: 0,
      uniqueUsers: 0,
    }
  );
};

export default mongoose.model("PointsLedger", pointsLedgerSchema);

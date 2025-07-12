import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *         - type
 *         - size
 *         - condition
 *         - uploader
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated item ID
 *         title:
 *           type: string
 *           description: Item title
 *           minLength: 3
 *           maxLength: 100
 *         description:
 *           type: string
 *           description: Detailed item description
 *           minLength: 10
 *           maxLength: 1000
 *         category:
 *           type: string
 *           description: Item category
 *           enum: [tops, bottoms, dresses, outerwear, shoes, accessories, other]
 *         type:
 *           type: string
 *           description: Item type (swap or points)
 *           enum: [swap, points]
 *         size:
 *           type: string
 *           description: Item size
 *           enum: [XS, S, M, L, XL, XXL, OS, NA]
 *         condition:
 *           type: string
 *           description: Item condition
 *           enum: [new, like-new, good, fair, poor]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of tags for search
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of Cloudinary image URLs
 *         status:
 *           type: string
 *           description: Item status
 *           enum: [listed, pending, swapped, reserved]
 *           default: listed
 *         pointCost:
 *           type: number
 *           description: Points required to redeem this item
 *           minimum: 0
 *         uploader:
 *           type: string
 *           description: Reference to User who uploaded the item
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "tops",
          "bottoms",
          "dresses",
          "outerwear",
          "shoes",
          "accessories",
          "other",
        ],
        message:
          "Category must be one of: tops, bottoms, dresses, outerwear, shoes, accessories, other",
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
    size: {
      type: String,
      required: [true, "Size is required"],
      enum: {
        values: ["XS", "S", "M", "L", "XL", "XXL", "OS", "NA"],
        message: "Size must be one of: XS, S, M, L, XL, XXL, OS, NA",
      },
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: {
        values: ["new", "like-new", "good", "fair", "poor"],
        message: "Condition must be one of: new, like-new, good, fair, poor",
      },
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [20, "Tag cannot exceed 20 characters"],
      },
    ],
    images: [
      {
        type: String,
        required: [true, "At least one image is required"],
        validate: {
          validator: function (v) {
            return /^https?:\/\/.+/.test(v);
          },
          message: "Image URL must be a valid HTTP/HTTPS URL",
        },
      },
    ],
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected", "listed", "swapped", "reserved"],
        message: "Status must be one of: pending, approved, rejected, listed, swapped, reserved",
      },
      default: "pending",
    },
    pointCost: {
      type: Number,
      min: [0, "Point cost cannot be negative"],
      validate: {
        validator: function (v) {
          if (this.type === "points" && (!v || v <= 0)) {
            return false;
          }
          return true;
        },
        message:
          "Point cost is required and must be positive for points-type items",
      },
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader is required"],
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    adminNotes: {
      type: String,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
itemSchema.index({ status: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ type: 1 });
itemSchema.index({ uploader: 1 });
itemSchema.index({ tags: 1 });
itemSchema.index({ createdAt: -1 });
itemSchema.index({ pointCost: 1 });
itemSchema.index({ uploader: 1, status: 1 });

// Compound index for search
itemSchema.index({
  title: "text",
  description: "text",
  tags: "text",
});

// Virtual for item summary
itemSchema.virtual("summary").get(function () {
  return {
    id: this._id,
    title: this.title,
    category: this.category,
    type: this.type,
    size: this.size,
    condition: this.condition,
    status: this.status,
    pointCost: this.pointCost,
    images: this.images,
    views: this.views,
    likes: this.likes.length,
    createdAt: this.createdAt,
  };
});

// Virtual for item details (including uploader info)
itemSchema.virtual("details").get(function () {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    category: this.category,
    type: this.type,
    size: this.size,
    condition: this.condition,
    tags: this.tags,
    images: this.images,
    status: this.status,
    pointCost: this.pointCost,
    views: this.views,
    likes: this.likes,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    uploader: this.uploader,
  };
});

// Pre-save middleware to validate point cost for points-type items
itemSchema.pre("save", function (next) {
  if (this.type === "points" && (!this.pointCost || this.pointCost <= 0)) {
    return next(
      new Error(
        "Point cost is required and must be positive for points-type items"
      )
    );
  }
  next();
});

// Instance method to increment views
itemSchema.methods.incrementViews = async function () {
  this.views += 1;
  return this.save();
};

// Instance method to toggle like
itemSchema.methods.toggleLike = async function (userId) {
  const likeIndex = this.likes.indexOf(userId);
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

// Static method to get items by category
itemSchema.statics.getByCategory = function (category, limit = 20) {
  return this.find({
    category,
    status: "approved",
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("uploader", "name avatarUrl");
};

// Static method to search items
itemSchema.statics.search = function (query, limit = 20) {
  return this.find({
    $text: { $search: query },
    status: "approved",
  })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .populate("uploader", "name avatarUrl");
};

// Static method to get trending items
itemSchema.statics.getTrending = function (limit = 10) {
  return this.find({ status: "approved" })
    .sort({ views: -1, likes: -1 })
    .limit(limit)
    .populate("uploader", "name avatarUrl");
};

export default mongoose.model("Item", itemSchema);

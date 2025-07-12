import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated user ID
 *         name:
 *           type: string
 *           description: User's full name
 *           minLength: 2
 *           maxLength: 50
 *         email:
 *           type: string
 *           description: User's email address (unique)
 *           format: email
 *         password:
 *           type: string
 *           description: Hashed password
 *           minLength: 6
 *         avatarUrl:
 *           type: string
 *           description: URL to user's profile picture
 *         points:
 *           type: number
 *           description: User's current points balance
 *           default: 0
 *         role:
 *           type: string
 *           description: User role (user or admin)
 *           enum: [user, admin]
 *           default: user
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    avatarUrl: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: "Avatar URL must be a valid HTTP/HTTPS URL",
      },
    },
    points: {
      type: Number,
      default: 0,
      min: [0, "Points cannot be negative"],
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: 'Role must be either "user" or "admin"',
      },
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ points: -1 });
userSchema.index({ createdAt: -1 });

userSchema.virtual("profile").get(function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatarUrl: this.avatarUrl,
    points: this.points,
    role: this.role,
    createdAt: this.createdAt,
  };
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.updatePoints = async function (delta, reason = "manual", itemId = null, swapId = null) {
  const oldPoints = this.points;
  this.points = Math.max(0, this.points + delta);

  if (delta !== 0) {
    const PointsLedger = mongoose.model("PointsLedger");
    try {
      await PointsLedger.createEntry({
        userId: this._id,
        delta,
        reason,
        itemId,
        swapId,
      });
    } catch (error) {
      console.error('Error creating points ledger entry:', error);
      throw error;
    }
  }

  return this.save();
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() }).select("+password");
};

userSchema.statics.getTopUsers = function (limit = 10) {
  return this.find({ isActive: true })
    .sort({ points: -1 })
    .limit(limit)
    .select("name avatarUrl points");
};

export default mongoose.model("User", userSchema);

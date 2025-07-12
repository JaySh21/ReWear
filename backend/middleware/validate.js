import { validationResult, body } from "express-validator";

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const validateRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidationErrors,
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage('Role must be either "user" or "admin"'),
  handleValidationErrors,
];

/**
 * Validation rules for item creation
 */
const validateItemCreation = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("category")
    .isIn([
      "tops",
      "bottoms",
      "dresses",
      "outerwear",
      "shoes",
      "accessories",
      "other",
    ])
    .withMessage("Invalid category"),
  body("type")
    .isIn(["swap", "points"])
    .withMessage('Type must be either "swap" or "points"'),
  body("size")
    .isIn(["XS", "S", "M", "L", "XL", "XXL", "OS", "NA"])
    .withMessage("Invalid size"),
  body("condition")
    .isIn(["new", "like-new", "good", "fair", "poor"])
    .withMessage("Invalid condition"),
  body("images")
    .isArray({ min: 1 })
    .withMessage("At least one image is required"),
  body("images.*").isURL().withMessage("Images must be valid URLs"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Tag cannot exceed 20 characters"),
  body("pointCost")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Point cost must be a positive integer"),
  handleValidationErrors,
];

/**
 * Validation rules for swap request
 */
const validateSwapRequest = [
  body("requestItemId").isMongoId().withMessage("Invalid request item ID"),
  body("offeredItemId")
    .optional()
    .isMongoId()
    .withMessage("Invalid offered item ID"),
  body("type")
    .isIn(["swap", "points"])
    .withMessage('Type must be either "swap" or "points"'),
  body("pointsUsed")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Points used must be a positive integer"),
  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
  handleValidationErrors,
];

/**
 * Validation rules for points redemption
 */
const validatePointsRedemption = [
  body("itemId").isMongoId().withMessage("Invalid item ID"),
  body("pointsUsed")
    .isInt({ min: 1 })
    .withMessage("Points used must be a positive integer"),
  handleValidationErrors,
];

/**
 * Validation rules for admin item approval
 */
const validateItemApproval = [
  body("status")
    .isIn(["approved", "rejected"])
    .withMessage("Status must be either 'approved' or 'rejected'"),
  body("reason")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters"),
  handleValidationErrors,
];

/**
 * Validation rules for user profile update
 */
const validateProfileUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("avatarUrl")
    .optional()
    .isURL()
    .withMessage("Avatar URL must be a valid URL"),
  handleValidationErrors,
];

export {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateItemCreation,
  validateSwapRequest,
  validatePointsRedemption,
  validateItemApproval,
  validateProfileUpdate,
};

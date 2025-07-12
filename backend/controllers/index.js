// Auth Controllers
export {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
} from "./authController.js";

// Item Controllers
export {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  toggleLike,
  getTrendingItems,
  getMyItems,
} from "./itemController.js";

// Swap Controllers
export {
  getUserSwaps,
  requestSwap,
  acceptSwap,
  rejectSwap,
  completeSwap,
} from "./swapController.js";

// Point Controllers
export {
  getPointsBalance,
  getPointsHistory,
  redeemItem,
} from "./pointController.js";

// Dashboard Controllers
export { getDashboardData } from "./dashboardController.js";

// Admin Controllers
export {
  getAdminDashboard,
  getAllUsers,
  updateUser,
  approveItem,
  removeItem,
  getAllItemsAdmin,
  getAllSwaps,
} from "./adminController.js";

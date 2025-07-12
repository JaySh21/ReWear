import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../lib/store";
import { dashboardAPI, authAPI } from "../services/api";
import {
  User,
  Package,
  RefreshCw,
  Gift,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  Heart,
  Eye,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [items, setItems] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [points, setPoints] = useState({ balance: 0, history: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardAPI.getDashboardData();
      
      setItems(response.data?.items || []);
      setSwaps(response.data?.swaps || []);
      setPoints({ 
        balance: response.data?.points?.balance || 0,
        ...response.data?.points 
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  // Group items by status
  const groupItemsByStatus = (items) => {
    const groups = {
      pendingApproval: [],
      approved: [],
      rejected: [],
      available: [],
      swapped: [],
    };
    items.forEach((item) => {
      const itemStatus = item.status?.toLowerCase() || "pending";
      const swapStatus = item.swapStatus?.toLowerCase() || "available";
      
      if (itemStatus === "pending") {
        groups.pendingApproval.push(item);
      } else if (itemStatus === "rejected") {
        groups.rejected.push(item);
      } else if (swapStatus === "swapped") {
        groups.swapped.push(item);
      } else if (itemStatus === "approved" && swapStatus === "available") {
        groups.available.push(item);
      } else {
        groups.available.push(item);
      }
    });
    return groups;
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Swaps</p>
              <p className="text-2xl font-bold text-gray-900">
                {swaps.filter((s) => s.status === "pending").length}
              </p>
            </div>
            <RefreshCw className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Points Balance
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {points.balance}
              </p>
            </div>
            <Gift className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Items
          </h3>
          {items.length > 0 ? (
            <div className="space-y-3">
              {items.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <img
                    src={item.images?.[0] || "/placeholder-item.jpg"}
                    alt={item.title}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">
                      {item.category} • {item.condition}
                    </p>
                  </div>
                  <Link
                    to={`/items/${item.id}`}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No items yet</p>
          )}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Swaps
          </h3>
          {swaps.length > 0 ? (
            <div className="space-y-3">
              {swaps.slice(0, 3).map((swap) => (
                <div
                  key={swap.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {swap.type === "swap" ? "Item Swap" : "Points Redemption"}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {swap.status}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      swap.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : swap.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {swap.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No swaps yet</p>
          )}
        </div>
      </div>
    </div>
  );

  const ItemsTab = () => {
    const grouped = groupItemsByStatus(items);
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">My Items</h2>
          <Link
            to="/list-item"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </Link>
        </div>

        {/* Pending Approval */}
        <Section title="Pending Approval" items={grouped.pendingApproval} />
        {/* Available Items */}
        <Section title="Available" items={grouped.available} />
        {/* Rejected Items */}
        <Section title="Rejected" items={grouped.rejected} />
        {/* Swapped Items */}
        <Section title="Swapped" items={grouped.swapped} />
      </div>
    );
  };

  // Section component for grouped items
  const Section = ({ title, items }) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              <img
                src={item.images?.[0] || "/placeholder-item.jpg"}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {item.category}
                  </span>
                  <span className="text-gray-500">{item.condition}</span>
                </div>
                {/* Status Badge */}
                <div className="mt-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : item.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : item.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.status === "pending" && "Pending Approval"}
                    {item.status === "approved" && "Approved"}
                    {item.status === "rejected" && "Rejected"}
                    {item.status === "swapped" && "Swapped"}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {item.views || 0}
                    </span>
                    <Heart className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {Array.isArray(item.likes)
                        ? item.likes.length
                        : item.likes || 0}
                    </span>
                  </div>
                  <Link
                    to={`/items/${item.id}`}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No items in this category.
        </div>
      )}
    </div>
  );

  const SwapsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">My Swaps</h2>
        <Link
          to="/browse"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Search className="h-4 w-4" />
          <span>Browse Items</span>
        </Link>
      </div>

      {swaps.length > 0 ? (
        <div className="space-y-4">
          {swaps.map((swap) => (
            <div
              key={swap.id}
              className="bg-white rounded-lg p-6 shadow-sm border"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {swap.type === "swap" ? "Item Swap" : "Points Redemption"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Created {new Date(swap.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    swap.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : swap.status === "accepted"
                      ? "bg-green-100 text-green-800"
                      : swap.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {swap.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Requested Item
                  </p>
                  <p className="text-gray-900">{swap.requestItem?.title}</p>
                </div>
                {swap.offeredItem && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Offered Item
                    </p>
                    <p className="text-gray-900">{swap.offeredItem?.title}</p>
                  </div>
                )}
              </div>

              {swap.notes && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </p>
                  <p className="text-gray-600">{swap.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Link
                  to={`/swaps/${swap.id}`}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  View Details
                </Link>
                {swap.status === "pending" && (
                  <div className="flex space-x-2">
                    <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                      Accept
                    </button>
                    <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No swaps yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start swapping by browsing available items
          </p>
          <Link
            to="/browse"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Items
          </Link>
        </div>
      )}
    </div>
  );

  const ProfileTab = () => {
    const { updateProfile } = useAuthStore();
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
      name: user?.name || "",
    });

    const handleInputChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!formData.name.trim()) {
        toast.error("Name cannot be empty");
        return;
      }

      try {
        setIsUpdating(true);
        await updateProfile(formData);
        toast.success("Profile updated successfully");
        
        // Reload dashboard data to reflect changes
        await loadDashboardData();
      } catch (error) {
        const msg = error.response?.data?.message || error.message || "Failed to update profile";
        toast.error(msg);
      } finally {
        setIsUpdating(false);
      }
    };

    const handleCancel = () => {
      setFormData({
        name: user?.name || "",
      });
    };

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user?.name}
              </h3>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button 
                type="submit"
                disabled={isUpdating}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
              <button 
                type="button"
                onClick={handleCancel}
                disabled={isUpdating}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/browse"
              className="bg-white text-gray-700 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Browse Items</span>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: Package },
                { id: "items", label: "My Items", icon: Package },
                { id: "swaps", label: "My Swaps", icon: RefreshCw },
                { id: "profile", label: "Profile", icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "items" && <ItemsTab />}
            {activeTab === "swaps" && <SwapsTab />}
            {activeTab === "profile" && <ProfileTab />}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardPage;

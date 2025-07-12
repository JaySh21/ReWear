import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../lib/store";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    getCurrentUser,
    checkTokenExpiry,
    sessionExpired,
  } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkTokenExpiry();
    if (!isAuthenticated && !isLoading) {
      getCurrentUser();
    }
  }, [
    isAuthenticated,
    isLoading,
    getCurrentUser,
    checkTokenExpiry,
    location.pathname,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, sessionExpired }}
        replace
      />
    );
  }

  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth.js";
import { useAdminStore } from "../../stores/adminStore.js";
import { useUiStore } from "../../stores/uiStore.js";
import { ROUTES } from "../../constants/routes.js";
import { MESSAGES } from "../../constants/messages.js";
import Button from "../../components/ui/atoms/Button.jsx";
import Card from "../../components/ui/molecules/Card.jsx";
import Spinner from "../../components/ui/atoms/Spinner.jsx";
import { formatPrice, formatNumber } from "../../utils/formatters.js";

/**
 * AdminDashboard page component - Main admin dashboard with analytics
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const { fetchDashboardStats, fetchRecentOrders, fetchLowStockProducts } =
    useAdminStore();
  const { showError } = useUiStore();

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: fetchDashboardStats,
    enabled: !!user?.isAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch recent orders
  const { data: recentOrders } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: () => fetchRecentOrders(5),
    enabled: !!user?.isAdmin,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch low stock products
  const { data: lowStockProducts } = useQuery({
    queryKey: ["admin-low-stock-products"],
    queryFn: () => fetchLowStockProducts(5),
    enabled: !!user?.isAdmin,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  useEffect(() => {
    if (!user?.isAdmin) {
      showError("Access denied. Admin privileges required.");
    }
  }, [user, showError]);

  if (!user?.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <Button as={Link} to={ROUTES.HOME}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const dashboardStats = stats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentRevenue: 0,
    recentOrders: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user.name}! Here's what's happening with your store.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button as={Link} to={ROUTES.ADMIN_PRODUCTS} variant="outline">
            Manage Products
          </Button>
          <Button as={Link} to={ROUTES.ADMIN_ORDERS}>
            View Orders
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(dashboardStats.totalRevenue)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboardStats.totalOrders)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboardStats.totalProducts)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboardStats.totalUsers)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h2>
            <Button
              as={Link}
              to={ROUTES.ADMIN_ORDERS}
              variant="outline"
              size="sm"
            >
              View All
            </Button>
          </div>

          {recentOrders?.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Order #{order.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.user?.name || "Unknown User"} •{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatPrice(order.total)}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent orders</p>
            </div>
          )}
        </Card>

        {/* Low Stock Alert */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Low Stock Alert
            </h2>
            <Button
              as={Link}
              to={ROUTES.ADMIN_INVENTORY}
              variant="outline"
              size="sm"
            >
              Manage Inventory
            </Button>
          </div>

          {lowStockProducts?.length > 0 ? (
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={
                          product.images?.[0] ||
                          "/images/placeholder-product.jpg"
                        }
                        alt={product.name}
                        className="w-full h-full object-center object-cover"
                        onError={(e) => {
                          e.target.src = "/images/placeholder-product.jpg";
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-32">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        SKU: {product.sku || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      {product.stock} left
                    </p>
                    <p className="text-xs text-gray-500">
                      Min: {product.minStock || 5}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">All products are well stocked</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            as={Link}
            to={ROUTES.ADMIN_PRODUCTS}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center"
          >
            <svg
              className="w-6 h-6 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Product
          </Button>

          <Button
            as={Link}
            to={ROUTES.ADMIN_USERS}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center"
          >
            <svg
              className="w-6 h-6 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            Manage Users
          </Button>

          <Button
            as={Link}
            to={ROUTES.ADMIN_ANALYTICS}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center"
          >
            <svg
              className="w-6 h-6 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            View Analytics
          </Button>

          <Button
            as={Link}
            to={ROUTES.ADMIN_SETTINGS}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center"
          >
            <svg
              className="w-6 h-6 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;

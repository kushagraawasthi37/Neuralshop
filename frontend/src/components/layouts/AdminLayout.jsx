import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useUiStore } from "../../stores/uiStore.js";
import { ROUTES, NAVIGATION } from "../../constants/routes.js";
import Button from "../ui/atoms/Button.jsx";
import Spinner from "../ui/atoms/Spinner.jsx";

/**
 * AdminLayout component - Layout for admin dashboard pages
 * Includes sidebar navigation and admin-specific header
 */
const AdminLayout = ({ children }) => {
  const { user, logout, isLoading } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate(ROUTES.LOGIN);
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const getNavItemClasses = (path) => {
    const baseClasses =
      "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors";
    const activeClasses = isActiveRoute(path)
      ? "bg-primary-50 text-primary-700 border-r-2 border-primary-700"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

    return `${baseClasses} ${activeClasses}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link to={ROUTES.ADMIN.DASHBOARD} className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">NeuralShop</h1>
              <span className="ml-2 text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                Admin
              </span>
            </Link>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {NAVIGATION.ADMIN.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={getNavItemClasses(item.path)}
                onClick={() => toggleSidebar()}
              >
                <svg
                  className="mr-3 h-5 w-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {/* Icon would be rendered based on item.icon */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full justify-center"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Signing out...
                  </>
                ) : (
                  "Sign Out"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome back, {user?.name?.split(" ")[0] || "Admin"}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default AdminLayout;

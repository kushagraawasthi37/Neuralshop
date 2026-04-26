import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useCart } from "../../hooks/useCart.js";
import { useUiStore } from "../../stores/uiStore.js";
import { ROUTES, NAVIGATION } from "../../constants/routes.js";
import Button from "../ui/atoms/Button.jsx";
import Spinner from "../ui/atoms/Spinner.jsx";

/**
 * UserLayout component - Main layout for user-facing pages
 * Includes header with navigation, cart, and user menu
 */
const UserLayout = ({ children }) => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const { itemCount, isLoading: cartLoading } = useCart();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center">
              <Link to={ROUTES.HOME} className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-primary-600">
                    NeuralShop
                  </h1>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                {NAVIGATION.USER.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActiveRoute(item.path)
                        ? "border-primary-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right side - Cart and User menu */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Link
                to={ROUTES.CART}
                className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3"
                  />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-primary-600 rounded-full">
                    {cartLoading ? (
                      <Spinner size="xs" color="white" />
                    ) : (
                      itemCount
                    )}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={toggleSidebar}
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  </button>

                  {/* User dropdown would go here */}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to={ROUTES.LOGIN}>
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to={ROUTES.REGISTER}>
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {sidebarOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {NAVIGATION.USER.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActiveRoute(item.path)
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => toggleSidebar()}
                >
                  {item.label}
                </Link>
              ))}

              {isAuthenticated && (
                <button
                  onClick={() => {
                    handleLogout();
                    toggleSidebar();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing out..." : "Sign Out"}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900">
                NeuralShop
              </h3>
              <p className="mt-4 text-gray-600">
                Your one-stop destination for all your shopping needs. Quality
                products, great prices, and excellent service.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Quick Links
              </h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    to={ROUTES.PRODUCTS}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.CART}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Cart
                  </Link>
                </li>
                {isAuthenticated && (
                  <li>
                    <Link
                      to={ROUTES.ORDER_HISTORY}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Orders
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Support
              </h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Returns
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <p className="text-center text-gray-500 text-sm">
              © 2024 NeuralShop. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;

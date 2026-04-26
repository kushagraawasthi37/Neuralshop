import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes.js";

/**
 * AuthLayout component - Layout for authentication pages (login, register, etc.)
 * Clean, centered layout without navigation
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to={ROUTES.HOME}>
            <h1 className="text-3xl font-bold text-primary-600">NeuralShop</h1>
          </Link>
          <p className="mt-2 text-sm text-gray-600">
            Your one-stop destination for quality products
          </p>
        </div>

        {/* Auth Form Container */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          {children}
        </div>

        {/* Footer Links */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.js";
import { useUiStore } from "./stores/uiStore.js";
import { ROUTES } from "./constants/routes.js";

// Lazy load components for code splitting
const Landing = lazy(() => import("./pages/Landing.jsx"));
const Login = lazy(() => import("./pages/auth/Login.jsx"));
const Register = lazy(() => import("./pages/auth/Register.jsx"));
const Products = lazy(() => import("./pages/Products.jsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));
const Checkout = lazy(() => import("./pages/Checkout.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Orders = lazy(() => import("./pages/Orders.jsx"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts.jsx"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders.jsx"));

// Layout components
const UserLayout = lazy(() => import("./components/layouts/UserLayout.jsx"));
const AdminLayout = lazy(() => import("./components/layouts/AdminLayout.jsx"));
const AuthLayout = lazy(() => import("./components/layouts/AuthLayout.jsx"));

// Common components
const LoadingSpinner = lazy(
  () => import("./components/common/LoadingSpinner.jsx"),
);
const ErrorBoundary = lazy(
  () => import("./components/common/ErrorBoundary.jsx"),
);
const ToastContainer = lazy(
  () => import("./components/common/ToastContainer.jsx"),
);

// Protected Route wrapper
const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireAdmin = false,
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};

// Public Route wrapper (redirects authenticated users)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};

function App() {
  const { globalLoading } = useUiStore();

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <div className="min-h-screen bg-gray-50">
          {globalLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <LoadingSpinner size="lg" />
            </div>
          )}

          <Routes>
            {/* Public routes */}
            <Route
              path={ROUTES.HOME}
              element={
                <UserLayout>
                  <Landing />
                </UserLayout>
              }
            />

            {/* Auth routes */}
            <Route
              path={ROUTES.LOGIN}
              element={
                <PublicRoute>
                  <AuthLayout>
                    <Login />
                  </AuthLayout>
                </PublicRoute>
              }
            />
            <Route
              path={ROUTES.REGISTER}
              element={
                <PublicRoute>
                  <AuthLayout>
                    <Register />
                  </AuthLayout>
                </PublicRoute>
              }
            />

            {/* User protected routes */}
            <Route
              path={ROUTES.PRODUCTS}
              element={
                <UserLayout>
                  <Products />
                </UserLayout>
              }
            />
            <Route
              path={ROUTES.PRODUCT_DETAIL}
              element={
                <UserLayout>
                  <ProductDetail />
                </UserLayout>
              }
            />
            <Route
              path={ROUTES.CART}
              element={
                <ProtectedRoute>
                  <UserLayout>
                    <Cart />
                  </UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CHECKOUT}
              element={
                <ProtectedRoute>
                  <UserLayout>
                    <Checkout />
                  </UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.PROFILE}
              element={
                <ProtectedRoute>
                  <UserLayout>
                    <Profile />
                  </UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ORDER_HISTORY}
              element={
                <ProtectedRoute>
                  <UserLayout>
                    <Orders />
                  </UserLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin protected routes */}
            <Route
              path={ROUTES.ADMIN.DASHBOARD}
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN.PRODUCTS}
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminProducts />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN.ORDERS}
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminOrders />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>

          <ToastContainer />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import MainLayout from "./components/layout/MainLayout";

// Pages
import Home from "./pages/user/Home";
import ProductDetail from "./pages/user/ProductDetail";
import Cart from "./pages/user/Cart";
import Checkout from "./pages/user/Checkout";
import Orders from "./pages/user/Orders";
import Profile from "./pages/user/Profile";
import Wishlist from "./pages/user/Wishlist";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminRegister from "./pages/auth/AdminRegister";
import AdminVerifyEmail from "./pages/auth/AdminVerifyEmail";
import AdminForgetPassword from "./pages/auth/AdminForgetPassword";
import AdminResetPassword from "./pages/auth/AdminResetPassword";
import LogoutConfirm from "./pages/auth/LogoutConfirm";
import AuthLayout from "./components/layout/AuthLayout";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Toaster position="top-right" />
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* AUTH */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ADMIN AUTH */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/admin/verify-email" element={<AdminVerifyEmail />} />
            <Route
              path="/admin/forgot-password"
              element={<AdminForgetPassword />}
            />
            <Route
              path="/admin/reset-password"
              element={<AdminResetPassword />}
            />
          </Route>

          {/* USER */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/logout" element={<LogoutConfirm />} />

          {/* ADMIN */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/logout" element={<LogoutConfirm />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;

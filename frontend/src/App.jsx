import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useCursor } from "./hooks/useCursor";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import NewPasswordPage from "./pages/auth/NewPasswordPage";
import AdminLoginPage from "./pages/auth/AdminLoginPage";
import AdminRegisterPage from "./pages/auth/AdminRegisterPage";
import LogoutPage from "./pages/auth/LogoutPage";
import LoggedOutPage from "./pages/auth/LoggedOutPage";

const AUTH_PATHS = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/new-password",
  "/admin/login",
  "/admin/register",
  "/logout",
  "/logged-out",
];

function AppShell() {
  useCursor();
  const { pathname } = useLocation();
  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p));

  return (
    <>
      <div id="cursor-dot" />
      <div id="cursor-ring" />
      <div className="grid-bg" />

      {!isAuth && <Navbar />}

      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth — own nav, no footer, no scroll */}
        <Route
          path="/login"
          element={
            <AuthPage>
              <LoginPage />
            </AuthPage>
          }
        />
        <Route
          path="/register"
          element={
            <AuthPage>
              <RegisterPage />
            </AuthPage>
          }
        />
        <Route
          path="/verify-email"
          element={
            <AuthPage>
              <VerifyEmailPage />
            </AuthPage>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthPage>
              <ForgotPasswordPage />
            </AuthPage>
          }
        />
        <Route
          path="/reset-password"
          element={
            <AuthPage>
              <ResetPasswordPage />
            </AuthPage>
          }
        />
        <Route
          path="/new-password"
          element={
            <AuthPage>
              <NewPasswordPage />
            </AuthPage>
          }
        />
        <Route
          path="/admin/login"
          element={
            <AuthPage admin>
              <AdminLoginPage />
            </AuthPage>
          }
        />
        <Route
          path="/admin/register"
          element={
            <AuthPage admin>
              <AdminRegisterPage />
            </AuthPage>
          }
        />
        <Route
          path="/logout"
          element={
            <AuthPage hideLinks>
              <LogoutPage />
            </AuthPage>
          }
        />
        <Route
          path="/logged-out"
          element={
            <AuthPage hideLinks>
              <LoggedOutPage />
            </AuthPage>
          }
        />

        {/* App pages */}
        <Route
          path="/collections"
          element={<PlaceholderPage title="Collections" />}
        />
        <Route
          path="/product/:id"
          element={<PlaceholderPage title="Product Detail" />}
        />
        <Route path="/cart" element={<PlaceholderPage title="Cart" />} />
        <Route
          path="/checkout"
          element={<PlaceholderPage title="Checkout" />}
        />
        <Route path="/account" element={<PlaceholderPage title="Account" />} />
        <Route path="/orders" element={<PlaceholderPage title="Orders" />} />
        <Route path="/about" element={<PlaceholderPage title="About" />} />
        <Route path="*" element={<PlaceholderPage title="404 — Not Found" />} />
      </Routes>

      {!isAuth && <Footer />}
    </>
  );
}

/* Auth shell — fixed nav + no-scroll container */
function AuthPage({ children, admin, hideLinks }) {
  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "#0e0d0b",
      }}
    >
      {/* Auth nav */}
      <nav
        style={{
          flexShrink: 0,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 52px",
          borderBottom: "1px solid rgba(201,169,110,0.06)",
          backdropFilter: "blur(20px)",
          background: "rgba(14,13,11,0.88)",
          zIndex: 100,
        }}
      >
        <a
          href="/"
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 22,
            fontWeight: 300,
            color: "#f0e6d0",
            letterSpacing: "0.04em",
            textDecoration: "none",
          }}
        >
          Neural<span style={{ color: "#c9a96e" }}>·</span>Shop
        </a>
        {!hideLinks && (
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {admin ? (
              <>
                <NavLink href="/admin/login">Admin Sign In</NavLink>
                <Sep />
                <NavLink href="/admin/register">Seller Register</NavLink>
              </>
            ) : (
              <>
                <NavLink href="/login">Sign In</NavLink>
                <Sep />
                <NavLink href="/register">Register</NavLink>
              </>
            )}
          </div>
        )}
      </nav>
      {/* Content fills remaining viewport exactly */}
      <div style={{ flex: 1, overflow: "hidden" }}>{children}</div>
    </div>
  );
}

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      style={{
        fontSize: 10,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "rgba(240,230,208,0.38)",
        textDecoration: "none",
        transition: "color 0.3s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a96e")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.color = "rgba(240,230,208,0.38)")
      }
    >
      {children}
    </a>
  );
}
function Sep() {
  return (
    <div
      style={{ width: 1, height: 14, background: "rgba(201,169,110,0.18)" }}
    />
  );
}

function PlaceholderPage({ title }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 80,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 52,
            fontWeight: 300,
            color: "#c9a96e",
            marginBottom: 16,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 13, color: "rgba(240,230,208,0.4)" }}>
          Being crafted — coming soon.
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

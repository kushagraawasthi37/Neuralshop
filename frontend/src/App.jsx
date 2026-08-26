import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useCursor } from "./hooks/useCursor";
import { useAuthStore } from "./store/authStore";
import { userApi } from "./api/user";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import VoiceAssistant from "./components/VoiceAssistant";
import { getSessionId } from "./hooks/useBehaviorTracker";

/* Route-level lazy imports — each page loads only when navigated to */
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));
const ForgotPasswordPage = lazy(
  () => import("./pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const NewPasswordPage = lazy(() => import("./pages/auth/NewPasswordPage"));
const AdminLoginPage = lazy(() => import("./pages/auth/AdminLoginPage"));
const AdminRegisterPage = lazy(() => import("./pages/auth/AdminRegisterPage"));
const LogoutPage = lazy(() => import("./pages/auth/LogoutPage"));
const LoggedOutPage = lazy(() => import("./pages/auth/LoggedOutPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderConfirmationPage = lazy(
  () => import("./pages/OrderConfirmationPage"),
);
const OrderTrackingPage = lazy(() => import("./pages/OrderTrackingPage"));
const OrderHistoryPage = lazy(() => import("./pages/account/OrderHistoryPage"));
const ProfilePage = lazy(() => import("./pages/account/ProfilePage"));
const WishlistPage = lazy(() => import("./pages/account/WishlistPage"));
const ReturnsPage = lazy(() => import("./pages/account/ReturnsPage"));
const AdminDashboardPage = lazy(
  () => import("./pages/admin/AdminDashboardPage"),
);
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const CollectionPage = lazy(() => import("./pages/CollectionPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));

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

const NO_NAV_PATHS = ["/admin/dashboard"];

function PageLoader() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: "1px solid rgba(201,169,110,0.25)",
          borderTopColor: "#c9a96e",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function AppShell() {
  const { pathname } = useLocation();
  useCursor();
  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p));
  const isAdmin = NO_NAV_PATHS.some((p) => pathname.startsWith(p));

  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);

  // Seed session ID on first visit so behavior tracking works immediately
  useEffect(() => { getSessionId(); }, []);

  useEffect(() => {
    const initAuth = async () => {
      const raw = localStorage.getItem("token");
      const validToken = raw && raw !== "undefined" && raw !== "null";
      if (!validToken) {
        logout();
        return;
      }
      try {
        const res = await userApi.getMe();
        setAuth(res.data.user, raw, res.data.user.role || "user");
      } catch {
        logout();
      }
    };

    initAuth();
  }, []);

  return (
    <>
      <div id="cursor-dot" />
      <div id="cursor-ring" />
      <div className="grid-bg" />

      {!isAuth && !isAdmin && <Navbar />}

      <Suspense fallback={<PageLoader />}>
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

          {/* Commerce pages */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route
            path="/order-confirmation"
            element={<PrivateRoute><OrderConfirmationPage /></PrivateRoute>}
          />
          <Route
            path="/orders/:orderId/track"
            element={<PrivateRoute><OrderTrackingPage /></PrivateRoute>}
          />

          {/* Account pages */}
          <Route path="/account/orders" element={<PrivateRoute><OrderHistoryPage /></PrivateRoute>} />
          <Route path="/account/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/account/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
          <Route path="/account/returns" element={<PrivateRoute><ReturnsPage /></PrivateRoute>} />

          {/* Admin — heavy dashboard loads only for admin users */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

          {/* Product pages */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/search" element={<SearchPage />} />

          {/* Other pages */}
          <Route path="/collections" element={<CollectionPage />} />
          <Route
            path="/account"
            element={<Navigate to="/account/profile" replace />}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="*"
            element={<PlaceholderPage title="404 — Not Found" />}
          />
        </Routes>
      </Suspense>

      {!isAuth && !isAdmin && <Footer />}

      <VoiceAssistant />
    </>
  );
}

function PrivateRoute({ children }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const { pathname } = useLocation();

  if (isInitializing) return <PageLoader />;
  if (!isLoggedIn) return <Navigate to={`/login?return=${encodeURIComponent(pathname)}`} replace />;
  return children;
}

function AuthPage({ children, admin, hideLinks }) {
  return (
    <div className="auth-page-shell">
      <nav className="auth-nav">
        <a href="/" className="auth-logo">
          Neural<span style={{ color: "#c9a96e" }}>·</span>Shop
        </a>
        {!hideLinks && (
          <div className="auth-nav-links">
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
      <div className="auth-content">{children}</div>
    </div>
  );
}

function NavLink({ href, children }) {
  return (
    <a href={href} className="auth-nav-link">
      {children}
    </a>
  );
}

function Sep() {
  return <div className="auth-nav-sep" />;
}

function PlaceholderPage({ title }) {
  return (
    <div className="placeholder-page">
      <div>
        <div className="placeholder-title">{title}</div>
        <div className="placeholder-sub">Being crafted — coming soon.</div>
      </div>
    </div>
  );
}

//Query ClientProvider wraps the entire app to provide React Query functionality, and BrowserRouter enables routing. The AppShell component contains the main structure of the app, including navigation, routes, and footer.
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

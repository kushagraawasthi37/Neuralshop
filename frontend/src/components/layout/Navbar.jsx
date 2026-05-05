import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import { cartApi } from "../../api/cart";

const NAV_LINKS = [
  ["Collections", "/collections"],
  ["New Arrivals", "/collections?sortBy=newest"],
  ["Search", "/search"],
  ["About", "/about"],
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuthStore();
  const isUser = isLoggedIn && role === "user";

  const { data: cartSummary } = useQuery({
    queryKey: ["cart-summary"],
    queryFn: () => cartApi.summary().then((r) => r.data.data),
    enabled: isUser,
    staleTime: 30000,
  });
  const cartCount = cartSummary?.itemCount || 0;

  const handleLogout = () => {
    setProfileOpen(false);
    setMobileOpen(false);
    navigate("/logout");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  if (isLoggedIn && role === "admin") return null;

  return (
    <>
      <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          Neural<span style={{ color: "#c9a96e" }}>·</span>Shop
        </Link>

        {/* Desktop links */}
        <ul className="navbar__links">
          {NAV_LINKS.map(([label, path]) => (
            <li key={label}>
              <Link to={path} className="navbar__link">
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="navbar__actions">
          {/* Search icon — hidden on mobile (in drawer instead) */}
          <button
            onClick={() => navigate("/search")}
            className="navbar__icon-btn navbar__search-btn"
            aria-label="Search"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          {/* Cart */}
          <button
            onClick={() => navigate("/cart")}
            className="navbar__icon-btn navbar__cart-btn"
            aria-label="Cart"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="navbar__cart-badge">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          {/* Profile / Sign In — desktop only */}
          {isUser ? (
            <div
              ref={dropdownRef}
              style={{ position: "relative" }}
              className="navbar__profile-wrap"
            >
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className={`navbar__icon-btn${profileOpen ? " navbar__icon-btn--active" : ""}`}
                aria-label="Profile"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              {profileOpen && (
                <div className="navbar__dropdown">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/account/profile");
                    }}
                    className="navbar__dropdown-item"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/account/orders");
                    }}
                    className="navbar__dropdown-item"
                  >
                    My Orders
                  </button>
                  <button
                    onClick={handleLogout}
                    className="navbar__dropdown-item navbar__dropdown-item--danger"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="navbar__signin-btn navbar__signin-desktop"
            >
              Sign In
            </button>
          )}

          {/* Hamburger / Close (transforms via CSS) */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className={`navbar__hamburger${mobileOpen ? " navbar__hamburger--open" : ""}`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span className="navbar__hamburger-line" />
            <span className="navbar__hamburger-line" />
            <span className="navbar__hamburger-line" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`mobile-menu${mobileOpen ? " mobile-menu--open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        <div className="mobile-menu__inner">
          {/* Drawer header */}
          <div className="mobile-menu__header">
            <span className="mobile-menu__brand">
              Neural<span style={{ color: "#c9a96e" }}>·</span>Shop
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              className="mobile-menu__close-btn"
              aria-label="Close"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="mobile-menu__nav">
            {NAV_LINKS.map(([label, path], i) => (
              <Link
                key={label}
                to={path}
                className="mobile-menu__link"
                onClick={() => setMobileOpen(false)}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span>{label}</span>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  className="mobile-menu__link-arrow"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </nav>

          <div className="mobile-menu__divider" />

          {/* Account actions */}
          <div className="mobile-menu__actions">
            {isUser ? (
              <>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/account/profile");
                  }}
                  className="mobile-menu__action-btn"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/account/orders");
                  }}
                  className="mobile-menu__action-btn"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  >
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                  </svg>
                  My Orders
                </button>
                <button
                  onClick={handleLogout}
                  className="mobile-menu__action-btn mobile-menu__action-btn--danger"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  >
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/login");
                }}
                className="mobile-menu__signin"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Quick-action pills */}
          <div className="mobile-menu__quick">
            <button
              onClick={() => {
                setMobileOpen(false);
                navigate("/search");
              }}
              className="mobile-menu__quick-pill"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              Search
            </button>
            <button
              onClick={() => {
                setMobileOpen(false);
                navigate("/cart");
              }}
              className="mobile-menu__quick-pill"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              Cart{cartCount > 0 ? ` (${cartCount})` : ""}
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="mobile-menu__backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

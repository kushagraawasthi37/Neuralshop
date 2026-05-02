import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import { cartApi } from "../../api/cart";

const NAV_LINKS = [
  ["Collections", "/collections"],
  ["New Arrivals", "/products?sort=newest"],
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

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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
              <Link to={path} className="navbar__link">{label}</Link>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="navbar__actions">
          {/* Search */}
          <button onClick={() => navigate("/search")} className="navbar__icon-btn" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          {/* Cart */}
          <button onClick={() => navigate("/cart")} className="navbar__icon-btn navbar__cart-btn" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
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

          {/* Profile / Sign In */}
          {isUser ? (
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className={`navbar__icon-btn${profileOpen ? " navbar__icon-btn--active" : ""}`}
                aria-label="Profile"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              {profileOpen && (
                <div className="navbar__dropdown">
                  <button onClick={() => { setProfileOpen(false); navigate("/account/profile"); }} className="navbar__dropdown-item">
                    My Profile
                  </button>
                  <button onClick={() => { setProfileOpen(false); navigate("/account/orders"); }} className="navbar__dropdown-item">
                    My Orders
                  </button>
                  <button onClick={handleLogout} className="navbar__dropdown-item navbar__dropdown-item--danger">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate("/login")} className="navbar__signin-btn">
              Sign In
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="navbar__hamburger"
            aria-label="Menu"
          >
            <span className={`navbar__hamburger-line${mobileOpen ? " open" : ""}`} />
            <span className={`navbar__hamburger-line${mobileOpen ? " open" : ""}`} />
            <span className={`navbar__hamburger-line${mobileOpen ? " open" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-menu${mobileOpen ? " mobile-menu--open" : ""}`}>
        <div className="mobile-menu__inner">
          <nav className="mobile-menu__nav">
            {NAV_LINKS.map(([label, path]) => (
              <Link
                key={label}
                to={path}
                className="mobile-menu__link"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="mobile-menu__divider" />

          <div className="mobile-menu__actions">
            <button
              onClick={() => { setMobileOpen(false); navigate("/search"); }}
              className="mobile-menu__action-btn"
            >
              Search
            </button>
            <button
              onClick={() => { setMobileOpen(false); navigate("/cart"); }}
              className="mobile-menu__action-btn"
            >
              Cart{cartCount > 0 && ` (${cartCount})`}
            </button>
            {isUser ? (
              <>
                <button
                  onClick={() => { setMobileOpen(false); navigate("/account/profile"); }}
                  className="mobile-menu__action-btn"
                >
                  My Profile
                </button>
                <button
                  onClick={() => { setMobileOpen(false); navigate("/account/orders"); }}
                  className="mobile-menu__action-btn"
                >
                  My Orders
                </button>
                <button onClick={handleLogout} className="mobile-menu__action-btn mobile-menu__action-btn--danger">
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { setMobileOpen(false); navigate("/login"); }}
                className="mobile-menu__signin"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div className="mobile-menu__backdrop" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}

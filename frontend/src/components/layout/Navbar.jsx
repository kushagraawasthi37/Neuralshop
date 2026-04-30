import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import { cartApi } from "../../api/cart";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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
    navigate("/logout");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Don't show navbar for admin users
  if (isLoggedIn && role === "admin") return null;

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: scrolled ? "18px 52px" : "28px 52px",
        background: scrolled
          ? "rgba(13,12,11,0.92)"
          : "linear-gradient(to bottom, rgba(13,12,11,0.9) 0%, transparent 100%)",
        backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
        borderBottom: scrolled ? "1px solid rgba(201,169,110,0.1)" : "none",
        transition: "all 0.6s ease",
      }}
    >
      <Link
        to="/"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 22,
          fontWeight: 300,
          letterSpacing: "0.18em",
          color: "#f0e6d0",
          textTransform: "uppercase",
          textDecoration: "none",
        }}
      >
        Neural<span style={{ color: "#c9a96e" }}>·</span>Shop
      </Link>

      <ul style={{ display: "flex", gap: 40, listStyle: "none" }}>
        {[
          ["Collections", "/collections"],
          ["New Arrivals", "/products?sort=newest"],
          ["Search", "/search"],
          ["About", "/about"],
        ].map(([label, path]) => (
          <li key={label}>
            <Link
              to={path}
              style={{
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(240,230,208,0.6)",
                textDecoration: "none",
                position: "relative",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#c9a96e"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(240,230,208,0.6)"; }}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <button
          onClick={() => navigate("/search")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <svg
            width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="rgba(240,230,208,0.6)" strokeWidth="1.2"
            style={{ display: "block", transition: "stroke 0.3s" }}
            onMouseEnter={(e) => (e.currentTarget.style.stroke = "#c9a96e")}
            onMouseLeave={(e) => (e.currentTarget.style.stroke = "rgba(240,230,208,0.6)")}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>

        <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }}>
          <button
            onClick={() => navigate("/cart")}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, position: "relative" }}
          >
            <svg
              width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="rgba(240,230,208,0.6)" strokeWidth="1.2"
              style={{ display: "block", transition: "stroke 0.3s" }}
              onMouseEnter={(e) => (e.currentTarget.style.stroke = "#c9a96e")}
              onMouseLeave={(e) => (e.currentTarget.style.stroke = "rgba(240,230,208,0.6)")}
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: -6, right: -6,
                minWidth: 16, height: 16, background: "#c9a96e",
                borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 9, fontWeight: 600,
                color: "#0d0c0b", fontFamily: "'DM Sans',sans-serif",
                letterSpacing: 0, padding: "0 3px",
              }}>
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>
        </div>

        {isUser ? (
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 6 }}
            >
              <svg
                width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke={profileOpen ? "#c9a96e" : "rgba(240,230,208,0.6)"} strokeWidth="1.2"
                style={{ display: "block", transition: "stroke 0.3s" }}
                onMouseEnter={(e) => (e.currentTarget.style.stroke = "#c9a96e")}
                onMouseLeave={(e) => { if (!profileOpen) e.currentTarget.style.stroke = "rgba(240,230,208,0.6)"; }}
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {profileOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 14px)", right: 0,
                background: "#1a1916", border: "1px solid rgba(201,169,110,0.18)",
                minWidth: 160, zIndex: 200,
              }}>
                <button
                  onClick={() => { setProfileOpen(false); navigate("/account/profile"); }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "12px 18px", background: "none", border: "none",
                    borderBottom: "1px solid rgba(201,169,110,0.1)",
                    color: "rgba(240,230,208,0.7)", fontSize: 11,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a96e")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,230,208,0.7)")}
                >
                  My Profile
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate("/account/orders"); }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "12px 18px", background: "none", border: "none",
                    borderBottom: "1px solid rgba(201,169,110,0.1)",
                    color: "rgba(240,230,208,0.7)", fontSize: 11,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a96e")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,230,208,0.7)")}
                >
                  My Orders
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "12px 18px", background: "none", border: "none",
                    color: "rgba(190,110,110,0.75)", fontSize: 11,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(220,130,130,0.9)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(190,110,110,0.75)")}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "none",
              border: "1px solid rgba(201,169,110,0.25)",
              cursor: "pointer",
              padding: "8px 20px",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#c9a96e",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(201,169,110,0.08)";
              e.currentTarget.style.borderColor = "#c9a96e";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.borderColor = "rgba(201,169,110,0.25)";
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

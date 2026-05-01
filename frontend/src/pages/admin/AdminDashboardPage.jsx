import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  analyticsApi,
  adminInventoryApi,
  adminReturnsApi,
} from "../../api/admin";
import { authApi } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";
import DashboardPanel from "./panels/DashboardPanel";
import ProductsPanel from "./panels/ProductsPanel";
import OrdersPanel from "./panels/OrdersPanel";
import InventoryPanel from "./panels/InventoryPanel";
import AnalyticsPanel from "./panels/AnalyticsPanel";
import CouponsPanel from "./panels/CouponsPanel";
import ReturnsPanel from "./panels/ReturnsPanel";
import ReviewsPanel from "./panels/ReviewsPanel";
import ProfilePanel from "./panels/ProfilePanel";
import "./AdminDashboard.css";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: (
          <svg
            className="nav-icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <rect x="2" y="2" width="7" height="7" />
            <rect x="11" y="2" width="7" height="7" />
            <rect x="2" y="11" width="7" height="7" />
            <rect x="11" y="11" width="7" height="7" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        id: "products",
        label: "Products",
        icon: (
          <svg
            className="nav-icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <path d="M3 3h14v3H3zM5 6v11h10V6" />
            <path d="M8 10h4" />
          </svg>
        ),
      },
      {
        id: "orders",
        label: "Orders",
        badgeKey: "pending",
        icon: (
          <svg
            className="nav-icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <rect x="3" y="3" width="14" height="14" rx="1" />
            <path d="M7 7h6M7 10h6M7 13h4" />
          </svg>
        ),
      },
      {
        id: "inventory",
        label: "Inventory",
        badgeKey: "lowstock",
        icon: (
          <svg
            className="nav-icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <path d="M3 6l7-3 7 3v8l-7 3-7-3V6z" />
            <path d="M10 3v14M3 6l7 3 7-3" />
          </svg>
        ),
      },
      {
        id: "coupons",
        label: "Coupons",
        icon: (
          <svg
            className="nav-icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <path d="M2 7h16v6H2zM6 7v6M7 10h6" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      {
        id: "analytics",
        label: "Analytics",
        icon: (
          <svg
            className="nav-icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <path d="M3 15L7 9l4 3 3-5 3 3" />
            <path d="M3 17h14" />
          </svg>
        ),
      },
      {
        id: "reviews",
        label: "Reviews",
        icon: (
          <svg
            className="nav-icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <path d="M3 3h14v10H3z" />
            <path d="M7 7h6M7 10h4" />
            <path d="M6 13l-3 4" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Post-Sale",
    items: [
      {
        id: "returns",
        label: "Returns",
        badgeKey: "returns",
        icon: (
          <svg
            className="nav-icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <path d="M4 8H16M4 8l4-4M4 8l4 4" />
            <path d="M16 12H4M16 12l-4-4M16 12l-4 4" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        id: "profile",
        label: "My Profile",
        icon: (
          <svg
            className="nav-icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <circle cx="10" cy="7" r="3" />
            <path d="M4 17c0-3.31 2.69-6 6-6s6 2.69 6 6" />
          </svg>
        ),
      },
    ],
  },
];

const PANEL_TITLES = {
  dashboard: (
    <>
      Admin <em>Dashboard</em>
    </>
  ),
  products: (
    <>
      Product <em>Management</em>
    </>
  ),
  orders: (
    <>
      Order <em>Management</em>
    </>
  ),
  inventory: (
    <>
      Inventory <em>Intelligence</em>
    </>
  ),
  analytics: (
    <>
      Analytics &amp; <em>Reports</em>
    </>
  ),
  coupons: (
    <>
      Coupon <em>Management</em>
    </>
  ),
  returns: (
    <>
      Returns &amp; <em>Refunds</em>
    </>
  ),
  reviews: (
    <>
      Review <em>Moderation</em>
    </>
  ),
  profile: (
    <>
      Admin <em>Profile</em>
    </>
  ),
};

export default function AdminDashboardPage() {
  const [panel, setPanel] = useState("dashboard");
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const handleSignOut = async () => {
    try {
      await authApi.adminLogout();
    } catch (_) {
      // continue even if API call fails
    }
    logout();
    navigate("/admin/login");
  };

  /* Badge queries — always active for sidebar counts */
  const { data: dashboard } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => analyticsApi.dashboard().then((r) => r.data.data),
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: () =>
      adminInventoryApi.getLowStock(10).then((r) => r.data.data || []),
  });

  const { data: returns = [] } = useQuery({
    queryKey: ["admin-returns"],
    queryFn: () =>
      adminReturnsApi.list().then((r) => {
        const d = r.data.data;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.returns)) return d.returns;
        return [];
      }),
  });

  const pendingOrders = dashboard?.pendingOrders || 0;
  const pendingReturns = returns.filter((r) => r.status === "REQUESTED").length;

  const tickerData = [
    `Total Revenue ₹${Number(dashboard?.totalRevenue || 0).toLocaleString("en-IN")}`,
    `Total Orders ${Number(dashboard?.totalOrders || 0).toLocaleString("en-IN")}`,
    `Avg Order ₹${Number(dashboard?.avgOrderValue || 0).toLocaleString("en-IN")}`,
    `Pending ${pendingOrders}`,
    `Low Stock ${inventory.length} items`,
    `Total Customers ${Number(dashboard?.totalCustomers || 0).toLocaleString("en-IN")}`,
  ];
  const tickerItems = [...tickerData, ...tickerData];

  const PANELS = {
    dashboard: <DashboardPanel onNavigate={setPanel} showToast={showToast} />,
    products: <ProductsPanel showToast={showToast} />,
    orders: <OrdersPanel showToast={showToast} />,
    inventory: <InventoryPanel showToast={showToast} />,
    analytics: <AnalyticsPanel showToast={showToast} />,
    coupons: <CouponsPanel showToast={showToast} />,
    returns: <ReturnsPanel showToast={showToast} />,
    reviews: <ReviewsPanel showToast={showToast} />,
    profile: <ProfilePanel showToast={showToast} />,
  };

  return (
    <div className="ns-admin-root">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="grid-bg" />

      {/* ════ SIDEBAR ════ */}
      <nav id="ns-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            Neural<span>·</span>Shop
          </div>
          <div className="sidebar-badge">Admin Intelligence Suite</div>
        </div>

        <div className="sidebar-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="nav-section-label">{section.label}</div>
              {section.items.map((item) => {
                const badge =
                  item.badgeKey === "pending"
                    ? pendingOrders
                    : item.badgeKey === "lowstock"
                      ? inventory.length
                      : item.badgeKey === "returns"
                        ? pendingReturns
                        : null;
                return (
                  <button
                    key={item.id}
                    className={
                      "nav-item" + (panel === item.id ? " active" : "")
                    }
                    onClick={() => setPanel(item.id)}
                  >
                    {item.icon}
                    {item.label}
                    {badge > 0 && (
                      <span className="nav-badge-count">{badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button
            className="admin-profile"
            onClick={() => setPanel("profile")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
              padding: 0,
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            title="Edit profile"
          >
            <div className="admin-avatar">A</div>
            <div>
              <div className="admin-name">Admin</div>
              <div className="admin-role">Super Admin</div>
            </div>
            <svg
              width="12"
              height="12"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              style={{
                marginLeft: "auto",
                color: "rgba(201,169,110,0.35)",
                flexShrink: 0,
              }}
            >
              <path d="M14 2l4 4-10 10H4v-4L14 2z" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ════ MAIN ════ */}
      <main id="ns-main">
        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-title">{PANEL_TITLES[panel]}</div>
          <div className="topbar-right">
            <span className="date-badge">
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>

            {/* Notification bell with pending orders count */}
            <div style={{ position: "relative" }}>
              <button
                className="topbar-btn topbar-notif"
                onClick={() => setNotifOpen((o) => !o)}
                title="Notifications"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                >
                  <path d="M10 2C7.24 2 5 4.24 5 7v4l-2 2v1h14v-1l-2-2V7c0-2.76-2.24-5-5-5z" />
                  <path d="M8 16a2 2 0 004 0" />
                </svg>
                {pendingOrders > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#c9a96e",
                    }}
                  />
                )}
              </button>
              {notifOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: 260,
                    background: "#1a1916",
                    border: "1px solid rgba(201,169,110,0.18)",
                    zIndex: 200,
                    padding: 16,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      marginBottom: 12,
                    }}
                  >
                    Notifications
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: "var(--text-mid)" }}>
                        Pending Orders
                      </span>
                      <span style={{ color: "var(--gold)" }}>
                        {pendingOrders}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: "var(--text-mid)" }}>
                        Low Stock Items
                      </span>
                      <span style={{ color: "var(--gold)" }}>
                        {inventory.length}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: "var(--text-mid)" }}>
                        Pending Returns
                      </span>
                      <span style={{ color: "var(--gold)" }}>
                        {pendingReturns}
                      </span>
                    </div>
                  </div>
                  <button
                    className="ns-btn ns-btn-ghost"
                    style={{
                      width: "100%",
                      marginTop: 14,
                      fontSize: 11,
                      padding: "8px 0",
                    }}
                    onClick={() => {
                      setNotifOpen(false);
                      setPanel("orders");
                    }}
                  >
                    View Orders →
                  </button>
                </div>
              )}
            </div>

            {/* Sign Out */}
            <button
              className="ns-btn ns-btn-ghost"
              style={{
                padding: "6px 14px",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onClick={handleSignOut}
              title="Sign Out"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M9 3H4a1 1 0 00-1 1v12a1 1 0 001 1h5M14 7l4 3-4 3M8 10h10" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* Ticker */}
        <div className="ticker-wrap" >
          <div className="ticker">
            {tickerItems.map((t, i) => (
              <span key={i} className="ticker-item">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Active Panel */}
        {PANELS[panel]}
      </main>

      {/* ════ TOAST ════ */}
      {toast.show && (
        <div className="toast-container">
          <div className="toast">
            <div className="toast-dot" />
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}

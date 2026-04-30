import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi, adminInventoryApi, adminReturnsApi } from "../../api/admin";
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
        id: "dashboard", label: "Dashboard",
        icon: <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="2" width="7" height="7" /><rect x="11" y="2" width="7" height="7" /><rect x="2" y="11" width="7" height="7" /><rect x="11" y="11" width="7" height="7" /></svg>,
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        id: "products", label: "Products",
        icon: <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 3h14v3H3zM5 6v11h10V6" /><path d="M8 10h4" /></svg>,
      },
      {
        id: "orders", label: "Orders", badgeKey: "pending",
        icon: <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="3" width="14" height="14" rx="1" /><path d="M7 7h6M7 10h6M7 13h4" /></svg>,
      },
      {
        id: "inventory", label: "Inventory", badgeKey: "lowstock",
        icon: <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 6l7-3 7 3v8l-7 3-7-3V6z" /><path d="M10 3v14M3 6l7 3 7-3" /></svg>,
      },
      {
        id: "coupons", label: "Coupons",
        icon: <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 7h16v6H2zM6 7v6M7 10h6" /></svg>,
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      {
        id: "analytics", label: "Analytics",
        icon: <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 15L7 9l4 3 3-5 3 3" /><path d="M3 17h14" /></svg>,
      },
      {
        id: "reviews", label: "Reviews",
        icon: <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 3h14v10H3z" /><path d="M7 7h6M7 10h4" /><path d="M6 13l-3 4" /></svg>,
      },
    ],
  },
  {
    label: "Post-Sale",
    items: [
      {
        id: "returns", label: "Returns", badgeKey: "returns",
        icon: <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 8H16M4 8l4-4M4 8l4 4" /><path d="M16 12H4M16 12l-4-4M16 12l-4 4" /></svg>,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        id: "profile", label: "My Profile",
        icon: <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="10" cy="7" r="3" /><path d="M4 17c0-3.31 2.69-6 6-6s6 2.69 6 6" /></svg>,
      },
    ],
  },
];

const PANEL_TITLES = {
  dashboard: <>Admin <em>Dashboard</em></>,
  products: <>Product <em>Management</em></>,
  orders: <>Order <em>Management</em></>,
  inventory: <>Inventory <em>Intelligence</em></>,
  analytics: <>Analytics &amp; <em>Reports</em></>,
  coupons: <>Coupon <em>Management</em></>,
  returns: <>Returns &amp; <em>Refunds</em></>,
  reviews: <>Review <em>Moderation</em></>,
  profile: <>Admin <em>Profile</em></>,
};

export default function AdminDashboardPage() {
  const [panel, setPanel] = useState("dashboard");
  const [toast, setToast] = useState({ show: false, msg: "" });

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  /* Badge queries — always active for sidebar counts */
  const { data: dashboard } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => analyticsApi.dashboard().then((r) => r.data.data),
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: () => adminInventoryApi.getLowStock(10).then((r) => r.data.data || []),
  });

  const { data: returns = [] } = useQuery({
    queryKey: ["admin-returns"],
    queryFn: () => adminReturnsApi.list().then((r) => {
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
          <div className="sidebar-logo">Neural<span>·</span>Shop</div>
          <div className="sidebar-badge">Admin Intelligence Suite</div>
        </div>

        <div className="sidebar-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="nav-section-label">{section.label}</div>
              {section.items.map((item) => {
                const badge =
                  item.badgeKey === "pending" ? pendingOrders
                    : item.badgeKey === "lowstock" ? inventory.length
                    : item.badgeKey === "returns" ? pendingReturns
                    : null;
                return (
                  <button key={item.id} className={"nav-item" + (panel === item.id ? " active" : "")} onClick={() => setPanel(item.id)}>
                    {item.icon}
                    {item.label}
                    {badge > 0 && <span className="nav-badge-count">{badge}</span>}
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
            style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", padding: 0, transition: "opacity 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            title="Edit profile"
          >
            <div className="admin-avatar">A</div>
            <div>
              <div className="admin-name">Admin</div>
              <div className="admin-role">Super Admin</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ marginLeft: "auto", color: "rgba(201,169,110,0.35)", flexShrink: 0 }}>
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
            <div className="topbar-search">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0, opacity: 0.5 }}>
                <circle cx="9" cy="9" r="6" /><path d="M16 16l-3-3" />
              </svg>
              <input placeholder="Search anything…" />
            </div>
            <span className="date-badge">
              {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <button className="topbar-btn topbar-notif">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M10 2C7.24 2 5 4.24 5 7v4l-2 2v1h14v-1l-2-2V7c0-2.76-2.24-5-5-5z" /><path d="M8 16a2 2 0 004 0" />
              </svg>
            </button>
            <button className="topbar-btn" onClick={() => setPanel("profile")} title="My Profile">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="10" cy="8" r="3" /><path d="M4 17c0-3.31 2.69-6 6-6s6 2.69 6 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Ticker */}
        <div className="ticker-wrap">
          <div className="ticker">
            {tickerItems.map((t, i) => <span key={i} className="ticker-item">{t}</span>)}
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

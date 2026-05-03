import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  analyticsApi,
  adminOrdersApi,
  adminInventoryApi,
  adminReturnsApi,
} from "../../../api/admin";
import { fmt, fmtNum, Badge, DonutChart } from "../adminUtils";

const tooltipStyle = {
  contentStyle: {
    background: "#1a1916",
    border: "1px solid rgba(201,169,110,0.18)",
    color: "#f0e6d0",
    fontSize: 12,
    borderRadius: 0,
  },
};
const axisTickProps = { fill: "rgba(240,230,208,0.35)", fontSize: 10 };

export default function DashboardPanel({ onNavigate }) {
  const { data: dashboard } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => analyticsApi.dashboard().then((r) => r.data.data),
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ["admin-sales"],
    queryFn: () => {
      const now = new Date();
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      ).toISOString();
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 30,
      ).toISOString();
      return analyticsApi
        .sales({ startDate: start, endDate: end })
        .then((r) => r.data.data);
    },
  });

  const { data: orderStatus } = useQuery({
    queryKey: ["admin-order-status"],
    queryFn: () => {
      const now = new Date();
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      ).toISOString();
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 30,
      ).toISOString();
      return analyticsApi
        .orderStatus({ startDate: start, endDate: end })
        .then((r) => r.data.data);
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () =>
      adminOrdersApi.list().then((r) => {
        const d = r.data.data;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.orders)) return d.orders;
        return [];
      }),
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

  const salesChartData = useMemo(() => {
    if (!salesData) return null; // null = still loading
    const list = Array.isArray(salesData.dailySales)
      ? salesData.dailySales
      : Array.isArray(salesData)
        ? salesData
        : [];
    return list.map((d) => ({
      date: d.date
        ? new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          })
        : new Date(d.createdAt).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          }),
      revenue: d.revenue ?? d._sum?.price ?? 0,
      orders:
        d.orders ??
        (typeof d._count === "number" ? d._count : d._count?._all) ??
        0,
    }));
  }, [salesData]);

  const ordersByStatus = useMemo(() => {
    if (!orderStatus) return null;
    if (Array.isArray(orderStatus)) {
      return Object.fromEntries(
        orderStatus.map((o) => [
          o.status,
          typeof o._count === "number" ? o._count : (o._count?._all ?? 0),
        ]),
      );
    }
    return orderStatus;
  }, [orderStatus]);

  const pendingOrders = dashboard?.pendingOrders || 0;
  const pendingReturns = returns.filter((r) => r.status === "REQUESTED").length;

  return (
    <div className="ns-content">
      <div className="page-header">
        <div className="page-eyebrow">01 — Overview</div>
        <div className="page-title">
          Intelligence <em>Dashboard</em>
        </div>
        <div className="page-sub">Real-time commerce pulse</div>
      </div>

      <div className="kpi-grid">
        {[
          {
            label: "Total Revenue",
            value: fmt(dashboard?.totalRevenue),
            gold: true,
            points: "0,28 15,22 30,30 45,18 60,24 75,12 90,18 105,8 120,14",
          },
          {
            label: "Total Orders",
            value: fmtNum(dashboard?.totalOrders),
            gold: false,
            points: "0,32 15,28 30,35 45,20 60,25 75,22 90,15 105,18 120,12",
          },
          {
            label: "Total Customers",
            value: fmtNum(dashboard?.totalCustomers),
            gold: false,
            points: "0,36 15,30 30,38 45,28 60,22 75,30 90,20 105,14 120,18",
          },
          {
            label: "Avg Order Value",
            value: fmt(dashboard?.avgOrderValue),
            gold: false,
            points: "0,30 15,35 30,28 45,32 60,22 75,26 90,20 105,22 120,16",
          },
        ].map(({ label, value, gold, points }) => (
          <div key={label} className="card">
            <div className="card-label">{label}</div>
            <div className={`card-value${gold ? " gold" : ""}`}>{value}</div>
            <svg
              className="sparkline"
              viewBox="0 0 120 48"
              style={{ marginTop: 12 }}
            >
              <polyline
                className="sparkline-area"
                points={`0,48 ${points} ${points.split(" ").at(-1).split(",")[0]},48`}
              />
              <polyline className="sparkline-line" points={points} />
            </svg>
          </div>
        ))}
      </div>

      <div className="two-col mt-2">
        <div className="card" style={{ padding: 28 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 24,
            }}
          >
            <div>
              <div className="card-label">Revenue Trend</div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 22,
                  fontWeight: 300,
                }}
              >
                {fmt(dashboard?.totalRevenue)}
              </div>
            </div>
          </div>
          {salesLoading || salesChartData === null ? (
            <div
              style={{
                height: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                fontSize: 13,
              }}
            >
              Loading…
            </div>
          ) : salesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a96e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#c9a96e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={axisTickProps}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={axisTickProps}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => "₹" + (v / 1000).toFixed(0) + "k"}
                />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(v) => [fmt(v), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#c9a96e"
                  strokeWidth={1.5}
                  fill="url(#revGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                fontSize: 13,
              }}
            >
              No sales data for this period
            </div>
          )}
        </div>
        <div className="card" style={{ padding: 28 }}>
          <div className="card-label" style={{ marginBottom: 24 }}>
            Order Status Distribution
          </div>
          <DonutChart data={ordersByStatus} />
        </div>
      </div>

      <div className="two-col mt-2">
        <div className="card" style={{ padding: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 24px 16px",
            }}
          >
            <div className="card-label" style={{ marginBottom: 0 }}>
              Recent Orders
            </div>
            <button
              className="ns-btn ns-btn-ghost"
              style={{ padding: "6px 14px", fontSize: 10 }}
              onClick={() => onNavigate("orders")}
            >
              View All →
            </button>
          </div>
          <div className="table-wrap">
            <table className="ns-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id}>
                    <td className="primary">
                      <span className="ns-code">
                        #{(o.id || "").slice(0, 8)}
                      </span>
                    </td>
                    <td>{(o.items || o.orderItems || []).length} items</td>
                    <td className="primary">
                      {fmt(o.totalAmount || o.sellerTotal)}
                    </td>
                    <td>
                      <Badge status={o.status} />
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: "32px 16px",
                        color: "var(--text-muted)",
                      }}
                    >
                      No orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dash-right-col">
          <div className="card" style={{ flex: 1 }}>
            <div className="card-label" style={{ marginBottom: 16 }}>
              Low Stock Alerts
            </div>
            {inventory.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                No low stock items
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {inventory.slice(0, 3).map((inv, i) => {
                  const avail = inv.availableStock ?? inv.totalStock;
                  const pct =
                    inv.totalStock > 0
                      ? Math.round((avail / inv.totalStock) * 100)
                      : 0;
                  return (
                    <div key={i}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <div>
                          <div
                            style={{ fontSize: 13, color: "var(--champagne)" }}
                          >
                            {inv.productId?.slice?.(0, 20) || "—"}
                          </div>
                          <div
                            style={{ fontSize: 11, color: "var(--text-muted)" }}
                          >
                            Size {inv.size || "—"}
                          </div>
                        </div>
                        <span className="badge badge-low">{avail} left</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill red"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div className="card-label" style={{ marginBottom: 14 }}>
              Quick Stats
            </div>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot active" />
                <div className="timeline-content">
                  <div className="timeline-title">
                    Pending orders: {fmtNum(pendingOrders)}
                  </div>
                  <div className="timeline-time">Awaiting action</div>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot active" />
                <div className="timeline-content">
                  <div className="timeline-title">
                    Low stock items: {fmtNum(inventory.length)}
                  </div>
                  <div className="timeline-time">Below threshold</div>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-title">
                    Pending returns: {fmtNum(pendingReturns)}
                  </div>
                  <div className="timeline-time">Requires review</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

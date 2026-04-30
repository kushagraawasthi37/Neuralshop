import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { analyticsApi } from "../../../api/admin";
import { fmt, fmtNum, DonutChart } from "../adminUtils";

const tooltipStyle = {
  contentStyle: { background: "#1a1916", border: "1px solid rgba(201,169,110,0.18)", color: "#f0e6d0", fontSize: 12, borderRadius: 0 },
};
const axisTickProps = { fill: "rgba(240,230,208,0.35)", fontSize: 10 };

export default function AnalyticsPanel() {
  const [tab, setTab] = useState("sales");

  const { data: dashboard } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => analyticsApi.dashboard().then((r) => r.data.data),
  });

  const { data: salesData } = useQuery({
    queryKey: ["admin-sales"],
    queryFn: () => analyticsApi.sales().then((r) => r.data.data),
  });

  const { data: orderStatus } = useQuery({
    queryKey: ["admin-order-status"],
    queryFn: () => analyticsApi.orderStatus().then((r) => r.data.data),
  });

  const { data: custData } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => analyticsApi.customers().then((r) => r.data.data),
    enabled: tab === "customers",
  });

  const salesChartData = useMemo(() => {
    if (!salesData) return [];
    if (Array.isArray(salesData)) return salesData;
    if (Array.isArray(salesData.dailySales)) {
      return salesData.dailySales.map((d) => ({
        date: new Date(d.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        revenue: d._sum?.price ?? 0,
        orders: d._count ?? 0,
      }));
    }
    return salesData.daily || salesData.weekly || [];
  }, [salesData]);

  const ordersByStatus = useMemo(() => {
    if (!orderStatus) return null;
    if (Array.isArray(orderStatus)) return Object.fromEntries(orderStatus.map((o) => [o.status, o._count]));
    return orderStatus;
  }, [orderStatus]);

  const topProducts = salesData?.topProducts || [];
  const maxRevenue = topProducts.reduce((max, p) => Math.max(max, p._sum?.price || 0), 1);
  const pendingOrders = dashboard?.pendingOrders || 0;

  return (
    <div className="ns-content">
      <div className="page-header">
        <div className="page-eyebrow">05 — Intelligence</div>
        <div className="page-title">Analytics &amp; <em>Reports</em></div>
        <div className="page-sub">Live commerce intelligence</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div className="ns-tabs">
          {["sales", "customers", "orders"].map((t) => (
            <button key={t} className={"ns-tab" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {tab === "sales" && (
        <>
          <div className="four-col" style={{ marginBottom: 2 }}>
            <div className="analytics-metric"><div className="analytics-label">Total Revenue</div><div className="analytics-val">{fmt(dashboard?.totalRevenue)}</div></div>
            <div className="analytics-metric"><div className="analytics-label">Total Orders</div><div className="analytics-val">{fmtNum(dashboard?.totalOrders)}</div></div>
            <div className="analytics-metric"><div className="analytics-label">Avg Order Value</div><div className="analytics-val">{fmt(dashboard?.avgOrderValue)}</div></div>
            <div className="analytics-metric"><div className="analytics-label">Pending Orders</div><div className="analytics-val">{fmtNum(pendingOrders)}</div></div>
          </div>

          <div className="two-col mt-2">
            <div className="card">
              <div className="card-label" style={{ marginBottom: 20 }}>Revenue Over Time</div>
              {salesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={salesChartData}>
                    <XAxis dataKey="date" tick={axisTickProps} axisLine={false} tickLine={false} />
                    <YAxis tick={axisTickProps} axisLine={false} tickLine={false} tickFormatter={(v) => "₹" + (v / 1000).toFixed(0) + "k"} />
                    <Tooltip {...tooltipStyle} formatter={(v) => [fmt(v), "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#c9a96e" strokeWidth={1.5} fill="rgba(201,169,110,0.05)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No data</div>
              )}
            </div>
            <div className="card">
              <div className="card-label" style={{ marginBottom: 20 }}>Daily Orders Volume</div>
              {salesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={salesChartData}>
                    <XAxis dataKey="date" tick={axisTickProps} axisLine={false} tickLine={false} />
                    <YAxis tick={axisTickProps} axisLine={false} tickLine={false} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="orders" fill="rgba(201,169,110,0.3)" stroke="rgba(201,169,110,0.6)" strokeWidth={0.5} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No data</div>
              )}
            </div>
          </div>

          {topProducts.length > 0 && (
            <div className="card mt-2">
              <div className="card-label" style={{ marginBottom: 20 }}>Top Products by Revenue</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {topProducts.slice(0, 5).map((p, i) => {
                  const rev = p._sum?.price || 0;
                  const pct = maxRevenue > 0 ? Math.round((rev / maxRevenue) * 100) : 0;
                  return (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                        <span style={{ color: "var(--champagne)" }}>{p.productId?.slice(0, 24) || "—"}</span>
                        <span style={{ color: "var(--gold)" }}>{fmt(rev)}</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {tab === "customers" && (
        <>
          <div className="three-col" style={{ marginBottom: 2 }}>
            <div className="analytics-metric"><div className="analytics-label">Total Customers</div><div className="analytics-val">{fmtNum(dashboard?.totalCustomers)}</div></div>
            <div className="analytics-metric"><div className="analytics-label">New This Month</div><div className="analytics-val">{fmtNum(custData?.newCustomers)}</div></div>
            <div className="analytics-metric"><div className="analytics-label">Repeat Buyers</div><div className="analytics-val">{fmtNum(custData?.repeatCustomers)}</div></div>
          </div>
          <div className="card mt-2">
            <div className="card-label" style={{ marginBottom: 20 }}>Avg Customer Value</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, color: "var(--gold)" }}>{fmt(custData?.avgCustomerValue)}</div>
          </div>
        </>
      )}

      {tab === "orders" && (
        <div className="card">
          <div className="card-label" style={{ marginBottom: 24 }}>Order Status Breakdown</div>
          <DonutChart data={ordersByStatus} />
        </div>
      )}
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { analyticsApi } from "../../../api/admin";
import { fmt, fmtNum } from "../adminUtils";

const tooltipStyle = { contentStyle: { background: "#1a1916", border: "1px solid rgba(201,169,110,0.18)", color: "#f0e6d0" } };

export default function AgentGrowthPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-agent-growth"],
    queryFn: () => analyticsApi.agentGrowth().then((response) => response.data.data),
  });
  const metrics = [
    ["AI Sessions", data?.sessions],
    ["Products Recommended", data?.productsRecommended],
    ["AI Cart Conversions", data?.cartConversions],
    ["AI Purchases", data?.purchases],
    ["Conversion Rate", `${data?.conversionRate || 0}%`],
    ["Assisted Revenue", fmt(data?.assistedRevenue)],
    ["Average Latency", `${data?.averageLatencyMs || 0}ms`],
    ["Failed Tasks", data?.failedTasks],
  ];
  return (
    <div className="ns-content">
      <div className="page-header"><div className="page-eyebrow">06 — Growth</div><div className="page-title">AI Commerce <em>Growth</em></div><div className="page-sub">Measured from recorded agent sessions and commerce events</div></div>
      {isLoading ? <div className="chart-empty">Loading AI growth data...</div> : <>
        <div className="four-col" style={{ marginBottom: 24 }}>{metrics.map(([label, value]) => <div className="analytics-metric" key={label}><div className="analytics-label">{label}</div><div className="analytics-val">{typeof value === "number" ? fmtNum(value) : value || "0"}</div></div>)}</div>
        <div className="two-col" style={{ marginBottom: 24 }}>
          <div className="chart-card"><div className="chart-title">AI Sessions Over Time</div><div style={{ height: 240 }}><ResponsiveContainer width="100%" height="100%"><AreaChart data={data?.dailySessions || []}><XAxis dataKey="date" tick={{ fill: "rgba(240,230,208,.35)", fontSize: 10 }} /><YAxis allowDecimals={false} tick={{ fill: "rgba(240,230,208,.35)", fontSize: 10 }} /><Tooltip {...tooltipStyle} /><Area type="monotone" dataKey="sessions" stroke="#c9a96e" fill="rgba(201,169,110,.16)" /></AreaChart></ResponsiveContainer></div></div>
          <div className="chart-card"><div className="chart-title">Tool Usage</div><div style={{ height: 240 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={data?.toolUsage || []}><XAxis dataKey="tool" tick={{ fill: "rgba(240,230,208,.35)", fontSize: 9 }} /><YAxis allowDecimals={false} tick={{ fill: "rgba(240,230,208,.35)", fontSize: 10 }} /><Tooltip {...tooltipStyle} /><Bar dataKey="calls" fill="#c9a96e" /><Bar dataKey="failures" fill="#9a5b4d" /></BarChart></ResponsiveContainer></div></div>
        </div>
        <div className="two-col"><div className="table-card"><div className="chart-title">Intent Distribution</div>{(data?.intentDistribution || []).map((entry) => <div className="metric-row" key={entry.intent}><span>{entry.intent}</span><strong>{entry.count}</strong></div>)}</div><div className="table-card"><div className="chart-title">Top Recommended Products</div>{(data?.topRecommendedProducts || []).map((entry) => <div className="metric-row" key={entry.productId}><span>{entry.productId}</span><strong>{entry.recommendations}</strong></div>)}</div></div>
      </>}
    </div>
  );
}

export const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
export const fmtNum = (n) => Number(n || 0).toLocaleString("en-IN");

export const STATUS_COLORS = {
  DELIVERED: "rgba(138,173,135,0.7)",
  PROCESSING: "rgba(100,150,220,0.6)",
  SHIPPED: "rgba(100,180,170,0.6)",
  PENDING: "rgba(201,160,110,0.5)",
  CANCELLED: "rgba(190,110,110,0.5)",
};

export function badgeClass(status) {
  const map = {
    PENDING: "badge-pending",
    PROCESSING: "badge-processing",
    SHIPPED: "badge-shipped",
    DELIVERED: "badge-delivered",
    CANCELLED: "badge-cancelled",
    REQUESTED: "badge-pending",
    APPROVED: "badge-processing",
    REFUNDED: "badge-delivered",
    REJECTED: "badge-cancelled",
  };
  return "badge " + (map[status?.toUpperCase()] || "badge-pending");
}

export function Badge({ status }) {
  return <span className={badgeClass(status)}>{status}</span>;
}

export function DonutChart({ data }) {
  if (!data)
    return (
      <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Loading…
      </div>
    );
  const circumference = 2 * Math.PI * 50;
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0)
    return (
      <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
        No data
      </div>
    );
  let offset = 0;
  const segments = Object.entries(data).map(([status, count]) => {
    const frac = count / total;
    const dash = frac * circumference;
    const seg = { status, count, dash, offset, color: STATUS_COLORS[status] || "rgba(201,169,110,0.4)" };
    offset += dash;
    return seg;
  });
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 140 140" width="140" height="140">
        <circle cx="70" cy="70" r="50" fill="none" stroke="rgba(201,169,110,0.1)" strokeWidth="24" />
        {segments.map((s) => (
          <circle key={s.status} cx="70" cy="70" r="50" fill="none" stroke={s.color} strokeWidth="24"
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset} transform="rotate(-90,70,70)" />
        ))}
        <text x="70" y="67" textAnchor="middle" fontFamily="'Cormorant Garamond',serif" fontSize="22" fill="var(--champagne)">
          {fmtNum(total)}
        </text>
        <text x="70" y="82" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="9" fill="rgba(240,230,208,0.38)" letterSpacing="0.1em">
          ORDERS
        </text>
      </svg>
      <div className="donut-legend">
        {segments.map((s) => (
          <div key={s.status} className="donut-item">
            <div className="donut-swatch" style={{ background: s.color }} />
            {s.status} — {Math.round((s.count / total) * 100)}%
          </div>
        ))}
      </div>
    </div>
  );
}

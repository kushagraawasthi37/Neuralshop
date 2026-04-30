import { useQuery } from "@tanstack/react-query";
import { adminInventoryApi } from "../../../api/admin";
import { fmtNum } from "../adminUtils";

export default function InventoryPanel({ showToast }) {
  const { data: inventory = [] } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: () => adminInventoryApi.getLowStock(10).then((r) => r.data.data || []),
  });

  return (
    <div className="ns-content">
      <div className="page-header">
        <div className="page-eyebrow">04 — Commerce</div>
        <div className="page-title">Inventory <em>Intelligence</em></div>
        <div className="page-sub">{inventory.length} items below threshold</div>
      </div>

      <div className="two-col mt-2" style={{ marginBottom: 2 }}>
        <div className="card">
          <div className="card-label">Low Stock Threshold</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
            <input type="range" className="ns-range" min="1" max="50" defaultValue="10" style={{ flex: 1 }} />
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: "var(--gold)", minWidth: 32 }}>10</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>units</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>Items at or below this count trigger alerts</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <div className="stat-card"><div className="stat-label">Low Stock</div><div className="stat-val gold">{fmtNum(inventory.length)}</div></div>
          <div className="stat-card">
            <div className="stat-label">Out of Stock</div>
            <div className="stat-val" style={{ color: "rgba(190,110,110,0.85)" }}>
              {fmtNum(inventory.filter((i) => (i.availableStock ?? i.totalStock) === 0).length)}
            </div>
          </div>
          <div className="stat-card"><div className="stat-label">Total Tracked</div><div className="stat-val">{fmtNum(inventory.length)}</div></div>
          <div className="stat-card">
            <div className="stat-label">Reserve Stock</div>
            <div className="stat-val">{fmtNum(inventory.reduce((a, i) => a + (i.reservedStock || 0), 0))}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, margin: "24px 0" }}>
        <button className="ns-btn ns-btn-ghost">↑ Import CSV</button>
        <button className="ns-btn ns-btn-ghost">Import JSON</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="ns-table">
            <thead>
              <tr><th>Product ID</th><th>Size</th><th>Total</th><th>Reserved</th><th>Available</th><th>Status</th></tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-muted)" }}>No low stock items</td></tr>
              ) : (
                inventory.map((inv, i) => {
                  const avail = inv.availableStock ?? inv.totalStock;
                  return (
                    <tr key={i}>
                      <td className="primary"><span className="ns-code">{(inv.productId || inv.id || "").slice(0, 18)}</span></td>
                      <td>{inv.size || "—"}</td>
                      <td>{inv.totalStock}</td>
                      <td>{inv.reservedStock ?? "—"}</td>
                      <td className="primary" style={{ color: avail <= 3 ? "rgba(190,110,110,0.9)" : "var(--champagne)" }}>{avail}</td>
                      <td><span className="badge badge-low">{avail === 0 ? "Out of Stock" : "Low Stock"}</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

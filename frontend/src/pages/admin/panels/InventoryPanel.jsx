import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminInventoryApi } from "../../../api/admin";
import { fmtNum } from "../adminUtils";

function ProductInventoryLookup({ showToast }) {
  const [pid, setPid] = useState("");
  const [lookupId, setLookupId] = useState(null);

  const { data: detail, isFetching, error } = useQuery({
    queryKey: ["inventory-detail", lookupId],
    queryFn: () => adminInventoryApi.getById(lookupId).then((r) => r.data.data || r.data),
    enabled: !!lookupId,
    retry: false,
  });

  return (
    <div className="card" style={{ marginBottom: 2 }}>
      <div className="card-label">Lookup Product Inventory</div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          className="ns-input"
          placeholder="Enter product ID…"
          value={pid}
          onChange={(e) => setPid(e.target.value.trim())}
          style={{ flex: 1, fontFamily: "'DM Mono',monospace", fontSize: 12 }}
        />
        <button
          className="ns-btn ns-btn-ghost"
          disabled={!pid || isFetching}
          onClick={() => { setLookupId(pid); }}
        >
          {isFetching ? "…" : "Lookup"}
        </button>
        {lookupId && (
          <button className="ns-btn ns-btn-ghost" onClick={() => { setLookupId(null); setPid(""); }}>
            Clear
          </button>
        )}
      </div>
      {error && <div style={{ marginTop: 10, fontSize: 11, color: "rgba(190,110,110,0.8)" }}>Product not found or no inventory record.</div>}
      {detail && (
        <div style={{ marginTop: 16, padding: 16, background: "rgba(201,169,110,0.03)", border: "1px solid rgba(201,169,110,0.12)" }}>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              ["Product ID", detail.productId || lookupId],
              ["Total Stock", detail.totalStock ?? "—"],
              ["Reserved", detail.reservedStock ?? "—"],
              ["Available", detail.availableStock ?? detail.totalStock ?? "—"],
              ["Size", detail.size || "—"],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: "var(--champagne)" }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function InventoryPanel({ showToast }) {
  const qc = useQueryClient();
  const [sliderVal, setSliderVal] = useState(10); // local slider display value
  const [threshold, setThreshold] = useState(10); // actual query threshold (debounced)
  const csvInputRef = useRef(null);
  const jsonInputRef = useRef(null);

  // Debounce slider: only fire API call 400ms after user stops dragging
  useEffect(() => {
    const timer = setTimeout(() => setThreshold(sliderVal), 400);
    return () => clearTimeout(timer);
  }, [sliderVal]);

  const { data: inventory = [], isFetching } = useQuery({
    queryKey: ["admin-inventory", threshold],
    queryFn: () => adminInventoryApi.getLowStock(threshold).then((r) => {
      const d = r.data.data;
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.items)) return d.items;
      return [];
    }),
    keepPreviousData: true,
  });

  const outOfStock = inventory.filter((i) => (i.availableStock ?? i.totalStock ?? 0) === 0).length;
  const totalReserved = inventory.reduce((a, i) => a + (i.reservedStock || 0), 0);

  const handleCsvImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const formData = new FormData();
      formData.append("file", file);
      await adminInventoryApi.importCsv(formData);
      qc.invalidateQueries(["admin-inventory"]);
      showToast("CSV imported successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "CSV import failed");
    }
  };

  const handleJsonImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const inventory = Array.isArray(parsed) ? parsed : parsed.inventory;
      if (!Array.isArray(inventory)) {
        return showToast("Invalid JSON: expected array or { inventory: [...] }");
      }
      await adminInventoryApi.importJson(inventory);
      qc.invalidateQueries(["admin-inventory"]);
      showToast("JSON imported successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "JSON import failed — invalid format");
    }
  };

  return (
    <div className="ns-content">
      <div className="page-header">
        <div className="page-eyebrow">04 — Commerce</div>
        <div className="page-title">Inventory <em>Intelligence</em></div>
        <div className="page-sub">{inventory.length} items at or below {threshold} units</div>
      </div>

      <ProductInventoryLookup showToast={showToast} />

      <div className="two-col mt-2" style={{ marginBottom: 2 }}>
        <div className="card">
          <div className="card-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Low Stock Threshold
            {isFetching && <span style={{ fontSize: 10, color: "var(--gold)", animation: "pulse 1s infinite" }}>Updating…</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16 }}>
            <input
              type="range" className="ns-range" min="1" max="100"
              value={sliderVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <div style={{ textAlign: "center", minWidth: 52 }}>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: "var(--gold)" }}>{sliderVal}</span>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>units</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
            Showing items with stock ≤ {threshold}{sliderVal !== threshold ? ` (applying ${sliderVal}…)` : ""}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <div className="stat-card"><div className="stat-label">Low Stock</div><div className="stat-val gold">{fmtNum(inventory.length)}</div></div>
          <div className="stat-card">
            <div className="stat-label">Out of Stock</div>
            <div className="stat-val" style={{ color: "rgba(190,110,110,0.85)" }}>{fmtNum(outOfStock)}</div>
          </div>
          <div className="stat-card"><div className="stat-label">Total Tracked</div><div className="stat-val">{fmtNum(inventory.length)}</div></div>
          <div className="stat-card"><div className="stat-label">Reserve Stock</div><div className="stat-val">{fmtNum(totalReserved)}</div></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, margin: "24px 0", alignItems: "center" }}>
        {/* Hidden CSV file input */}
        <input
          ref={csvInputRef} type="file" accept=".csv"
          style={{ display: "none" }}
          onChange={handleCsvImport}
        />
        {/* Hidden JSON file input */}
        <input
          ref={jsonInputRef} type="file" accept=".json,application/json"
          style={{ display: "none" }}
          onChange={handleJsonImport}
        />
        <button className="ns-btn ns-btn-ghost" onClick={() => csvInputRef.current?.click()}>
          ↑ Import CSV
        </button>
        <button className="ns-btn ns-btn-ghost" onClick={() => jsonInputRef.current?.click()}>
          ↑ Import JSON
        </button>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          CSV format: productId,size,totalStock · JSON: [{`{ productId, size, totalStock }`}, …]
        </span>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="ns-table">
            <thead>
              <tr><th>Product ID</th><th>Size</th><th>Total</th><th>Reserved</th><th>Available</th><th>Status</th></tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-muted)" }}>
                  {isFetching ? "Loading…" : `No items at or below ${threshold} units`}
                </td></tr>
              ) : (
                inventory.map((inv, i) => {
                  const avail = inv.availableStock ?? inv.totalStock ?? 0;
                  return (
                    <tr key={i}>
                      <td className="primary"><span className="ns-code">{(inv.productId || inv.id || "").slice(0, 18)}</span></td>
                      <td>{inv.size || "—"}</td>
                      <td>{inv.totalStock ?? 0}</td>
                      <td>{inv.reservedStock ?? 0}</td>
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

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminProductsApi } from "../../../api/admin";
import { fmt } from "../adminUtils";

const CATEGORIES = ["Watches", "Apparel", "Bags", "Footwear", "Accessories", "Jewellery"];

export default function ProductsPanel({ showToast }) {
  const qc = useQueryClient();
  const [productModal, setProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "", category: "", price: "", originalPrice: "", description: "", isActive: true,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => adminProductsApi.list().then((r) => r.data.data || []),
  });

  const createProductMutation = useMutation({
    mutationFn: (data) => adminProductsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries(["admin-products"]);
      setProductModal(false);
      setNewProduct({ name: "", category: "", price: "", originalPrice: "", description: "", isActive: true });
      showToast("Product created successfully");
    },
    onError: () => showToast("Failed to create product"),
  });

  const set = (key, val) => setNewProduct((p) => ({ ...p, [key]: val }));

  return (
    <div className="ns-content">
      {productModal && (
        <div className="modal-overlay" onClick={() => setProductModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add Product</div>
              <button className="modal-close" onClick={() => setProductModal(false)}>×</button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <div className="form-label">Product Name</div>
                <input className="ns-input" placeholder="e.g. Phantom Chronograph" value={newProduct.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="form-group">
                <div className="form-label">Category</div>
                <select className="ns-select" style={{ width: "100%" }} value={newProduct.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row three">
              <div className="form-group">
                <div className="form-label">Price (₹)</div>
                <input className="ns-input" type="number" placeholder="0" value={newProduct.price} onChange={(e) => set("price", e.target.value)} />
              </div>
              <div className="form-group">
                <div className="form-label">Compare At (₹)</div>
                <input className="ns-input" type="number" placeholder="0" value={newProduct.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} />
              </div>
              <div className="form-group">
                <div className="form-label">Status</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 10 }}>
                  <label className="ns-toggle">
                    <input type="checkbox" checked={newProduct.isActive} onChange={(e) => set("isActive", e.target.checked)} />
                    <div className="ns-toggle-track" />
                    <div className="ns-toggle-thumb" />
                  </label>
                  <span style={{ fontSize: 12, color: "var(--text-mid)" }}>Active</span>
                </div>
              </div>
            </div>
            <div className="form-row" style={{ gridTemplateColumns: "1fr", marginBottom: 16 }}>
              <div className="form-group">
                <div className="form-label">Description</div>
                <textarea className="ns-input" rows={3} style={{ resize: "vertical" }} placeholder="Product description…" value={newProduct.description} onChange={(e) => set("description", e.target.value)} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="ns-btn ns-btn-ghost" onClick={() => setProductModal(false)}>Cancel</button>
              <button className="ns-btn ns-btn-primary" disabled={createProductMutation.isPending}
                onClick={() => createProductMutation.mutate({ ...newProduct, price: Number(newProduct.price), originalPrice: Number(newProduct.originalPrice) })}>
                {createProductMutation.isPending ? "Creating…" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="page-eyebrow">02 — Commerce</div>
        <div className="page-title">Product <em>Management</em></div>
        <div className="page-sub">{products.length} products loaded</div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>
            <circle cx="9" cy="9" r="6" /><path d="M16 16l-3-3" />
          </svg>
          <input className="ns-input" placeholder="Search products…" style={{ paddingLeft: 36 }} />
        </div>
        <select className="ns-select" style={{ width: 160 }}>
          <option>All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="ns-select" style={{ width: 140 }}>
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <button className="ns-btn ns-btn-primary" onClick={() => setProductModal(true)}>+ Add Product</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="ns-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-muted)" }}>No products found</td></tr>
              ) : (
                products.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, background: "rgba(201,169,110,0.06)", border: "1px solid var(--border-gold)", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {p.image?.[0] ? (
                            <img src={p.image[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="rgba(201,169,110,0.4)" strokeWidth="1.2">
                              <rect x="3" y="3" width="14" height="14" /><path d="M3 8h14M8 3v14" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, color: "var(--champagne)" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.sku || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td className="primary">{fmt(p.offerPrice || p.price)}</td>
                    <td>
                      <div className="stock-level">
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.stock ?? "—"}</div>
                        {p.stock != null && (
                          <div className="progress-bar" style={{ marginTop: 4 }}>
                            <div className={`progress-fill${p.stock < 10 ? " red" : ""}`} style={{ width: `${Math.min(100, (p.stock / 100) * 100)}%` }} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={p.isActive !== false ? "badge badge-delivered" : "badge badge-cancelled"}>
                        {p.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: "1px solid rgba(201,169,110,0.06)" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Showing {products.length} products</div>
        </div>
      </div>
    </div>
  );
}

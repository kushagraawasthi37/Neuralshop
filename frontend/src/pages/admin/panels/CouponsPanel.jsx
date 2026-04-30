import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminCouponsApi } from "../../../api/admin";
import { fmt } from "../adminUtils";

function isCouponActive(c) {
  if (c.isActive === false) return false;
  if (c.expiryDate && new Date(c.expiryDate) < new Date()) return false;
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return false;
  return true;
}

export default function CouponsPanel({ showToast }) {
  const qc = useQueryClient();
  const [couponModal, setCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "", discountType: "PERCENTAGE", discountValue: 10,
    minOrderAmount: 0, maxUses: 100, startDate: "", expiryDate: "",
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: () => adminCouponsApi.list().then((r) => {
      const d = r.data.data;
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.coupons)) return d.coupons;
      return [];
    }),
  });

  const createCouponMutation = useMutation({
    mutationFn: (data) => adminCouponsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries(["admin-coupons"]);
      setCouponModal(false);
      showToast("Coupon created");
    },
    onError: () => showToast("Failed to create coupon"),
  });

  const toggleCouponMutation = useMutation({
    mutationFn: (id) => adminCouponsApi.toggle(id),
    onSuccess: () => { qc.invalidateQueries(["admin-coupons"]); showToast("Coupon status updated"); },
    onError: () => showToast("Failed to toggle coupon status"),
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (id) => adminCouponsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(["admin-coupons"]); showToast("Coupon deleted"); },
    onError: () => showToast("Failed to delete coupon"),
  });

  const set = (key, val) => setNewCoupon((p) => ({ ...p, [key]: val }));

  return (
    <div className="ns-content">
      {couponModal && (
        <div className="modal-overlay" onClick={() => setCouponModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create Coupon</div>
              <button className="modal-close" onClick={() => setCouponModal(false)}>×</button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <div className="form-label">Coupon Code</div>
                <input className="ns-input" placeholder="e.g. NEURAL20" value={newCoupon.code} onChange={(e) => set("code", e.target.value)} />
              </div>
              <div className="form-group">
                <div className="form-label">Discount Type</div>
                <select className="ns-select" style={{ width: "100%" }} value={newCoupon.discountType} onChange={(e) => set("discountType", e.target.value)}>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>
            </div>
            <div className="form-row three">
              <div className="form-group">
                <div className="form-label">Value</div>
                <input className="ns-input" type="number" value={newCoupon.discountValue} onChange={(e) => set("discountValue", Number(e.target.value))} />
              </div>
              <div className="form-group">
                <div className="form-label">Min Order (₹)</div>
                <input className="ns-input" type="number" value={newCoupon.minOrderAmount} onChange={(e) => set("minOrderAmount", Number(e.target.value))} />
              </div>
              <div className="form-group">
                <div className="form-label">Max Uses</div>
                <input className="ns-input" type="number" value={newCoupon.maxUses} onChange={(e) => set("maxUses", Number(e.target.value))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <div className="form-label">Start Date</div>
                <input className="ns-input" type="date" value={newCoupon.startDate} onChange={(e) => set("startDate", e.target.value)} />
              </div>
              <div className="form-group">
                <div className="form-label">End Date</div>
                <input className="ns-input" type="date" value={newCoupon.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="ns-btn ns-btn-ghost" onClick={() => setCouponModal(false)}>Cancel</button>
              <button className="ns-btn ns-btn-primary" disabled={createCouponMutation.isPending}
                onClick={() => createCouponMutation.mutate(newCoupon)}>
                {createCouponMutation.isPending ? "Creating…" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="page-eyebrow">06 — Commerce</div>
        <div className="page-title">Coupon <em>Management</em></div>
        <div className="page-sub">{coupons.length} campaigns</div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
        <button className="ns-btn ns-btn-primary" onClick={() => setCouponModal(true)}>+ Create Coupon</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="ns-table">
            <thead>
              <tr><th>Code</th><th>Type</th><th>Value</th><th>Uses</th><th>Min Order</th><th>Expires</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-muted)" }}>No coupons found</td></tr>
              ) : (
                coupons.map((c) => {
                  const active = isCouponActive(c);
                  const id = c.id || c._id;
                  return (
                    <tr key={id}>
                      <td className="primary"><span className="ns-code">{c.code}</span></td>
                      <td>
                        <span className={c.discountType === "PERCENTAGE" ? "badge badge-processing" : "badge badge-gold"}>
                          {c.discountType === "PERCENTAGE" ? "% Percent" : "₹ Fixed"}
                        </span>
                      </td>
                      <td>{c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : fmt(c.discountValue)}</td>
                      <td>{c.usedCount || 0} / {c.maxUses || "∞"}</td>
                      <td>{fmt(c.minOrderAmount)}</td>
                      <td>
                        {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString("en-IN")
                          : c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td>
                        <span className={active ? "badge badge-delivered" : "badge badge-cancelled"}>
                          {active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            type="button"
                            className="ns-btn ns-btn-ghost"
                            style={{ padding: "5px 10px", fontSize: 10 }}
                            disabled={toggleCouponMutation.isPending}
                            onClick={() => toggleCouponMutation.mutate(String(id))}
                            title={active ? "Deactivate" : "Activate"}
                          >
                            {toggleCouponMutation.isPending ? "…" : active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            className="ns-btn ns-btn-danger"
                            style={{ padding: "5px 10px", fontSize: 10 }}
                            disabled={deleteCouponMutation.isPending}
                            onClick={() => {
                              if (window.confirm(`Delete coupon "${c.code}"? This cannot be undone.`)) {
                                deleteCouponMutation.mutate(String(id));
                              }
                            }}
                          >
                            {deleteCouponMutation.isPending ? "…" : "Delete"}
                          </button>
                        </div>
                      </td>
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

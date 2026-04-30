import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyticsApi, adminOrdersApi } from "../../../api/admin";
import { fmt, fmtNum, Badge } from "../adminUtils";

export default function OrdersPanel({ showToast }) {
  const qc = useQueryClient();
  const [statusModal, setStatusModal] = useState(null);

  const { data: dashboard } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => analyticsApi.dashboard().then((r) => r.data.data),
  });

  const { data: orderStatus } = useQuery({
    queryKey: ["admin-order-status"],
    queryFn: () => analyticsApi.orderStatus().then((r) => r.data.data),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => adminOrdersApi.list().then((r) => r.data.data || []),
  });

  const ordersByStatus = (() => {
    if (!orderStatus) return {};
    if (Array.isArray(orderStatus)) return Object.fromEntries(orderStatus.map((o) => [o.status, o._count]));
    return orderStatus;
  })();

  const pendingOrders = dashboard?.pendingOrders || 0;

  const updateItemStatusMutation = useMutation({
    mutationFn: ({ itemId, status }) => adminOrdersApi.updateItemStatus(itemId, status),
    onSuccess: () => {
      qc.invalidateQueries(["admin-orders"]);
      setStatusModal(null);
      showToast("Status updated");
    },
    onError: () => showToast("Failed to update status"),
  });

  return (
    <div className="ns-content">
      {statusModal && (
        <div className="modal-overlay" onClick={() => setStatusModal(null)}>
          <div className="modal" style={{ minWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Update Order Status</div>
              <button className="modal-close" onClick={() => setStatusModal(null)}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
                <button key={s} className="ns-btn ns-btn-ghost" style={{ justifyContent: "flex-start", padding: "12px 16px" }}
                  onClick={() => updateItemStatusMutation.mutate({ itemId: statusModal.itemId, status: s })}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="page-eyebrow">03 — Commerce</div>
        <div className="page-title">Order <em>Management</em></div>
        <div className="page-sub">{orders.length} orders loaded</div>
      </div>

      <div className="stat-row">
        <div className="stat-card"><div className="stat-label">Total Orders</div><div className="stat-val">{fmtNum(dashboard?.totalOrders)}</div></div>
        <div className="stat-card"><div className="stat-label">Pending</div><div className="stat-val gold">{fmtNum(pendingOrders)}</div><div className="stat-sub">Awaiting action</div></div>
        <div className="stat-card"><div className="stat-label">Shipped</div><div className="stat-val">{fmtNum(ordersByStatus?.SHIPPED || 0)}</div><div className="stat-sub">In transit</div></div>
        <div className="stat-card"><div className="stat-label">Delivered</div><div className="stat-val">{fmtNum(ordersByStatus?.DELIVERED || 0)}</div><div className="stat-sub">Completed</div></div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "24px 0", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>
            <circle cx="9" cy="9" r="6" /><path d="M16 16l-3-3" />
          </svg>
          <input className="ns-input" placeholder="Search by Order ID…" style={{ paddingLeft: 36 }} />
        </div>
        <select className="ns-select" style={{ width: 160 }}>
          <option>All Statuses</option>
          {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="ns-table">
            <thead>
              <tr><th>Order ID</th><th>Date</th><th>Items</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-muted)" }}>No orders found</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td className="primary"><span className="ns-code">#{(o.id || "").slice(0, 10)}</span></td>
                    <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                    <td>{(o.items || o.orderItems || []).length} items</td>
                    <td className="primary">{fmt(o.totalAmount || o.sellerTotal)}</td>
                    <td><Badge status={o.status} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {(o.items || o.orderItems || []).slice(0, 2).map((item, i) => (
                          <button key={i} className="ns-btn ns-btn-ghost" style={{ padding: "5px 10px", fontSize: 10 }}
                            onClick={() => setStatusModal({ itemId: item.id, orderNum: o.id })}>
                            Item {i + 1}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

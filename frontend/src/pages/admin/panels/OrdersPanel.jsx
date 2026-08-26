import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyticsApi, adminOrdersApi } from "../../../api/admin";
import { fmt, fmtNum, Badge } from "../adminUtils";

const STATUSES = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrdersPanel({ showToast }) {
  const qc = useQueryClient(); //It is used to manaage and control the tanstack query cache
  const [statusModal, setStatusModal] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Statuses");

  const { data: dashboard } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => analyticsApi.dashboard().then((r) => r.data.data),
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

  const { data: rawOrders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () =>
      adminOrdersApi.list().then((r) => {
        const d = r.data.data;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.orders)) return d.orders;
        return [];
      }),
  });

  // Filter orders by search and status
  const orders = rawOrders.filter((o) => {
    const matchSearch =
      !search || (o.id || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "All Statuses" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const ordersByStatus = (() => {
    if (!orderStatus) return {};
    if (Array.isArray(orderStatus)) {
      return Object.fromEntries(
        orderStatus.map((o) => [
          o.status,
          typeof o._count === "number" ? o._count : (o._count?._all ?? 0),
        ]),
      );
    }
    return orderStatus;
  })();

  const pendingOrders = dashboard?.pendingOrders || 0;

  const updateItemStatusMutation = useMutation({
    mutationFn: ({ itemId, status }) =>
      adminOrdersApi.updateItemStatus(itemId, status),
    onSuccess: () => {
      qc.invalidateQueries(["admin-orders"]);
      setStatusModal(null);
      showToast("Status updated");
    },
    onError: (err) =>
      showToast(err.response?.data?.message || "Failed to update status"),
  });

  return (
    <div className="ns-content">
      {statusModal && (
        <div className="modal-overlay" onClick={() => setStatusModal(null)}>
          <div
            className="modal"
            style={{ minWidth: 380 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">Update Item Status</div>
              <button
                className="modal-close"
                onClick={() => setStatusModal(null)}
              >
                ×
              </button>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              Item:{" "}
              <span
                style={{
                  color: "var(--champagne)",
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                #{String(statusModal.itemId || "").slice(0, 12)}
              </span>
            </div>
            {statusModal.currentStatus && (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginBottom: 12,
                }}
              >
                Current:{" "}
                <span style={{ color: "var(--gold)" }}>
                  {statusModal.currentStatus}
                </span>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  className="ns-btn ns-btn-ghost"
                  style={{
                    justifyContent: "flex-start",
                    padding: "12px 16px",
                    opacity: s === statusModal.currentStatus ? 0.4 : 1,
                  }}
                  disabled={
                    updateItemStatusMutation.isPending ||
                    s === statusModal.currentStatus
                  }
                  onClick={() =>
                    updateItemStatusMutation.mutate({
                      itemId: String(statusModal.itemId),
                      status: s,
                    })
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="page-eyebrow">03 — Commerce</div>
        <div className="page-title">
          Order <em>Management</em>
        </div>
        <div className="page-sub">{rawOrders.length} orders loaded</div>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-val">{fmtNum(dashboard?.totalOrders)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-val gold">{fmtNum(pendingOrders)}</div>
          <div className="stat-sub">Awaiting action</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Shipped</div>
          <div className="stat-val">{fmtNum(ordersByStatus?.SHIPPED || 0)}</div>
          <div className="stat-sub">In transit</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Delivered</div>
          <div className="stat-val">
            {fmtNum(ordersByStatus?.DELIVERED || 0)}
          </div>
          <div className="stat-sub">Completed</div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          margin: "24px 0",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.4,
            }}
          >
            <circle cx="9" cy="9" r="6" />
            <path d="M16 16l-3-3" />
          </svg>
          <input
            className="ns-input"
            placeholder="Search by Order ID…"
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="ns-select"
          style={{ width: 160 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option>All Statuses</option>
          {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(
            (s) => (
              <option key={s}>{s}</option>
            ),
          )}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="ns-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "40px 16px",
                      color: "var(--text-muted)",
                    }}
                  >
                    {rawOrders.length === 0
                      ? "No orders found"
                      : "No orders match filter"}
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const items = o.items || o.orderItems || [];
                  return (
                    <tr key={o.id}>
                      <td className="primary">
                        <span className="ns-code">
                          #{(o.id || "").slice(0, 10)}
                        </span>
                      </td>
                      <td>
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                      <td>{items.length} items</td>
                      <td className="primary">
                        {fmt(o.totalAmount || o.sellerTotal)}
                      </td>
                      <td>
                        <Badge status={o.status} />
                      </td>
                      <td>
                        <div
                          style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                        >
                          {items.map((item, i) => (
                            <button
                              key={i}
                              className="ns-btn ns-btn-ghost"
                              style={{ padding: "5px 10px", fontSize: 10 }}
                              onClick={() =>
                                setStatusModal({
                                  itemId: item.id || item._id,
                                  orderNum: o.id,
                                  currentStatus: item.status,
                                })
                              }
                            >
                              Item {i + 1}{" "}
                              {item.status
                                ? `(${item.status.slice(0, 3)})`
                                : ""}
                            </button>
                          ))}
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

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminReturnsApi } from "../../../api/admin";
import { fmt, fmtNum, Badge } from "../adminUtils";

export default function ReturnsPanel({ showToast }) {
  const qc = useQueryClient();

  const { data: returns = [] } = useQuery({
    queryKey: ["admin-returns"],
    queryFn: () => adminReturnsApi.list().then((r) => {
      const d = r.data.data;
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.returns)) return d.returns;
      return [];
    }),
  });

  const returnCounts = useMemo(() =>
    returns.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {}),
    [returns]
  );

  const approveReturnMutation = useMutation({
    mutationFn: (id) => adminReturnsApi.approve(id),
    onSuccess: () => { qc.invalidateQueries(["admin-returns"]); showToast("Return approved"); },
  });

  const rejectReturnMutation = useMutation({
    mutationFn: (id) => adminReturnsApi.reject(id),
    onSuccess: () => { qc.invalidateQueries(["admin-returns"]); showToast("Return rejected"); },
  });

  const pendingReturns = returnCounts.REQUESTED || 0;

  return (
    <div className="ns-content">
      <div className="page-header">
        <div className="page-eyebrow">07 — Post-Sale</div>
        <div className="page-title">Returns &amp; <em>Refunds</em></div>
        <div className="page-sub">{pendingReturns} pending decisions</div>
      </div>

      <div className="stat-row">
        <div className="stat-card"><div className="stat-label">Requested</div><div className="stat-val gold">{fmtNum(returnCounts.REQUESTED || 0)}</div></div>
        <div className="stat-card"><div className="stat-label">Approved</div><div className="stat-val">{fmtNum(returnCounts.APPROVED || 0)}</div></div>
        <div className="stat-card"><div className="stat-label">Refunded</div><div className="stat-val">{fmtNum(returnCounts.REFUNDED || 0)}</div></div>
        <div className="stat-card">
          <div className="stat-label">Rejected</div>
          <div className="stat-val" style={{ color: "rgba(190,110,110,0.85)" }}>{fmtNum(returnCounts.REJECTED || 0)}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", margin: "20px 0" }}>
        <select className="ns-select" style={{ width: 160 }}>
          <option>All Status</option>
          {["REQUESTED", "APPROVED", "REFUNDED", "REJECTED"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="ns-table">
            <thead>
              <tr><th>Return ID</th><th>Order ID</th><th>Reason</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {returns.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-muted)" }}>No return requests</td></tr>
              ) : (
                returns.map((r) => (
                  <tr key={r.id}>
                    <td className="primary"><span className="ns-code">#{(r.id || "").slice(0, 8)}</span></td>
                    <td><span className="ns-code">#{(r.orderId || r.orderItemId || "").slice(0, 8)}</span></td>
                    <td style={{ maxWidth: 160 }}>{r.reason}</td>
                    <td className="primary">{fmt(r.refundAmount)}</td>
                    <td><Badge status={r.status} /></td>
                    <td>
                      {r.status === "REQUESTED" ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="ns-btn ns-btn-approve" style={{ padding: "5px 10px", fontSize: 10 }} onClick={() => approveReturnMutation.mutate(r.id)}>Approve</button>
                          <button className="ns-btn ns-btn-reject" style={{ padding: "5px 10px", fontSize: 10 }} onClick={() => rejectReturnMutation.mutate(r.id)}>Reject</button>
                        </div>
                      ) : r.status === "APPROVED" ? (
                        <button className="ns-btn ns-btn-ghost" style={{ padding: "5px 10px", fontSize: 10, color: "var(--gold)", borderColor: "var(--border-gold)" }}
                          onClick={() => adminReturnsApi.processRefund(r.id).then(() => { qc.invalidateQueries(["admin-returns"]); showToast("Refund processed"); })}>
                          Process Refund
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Complete</span>
                      )}
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

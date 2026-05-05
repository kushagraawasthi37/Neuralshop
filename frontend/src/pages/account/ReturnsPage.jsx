import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { returnsApi } from "../../api/user";
import { ordersApi } from "../../api/orders";

const STATUS_COLORS = {
  REQUESTED: {
    bg: "rgba(139,99,64,0.18)",
    border: "rgba(139,99,64,0.35)",
    color: "rgba(201,160,100,0.85)",
  },
  APPROVED: {
    bg: "rgba(42,74,71,0.2)",
    border: "rgba(42,74,71,0.45)",
    color: "rgba(100,180,170,0.85)",
  },
  REFUNDED: {
    bg: "rgba(60,90,60,0.2)",
    border: "rgba(80,130,80,0.35)",
    color: "rgba(140,200,140,0.85)",
  },
  REJECTED: {
    bg: "rgba(100,50,50,0.2)",
    border: "rgba(140,70,70,0.35)",
    color: "rgba(190,110,110,0.8)",
  },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.REQUESTED;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 9,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        padding: "3px 10px",
        fontWeight: 500,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function Toast({ msg, show }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "clamp(16px,4vw,28px)",
        right: "clamp(16px,4vw,28px)",
        left: "clamp(16px,4vw,auto)",
        zIndex: 9999,
        background: "#1a1916",
        border: "1px solid rgba(201,169,110,0.18)",
        padding: "14px 22px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 12,
        color: "#f0e6d0",
        transform: show ? "translateY(0)" : "translateY(70px)",
        opacity: show ? 1 : 0,
        transition: "all 0.5s cubic-bezier(0.23,1,0.32,1)",
        minWidth: "min(240px, calc(100vw - 32px))",
      }}
    >
      <div
        style={{
          width: 5,
          height: 5,
          background: "#c9a96e",
          borderRadius: "50%",
          flexShrink: 0,
        }}
      />
      {msg}
    </div>
  );
}

const RETURN_REASONS = [
  "Defective/Damaged",
  "Wrong item received",
  "Not as described",
  "Changed my mind",
  "Size/Fit issue",
  "Other",
];

export default function ReturnsPage() {
  const qc = useQueryClient();
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    orderId: "",
    reason: RETURN_REASONS[0],
    description: "",
  });

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ["returns"],
    queryFn: () =>
      returnsApi.list().then((r) => {
        const data = r.data.data;
        if (Array.isArray(data)) return data;
        return Array.isArray(data?.returns) ? data.returns : [];
      }),
  });

  const { data: deliveredOrders = [] } = useQuery({
    queryKey: ["orders-delivered"],
    queryFn: () =>
      ordersApi.list().then((r) => {
        const data = r.data.data;
        const orders = Array.isArray(data)
          ? data
          : Array.isArray(data?.orders)
            ? data.orders
            : [];
        return orders.filter((o) => o.status === "DELIVERED");
      }),
  });

  const requestMutation = useMutation({
    mutationFn: (data) => returnsApi.request(data),
    onSuccess: () => {
      qc.invalidateQueries(["returns"]);
      setShowRequestModal(false);
      setRequestForm({
        orderId: "",
        reason: RETURN_REASONS[0],
        description: "",
      });
      showToast("Return request submitted");
    },
    onError: (err) =>
      showToast(err.response?.data?.message || "Failed to submit return"),
  });

  const cancelMutation = useMutation({
    mutationFn: (returnId) => returnsApi.cancel(returnId),
    onSuccess: () => {
      qc.invalidateQueries(["returns"]);
      showToast("Return request cancelled");
    },
  });

  const fieldStyle = {
    padding: "12px 14px",
    background: "#252320",
    border: "1px solid rgba(201,169,110,0.18)",
    color: "#f0e6d0",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: 13,
    outline: "none",
    cursor: "pointer",
    width: "100%",
    minHeight: 44,
  };

  return (
    <div style={{ minHeight: "100vh", paddingTop: "var(--nav-h, 80px)" }}>
      <style>{`
        .return-label {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(240,230,208,0.38);
          display: block;
          margin-bottom: 7px;
        }
        .return-card {
          background: #1a1916;
          border: 1px solid rgba(201,169,110,0.18);
          margin-bottom: 2px;
          padding: clamp(16px,3vw,24px) clamp(16px,3vw,28px);
        }
        .return-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 12px;
        }
        .return-card-meta {
          display: flex;
          gap: clamp(16px,3vw,24px);
          flex-wrap: wrap;
        }
        @media (max-width: 639px) {
          .return-card-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
          .return-card-actions {
            display: flex;
            gap: 8px;
            align-items: center;
          }
        }
      `}</style>

      {/* Modal */}
      {showRequestModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,12,11,0.88)",
            backdropFilter: "blur(12px)",
            zIndex: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRequestModal(false);
          }}
        >
          <div
            className="return-modal"
            style={{
              background: "#1a1916",
              border: "1px solid rgba(201,169,110,0.18)",
              padding: "clamp(24px,5vw,40px)",
              width: "min(560px, calc(100vw - 32px))",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setShowRequestModal(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 36,
                height: 36,
                border: "1px solid rgba(201,169,110,0.18)",
                background: "none",
                color: "rgba(240,230,208,0.38)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              ×
            </button>

            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(20px,4vw,26px)",
                fontWeight: 300,
                color: "#f0e6d0",
                marginBottom: 6,
              }}
            >
              Request Return
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(240,230,208,0.38)",
                marginBottom: 24,
                paddingBottom: 20,
                borderBottom: "1px solid rgba(201,169,110,0.18)",
              }}
            >
              Submit a return request for a delivered order
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <label className="return-label">Select Order</label>
              <select
                value={requestForm.orderId}
                onChange={(e) =>
                  setRequestForm((p) => ({ ...p, orderId: e.target.value }))
                }
                style={fieldStyle}
              >
                <option value="">Select a delivered order</option>
                {deliveredOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id?.slice(0, 20)}… — ₹
                    {Number(o.totalAmount || 0).toLocaleString("en-IN")}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <label className="return-label">Reason for Return</label>
              <select
                value={requestForm.reason}
                onChange={(e) =>
                  setRequestForm((p) => ({ ...p, reason: e.target.value }))
                }
                style={fieldStyle}
              >
                {RETURN_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 28,
              }}
            >
              <label className="return-label">Description (optional)</label>
              <textarea
                value={requestForm.description}
                onChange={(e) =>
                  setRequestForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Describe the issue with your order…"
                rows={4}
                style={{
                  ...fieldStyle,
                  resize: "vertical",
                  lineHeight: 1.6,
                  height: "auto",
                  minHeight: 96,
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => requestMutation.mutate(requestForm)}
                disabled={!requestForm.orderId || requestMutation.isPending}
                style={{
                  padding: "13px 28px",
                  background: "#c9a96e",
                  border: "none",
                  color: "#0d0c0b",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                  fontWeight: 500,
                  minHeight: 44,
                  opacity:
                    !requestForm.orderId || requestMutation.isPending ? 0.6 : 1,
                  flex: 1,
                }}
              >
                {requestMutation.isPending ? "Submitting…" : "Submit Request"}
              </button>
              <button
                onClick={() => setShowRequestModal(false)}
                style={{
                  padding: "13px 20px",
                  background: "none",
                  border: "1px solid rgba(201,169,110,0.18)",
                  color: "rgba(240,230,208,0.45)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                  minHeight: 44,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "0 var(--page-px)",
        }}
      >
        {/* Page header */}
        <div className="page-header">
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#c9a96e",
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div style={{ width: 26, height: 1, background: "#c9a96e" }} />
              My Account
            </div>
            <h1 className="page-header__title">
              Returns{" "}
              <em style={{ fontStyle: "italic", color: "#c9a96e" }}>
                &amp; Refunds
              </em>
            </h1>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            style={{
              padding: "12px 24px",
              background: "#c9a96e",
              border: "none",
              color: "#0d0c0b",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif",
              fontWeight: 500,
              minHeight: 44,
              whiteSpace: "nowrap",
            }}
          >
            New Return Request
          </button>
        </div>

        {/* Stats */}
        <div className="returns-stats">
          {[
            { label: "Total Returns", val: returns.length },
            {
              label: "Approved",
              val: returns.filter((r) => r.status === "APPROVED").length,
            },
            {
              label: "Refunded",
              val: returns.filter((r) => r.status === "REFUNDED").length,
            },
            {
              label: "Pending",
              val: returns.filter((r) => r.status === "REQUESTED").length,
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: "#1a1916",
                border: "1px solid rgba(201,169,110,0.18)",
                padding: "clamp(16px,3vw,24px) clamp(16px,3vw,28px)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(240,230,208,0.38)",
                  marginBottom: 8,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "clamp(24px,5vw,32px)",
                  fontWeight: 300,
                  color: "#c9a96e",
                }}
              >
                {s.val}
              </div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 60 }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                border: "1px solid rgba(201,169,110,0.3)",
                borderTopColor: "#c9a96e",
                borderRadius: "50%",
                animation: "spin 1.2s linear infinite",
              }}
            />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : returns.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "rgba(240,230,208,0.4)",
              paddingBottom: 100,
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(22px,5vw,28px)",
                marginBottom: 12,
                color: "rgba(240,230,208,0.5)",
              }}
            >
              No return requests
            </div>
            <div style={{ fontSize: 13 }}>
              Your return requests will appear here
            </div>
          </div>
        ) : (
          <div style={{ paddingBottom: 100 }}>
            {returns.map((ret) => (
              <div key={ret.id} className="return-card">
                <div className="return-card-header">
                  <div>
                    <div
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 12,
                        color: "#c9a96e",
                        marginBottom: 4,
                        wordBreak: "break-all",
                      }}
                    >
                      {ret.id?.slice(0, 20)}…
                    </div>
                    <div
                      style={{ fontSize: 11, color: "rgba(240,230,208,0.38)" }}
                    >
                      {ret.createdAt
                        ? new Date(ret.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </div>
                  </div>
                  <div
                    className="return-card-actions"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <StatusBadge status={ret.status} />
                    {ret.status === "REQUESTED" && (
                      <button
                        onClick={() => cancelMutation.mutate(ret.id)}
                        style={{
                          padding: "7px 14px",
                          background: "none",
                          border: "1px solid rgba(140,70,70,0.35)",
                          color: "rgba(190,110,110,0.75)",
                          fontSize: 9,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          fontFamily: "'DM Sans',sans-serif",
                          minHeight: 34,
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                <div className="return-card-meta">
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "rgba(240,230,208,0.38)",
                        marginBottom: 4,
                      }}
                    >
                      Reason
                    </div>
                    <div style={{ fontSize: 13, color: "#f0e6d0" }}>
                      {ret.reason}
                    </div>
                  </div>
                  {ret.refundAmount && (
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "rgba(240,230,208,0.38)",
                          marginBottom: 4,
                        }}
                      >
                        Refund Amount
                      </div>
                      <div
                        style={{
                          fontFamily: "'Cormorant Garamond',serif",
                          fontSize: 16,
                          color: "#c9a96e",
                        }}
                      >
                        ₹{Number(ret.refundAmount).toLocaleString("en-IN")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}

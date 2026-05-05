import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../../api/orders";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

const STATUS_COLORS = {
  PENDING: {
    bg: "rgba(139,99,64,0.2)",
    border: "rgba(139,99,64,0.4)",
    color: "rgba(201,160,100,0.9)",
  },
  PROCESSING: {
    bg: "rgba(42,74,71,0.2)",
    border: "rgba(42,74,71,0.5)",
    color: "rgba(100,180,170,0.85)",
  },
  SHIPPED: {
    bg: "rgba(74,92,71,0.2)",
    border: "rgba(74,92,71,0.4)",
    color: "rgba(138,173,135,0.9)",
  },
  DELIVERED: {
    bg: "rgba(60,90,60,0.2)",
    border: "rgba(80,130,80,0.35)",
    color: "rgba(140,200,140,0.85)",
  },
  CANCELLED: {
    bg: "rgba(100,50,50,0.2)",
    border: "rgba(140,70,70,0.35)",
    color: "rgba(190,110,110,0.8)",
  },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
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
      }}
    >
      {status}
    </span>
  );
}

const FILTERS = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () =>
      ordersApi.list().then((r) => {
        const data = r.data.data;
        if (Array.isArray(data)) return data;
        return Array.isArray(data?.orders) ? data.orders : [];
      }),
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId) => ordersApi.cancel(orderId),
    onSuccess: () => qc.invalidateQueries(["orders"]),
  });

  const filtered = orders.filter((o) => {
    const matchFilter =
      filter === "All" || o.status?.toUpperCase() === filter.toUpperCase();
    const matchSearch =
      !search || o.id?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", paddingTop: 100 }}>
      <style>{`
        .order-card__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          cursor: pointer;
          gap: 12px;
        }
        .order-card__left {
          display: flex;
          align-items: center;
          gap: 24px;
          min-width: 0;
          flex: 1;
        }
        .order-card__id {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: #c9a96e;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }
        .order-card__date {
          font-size: 11px;
          color: rgba(240,230,208,0.38);
          white-space: nowrap;
        }
        .order-card__amount {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          color: #f0e6d0;
          white-space: nowrap;
        }
        .order-card__right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }
        @media (max-width: 639px) {
          .order-card__header {
            flex-direction: column;
            align-items: flex-start;
            padding: 16px 18px;
            gap: 10px;
          }
          .order-card__left {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
            width: 100%;
          }
          .order-card__id {
            font-size: 11px;
          }
          .order-card__date {
            font-size: 10px;
          }
          .order-card__amount {
            font-size: 22px;
          }
          .order-card__right {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "0 var(--page-px)",
        }}
      >
        <div
          style={{
            padding: "clamp(32px,4vw,52px) 0 44px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            borderBottom: "1px solid rgba(201,169,110,0.18)",
            marginBottom: 52,
          }}
        >
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
            <h1
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(34px,4.5vw,58px)",
                fontWeight: 300,
                color: "#f0e6d0",
                lineHeight: 1.04,
              }}
            >
              Order{" "}
              <em style={{ fontStyle: "italic", color: "#c9a96e" }}>History</em>
            </h1>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            marginBottom: 36,
            overflowX: "auto",
          }}
        >
          {FILTERS.map((f, i) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "10px 22px",
                border: "1px solid rgba(201,169,110,0.18)",
                borderRight:
                  i < FILTERS.length - 1
                    ? "none"
                    : "1px solid rgba(201,169,110,0.18)",
                background: filter === f ? "rgba(201,169,110,0.08)" : "none",
                color: filter === f ? "#c9a96e" : "rgba(240,230,208,0.38)",
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                whiteSpace: "nowrap",
                transition: "all 0.3s",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 32,
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, position: "relative" }}>
            <svg
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.3,
              }}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders"
              style={{
                width: "100%",
                padding: "12px 18px 12px 42px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(201,169,110,0.18)",
                color: "#f0e6d0",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>
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
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "rgba(240,230,208,0.4)",
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 28,
                marginBottom: 12,
              }}
            >
              No orders found
            </div>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "12px 28px",
                background: "#c9a96e",
                border: "none",
                color: "#0d0c0b",
                cursor: "pointer",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={{ paddingBottom: 100 }}>
            {filtered.map((order) => {
              const isOpen = expandedId === order.id;
              const items = order.items || order.orderItems || [];
              return (
                <div
                  key={order.id}
                  style={{
                    background: "#1a1916",
                    border: "1px solid rgba(201,169,110,0.18)",
                    borderRadius: 18,
                    marginBottom: 24,
                    transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      background: "#c9a96e",
                      transform: isOpen ? "scaleY(1)" : "scaleY(0)",
                      transformOrigin: "bottom",
                      transition: "transform 0.4s cubic-bezier(0.23,1,0.32,1)",
                    }}
                  />
                  <div
                    className="order-card__header"
                    onClick={() => setExpandedId(isOpen ? null : order.id)}
                  >
                    <div className="order-card__left">
                      <div className="order-card__id">
                        {order.id?.slice(0, 16)}...
                      </div>
                      <div className="order-card__date">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                              { day: "numeric", month: "short", year: "numeric" },
                            )
                          : "—"}
                      </div>
                      <div className="order-card__amount">
                        {fmt(order.totalAmount || order.total)}
                      </div>
                    </div>
                    <div className="order-card__right">
                      <StatusBadge status={order.status} />
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          border: "1px solid rgba(201,169,110,0.18)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s",
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          style={{
                            transform: isOpen ? "rotate(180deg)" : "none",
                            transition: "transform 0.4s cubic-bezier(0.23,1,0.32,1)",
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      maxHeight: isOpen ? 600 : 0,
                      overflow: "hidden",
                      transition:
                        "max-height 0.55s cubic-bezier(0.23,1,0.32,1)",
                    }}
                  >
                    <div
                      style={{
                        padding: "0 24px 24px",
                        borderTop: "1px solid rgba(201,169,110,0.08)",
                        borderRadius: "0 0 18px 18px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          padding: "20px 0",
                          overflowX: "auto",
                        }}
                      >
                        {items.map((item, i) => (
                          <div
                            key={i}
                            style={{
                              flexShrink: 0,
                              width: 60,
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                width: 60,
                                height: 76,
                                background: "#252320",
                                border: "1px solid rgba(201,169,110,0.18)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 6,
                              }}
                            >
                              {item.product?.image || item.image ? (
                                <img
                                  src={item.product?.image || item.image}
                                  alt=""
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : null}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "rgba(240,230,208,0.38)",
                                lineHeight: 1.4,
                              }}
                            >
                              {item.product?.name || item.name}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                          paddingTop: 16,
                          borderTop: "1px solid rgba(201,169,110,0.08)",
                        }}
                      >
                        <button
                          onClick={() => navigate(`/orders/${order.id}/track`)}
                          style={{
                            padding: "8px 18px",
                            background: "none",
                            border: "1px solid rgba(201,169,110,0.18)",
                            color: "rgba(240,230,208,0.38)",
                            fontSize: 10,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            cursor: "pointer",
                            fontFamily: "'DM Sans',sans-serif",
                            transition: "all 0.3s",
                          }}
                        >
                          Track Order
                        </button>
                        {order.status === "PENDING" && (
                          <button
                            onClick={() => cancelMutation.mutate(order.id)}
                            style={{
                              padding: "8px 18px",
                              background: "none",
                              border: "1px solid rgba(140,70,70,0.35)",
                              color: "rgba(190,110,110,0.75)",
                              fontSize: 10,
                              letterSpacing: "0.14em",
                              textTransform: "uppercase",
                              cursor: "pointer",
                              fontFamily: "'DM Sans',sans-serif",
                            }}
                          >
                            Cancel Order
                          </button>
                        )}
                        {order.status === "DELIVERED" && (
                          <button
                            onClick={() => navigate("/account/returns")}
                            style={{
                              padding: "8px 18px",
                              background: "none",
                              border: "1px solid rgba(201,169,110,0.18)",
                              color: "rgba(240,230,208,0.38)",
                              fontSize: 10,
                              letterSpacing: "0.14em",
                              textTransform: "uppercase",
                              cursor: "pointer",
                              fontFamily: "'DM Sans',sans-serif",
                            }}
                          >
                            Return Items
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

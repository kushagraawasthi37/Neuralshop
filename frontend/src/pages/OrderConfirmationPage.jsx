import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../api/orders";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;
  const [copied, setCopied] = useState(false);
  const [particles] = useState(() =>
    Array.from({ length: 16 }, (_, i) => ({
      key: i,
      left: `${Math.random() * 80 + 10}%`,
      animationDelay: `${Math.random() * 1}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
      tx: `${(Math.random() - 0.5) * 160}px`,
      ty: `${-60 - Math.random() * 80}px`,
    })),
  );

  const { data: order } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.get(orderId).then((r) => r.data.data),
    enabled: !!orderId,
  });

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const items = order?.items || order?.orderItems || [];
  const total = order?.totalAmount || order?.total || 0;

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes checkAppear{from{transform:scale(0.3);opacity:0}to{transform:scale(1);opacity:1}}
      @keyframes ringExpand{from{transform:scale(0.8);opacity:0}to{transform:scale(1);opacity:1}}
      @keyframes drawCheck{to{stroke-dashoffset:0}}
      @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
      @keyframes particleFloat{0%{opacity:0.8;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0)}}
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        paddingTop: "clamp(80px,10vw,120px)",
        position: "relative",
      }}
    >
      {/* Particles */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 0,
          right: 0,
          height: 300,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {particles.map((p) => (
          <div
            key={p.key}
            style={{
              position: "absolute",
              width: 2,
              height: 2,
              background: "#c9a96e",
              opacity: 0,
              left: p.left,
              top: "60%",
              animation: `particleFloat ${p.animationDuration} ease-out ${p.animationDelay} both`,
              "--tx": p.tx,
              "--ty": p.ty,
            }}
          />
        ))}
      </div>

      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "clamp(28px,5vw,60px) var(--page-px) 100px",
          textAlign: "center",
        }}
      >
        {/* Success icon */}
        <div
          style={{
            width: "clamp(72px,15vw,100px)",
            height: "clamp(72px,15vw,100px)",
            margin: "0 auto clamp(24px,4vw,40px)",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              border: "1px solid rgba(201,169,110,0.18)",
              borderRadius: "50%",
              background: "rgba(201,169,110,0.04)",
              animation:
                "checkAppear 0.6s cubic-bezier(0.23,1,0.32,1) both 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 50 50" fill="none">
              <polyline
                points="10,25 21,36 40,14"
                stroke="#c9a96e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="40"
                strokeDashoffset="40"
                style={{
                  animation:
                    "drawCheck 0.7s cubic-bezier(0.23,1,0.32,1) forwards 0.6s",
                }}
              />
            </svg>
          </div>
          <div
            style={{
              position: "absolute",
              inset: -8,
              border: "1px solid rgba(201,169,110,0.15)",
              borderRadius: "50%",
              animation:
                "ringExpand 1.2s cubic-bezier(0.23,1,0.32,1) both 0.5s",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: -20,
              border: "1px solid rgba(201,169,110,0.07)",
              borderRadius: "50%",
              animation:
                "ringExpand 1.4s cubic-bezier(0.23,1,0.32,1) both 0.7s",
            }}
          />
        </div>

        {/* Labels */}
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#c9a96e",
            marginBottom: 14,
            animation: "slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both 0.8s",
            opacity: 0,
          }}
        >
          Order Confirmed
        </div>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "clamp(36px,8vw,64px)",
            fontWeight: 300,
            color: "#f0e6d0",
            lineHeight: 1.05,
            marginBottom: 12,
            animation: "slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both 0.9s",
            opacity: 0,
          }}
        >
          Thank <em style={{ fontStyle: "italic", color: "#c9a96e" }}>You</em>
        </h1>
        <p
          style={{
            fontSize: "clamp(12px,3vw,14px)",
            color: "rgba(240,230,208,0.55)",
            maxWidth: 440,
            margin: "0 auto clamp(32px,6vw,48px)",
            animation: "slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both 1.0s",
            opacity: 0,
          }}
        >
          Your order has been placed successfully. A confirmation email is on
          its way to you.
        </p>

        {/* Order ID copy */}
        {orderId && (
          <div
            onClick={copyOrderId}
            style={{
              background: "#1a1916",
              border: "1px solid rgba(201,169,110,0.18)",
              padding: "clamp(14px,4vw,20px) clamp(16px,4vw,28px)",
              display: "inline-flex",
              alignItems: "center",
              gap: "clamp(12px,4vw,20px)",
              marginBottom: "clamp(32px,6vw,52px)",
              animation: "slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both 1.1s",
              opacity: 0,
              cursor: "pointer",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(240,230,208,0.38)",
                  marginBottom: 4,
                }}
              >
                Order ID
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "clamp(13px,3vw,16px)",
                  color: "#c9a96e",
                  letterSpacing: "0.06em",
                  wordBreak: "break-all",
                }}
              >
                {orderId}
              </div>
            </div>
            <button
              style={{
                padding: "6px 14px",
                border: "1px solid rgba(201,169,110,0.18)",
                background: "none",
                color: "rgba(240,230,208,0.38)",
                fontSize: 9,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                minHeight: 36,
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}

        {/* Stats grid — 3 col on desktop, 1 col on mobile */}
        {order && (
          <div
            className="order-confirm-stats"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 2,
              marginBottom: "clamp(28px,6vw,52px)",
              textAlign: "left",
              animation: "slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both 1.2s",
              opacity: 0,
            }}
          >
            {[
              {
                label: "Total Amount",
                val: fmt(total),
                sub: "Inclusive of taxes",
              },
              {
                label: "Payment Status",
                val: order?.payment?.status
                  ? order.payment.status.charAt(0).toUpperCase() +
                    order.payment.status.slice(1)
                  : "Pending",
                sub: "Razorpay secured",
              },
              {
                label: "Estimated Delivery",
                val: "3–5 Business Days",
                sub: "Standard shipping",
              },
            ].map((box, i) => (
              <div
                key={i}
                style={{
                  padding: "clamp(16px,3vw,24px)",
                  background: "#1a1916",
                  border: "1px solid rgba(201,169,110,0.18)",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(240,230,208,0.38)",
                    marginBottom: 10,
                  }}
                >
                  {box.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: "clamp(14px,3vw,16px)",
                    color: "#f0e6d0",
                  }}
                >
                  {box.val}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(240,230,208,0.38)",
                    marginTop: 4,
                  }}
                >
                  {box.sub}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Items list */}
        {items.length > 0 && (
          <div
            style={{
              border: "1px solid rgba(201,169,110,0.18)",
              marginBottom: "clamp(28px,6vw,48px)",
              animation: "slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both 1.3s",
              opacity: 0,
            }}
          >
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(12px,3vw,20px)",
                  padding: "clamp(14px,3vw,20px) clamp(16px,4vw,24px)",
                  borderBottom:
                    i < items.length - 1
                      ? "1px solid rgba(201,169,110,0.08)"
                      : "none",
                }}
              >
                <div
                  style={{
                    width: "clamp(40px,8vw,52px)",
                    height: "clamp(50px,10vw,64px)",
                    background: "#252320",
                    border: "1px solid rgba(201,169,110,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.product?.image || item.image ? (
                    <img
                      src={item.product?.image || item.image}
                      alt={item.product?.name || item.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : null}
                </div>
                <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontSize: "clamp(14px,3vw,17px)",
                      fontWeight: 300,
                      color: "#f0e6d0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.product?.name || item.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(240,230,208,0.38)",
                      marginTop: 4,
                    }}
                  >
                    Qty: {item.quantity}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: "clamp(16px,3vw,20px)",
                    color: "#c9a96e",
                    flexShrink: 0,
                  }}
                >
                  {fmt(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div
          className="order-confirm-actions"
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            animation: "slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both 1.4s",
            opacity: 0,
          }}
        >
          {orderId && (
            <button
              onClick={() => navigate(`/orders/${orderId}/track`)}
              style={{
                padding: "clamp(14px,3vw,18px) clamp(20px,5vw,36px)",
                background: "#c9a96e",
                color: "#0d0c0b",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                flex: "1 1 auto",
                minWidth: 140,
              }}
            >
              Track Order →
            </button>
          )}
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "clamp(14px,3vw,18px) clamp(16px,4vw,28px)",
              background: "none",
              color: "rgba(240,230,208,0.38)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              border: "1px solid rgba(201,169,110,0.18)",
              cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif",
              flex: "1 1 auto",
              minWidth: 140,
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 639px) {
          .order-confirm-stats { grid-template-columns: 1fr !important; gap: 2px !important; }
          .order-confirm-actions { flex-direction: column !important; }
          .order-confirm-actions button { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}

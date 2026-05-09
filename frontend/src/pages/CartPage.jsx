import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../api/cart";
import { couponsApi } from "../api/orders";
import { productApi } from "../api/products";
import { useAuthStore } from "../store/authStore";
import { useGuestCartStore } from "../store/guestCartStore";
import Toast from "../components/ui/Toast";
import { getSessionId } from "../hooks/useBehaviorTracker";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

function CartItem({ item, onUpdate, onRemove }) {
  return (
    <div className="cart-item">
      <div className="cart-item__img">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <svg width="36" height="36" viewBox="0 0 60 60" fill="none">
            <rect
              x="15"
              y="8"
              width="30"
              height="44"
              stroke="rgba(201,169,110,0.6)"
              strokeWidth="0.8"
            />
            <line
              x1="20"
              y1="20"
              x2="40"
              y2="20"
              stroke="rgba(201,169,110,0.3)"
              strokeWidth="0.8"
            />
            <line
              x1="20"
              y1="26"
              x2="40"
              y2="26"
              stroke="rgba(201,169,110,0.3)"
              strokeWidth="0.8"
            />
            <circle
              cx="30"
              cy="42"
              r="4"
              stroke="rgba(201,169,110,0.4)"
              strokeWidth="0.8"
            />
          </svg>
        )}
      </div>

      <div className="cart-item__details">
        <div>
          <div className="cart-item__brand">Neural Shop</div>
          <div className="cart-item__name">{item.name}</div>
          {item.size && <span className="cart-item__size">{item.size}</span>}
        </div>
        <div className="cart-item__qty-row">
          <button
            onClick={() =>
              onUpdate({
                productId: item.productId,
                quantity: Math.max(1, item.quantity - 1),
                size: item.size,
              })
            }
            className="cart-item__qty-btn"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="cart-item__qty-val">{item.quantity}</span>
          <button
            onClick={() =>
              onUpdate({
                productId: item.productId,
                quantity: item.quantity + 1,
                size: item.size,
              })
            }
            className="cart-item__qty-btn"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="cart-item__right">
        <div className="cart-item__price">
          {fmt((item.priceAtAdd || 0) * item.quantity)}
        </div>
        <button
          onClick={() =>
            onRemove({ productId: item.productId, size: item.size })
          }
          className="cart-item__remove"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function CouponInput({ couponCode, setCouponCode, onApply, coupon, discount }) {
  return (
    <div className="coupon-section">
      <div className="coupon-section__row">
        <input
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onApply()}
          placeholder="Neural Code"
          className="coupon-section__input"
        />
        <button onClick={onApply} className="coupon-section__btn">
          Apply
        </button>
      </div>
      {coupon && (
        <div className="coupon-section__success">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {coupon.coupon.code} applied — You save {fmt(discount)}
        </div>
      )}
    </div>
  );
}

function OrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  discount,
  total,
  coupon,
  isLoggedIn,
  onCheckout,
}) {
  return (
    <div className="order-summary">
      <div className="order-summary__title">Order Summary</div>

      <div className="order-summary__rows">
        {[
          {
            label: `Subtotal (${items.length} item${items.length !== 1 ? "s" : ""})`,
            value: fmt(subtotal),
          },
          {
            label: "Shipping",
            value: shipping === 0 ? "Free" : fmt(shipping),
            green: shipping === 0,
          },
          { label: "Tax (18% GST)", value: fmt(tax) },
          ...(discount > 0
            ? [
                {
                  label: `Discount (${coupon.coupon.code})`,
                  value: `−${fmt(discount)}`,
                  green: true,
                },
              ]
            : []),
        ].map((row, i) => (
          <div key={i} className="order-summary__row">
            <span className="order-summary__row-label">{row.label}</span>
            <span
              className={`order-summary__row-val${row.green ? " green" : ""}`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="order-summary__total">
        <span className="order-summary__total-label">Total</span>
        <span className="order-summary__total-val">{fmt(total)}</span>
      </div>

      <button onClick={onCheckout} className="order-summary__checkout-btn">
        {isLoggedIn ? "Proceed to Checkout →" : "Sign In to Checkout →"}
      </button>
      {!isLoggedIn && (
        <div className="order-summary__guest-note">
          Your cart is saved — log in to complete your order
        </div>
      )}
      <div className="order-summary__security">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        256-bit SSL · Razorpay PCI DSS
      </div>
    </div>
  );
}

function CompleteTheLook({ firstProductId }) {
  const navigate = useNavigate();

  const { data: picks = [] } = useQuery({
    queryKey: ["complete-look", firstProductId],
    queryFn: () =>
      (firstProductId
        ? productApi.related(firstProductId)
        : productApi.personalized(getSessionId())
      ).then((r) => (r.data.data || []).slice(0, 4)),
    staleTime: 10 * 60 * 1000,
    retry: 0,
    enabled: true,
  });

  if (picks.length < 2) return null;

  return (
    <div
      style={{
        marginTop: 40,
        paddingTop: 32,
        borderTop: "1px solid rgba(201,169,110,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <span
          style={{
            width: 20,
            height: 1,
            background: "linear-gradient(to right, transparent, #c9a96e)",
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: 9,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#c9a96e",
          }}
        >
          Complete the Look
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        {picks.map((p) => {
          const pid = p._id || p.id;
          const img = p.images?.[0];
          return (
            <div
              key={pid}
              onClick={() => navigate(`/product/${pid}`)}
              style={{
                background: "#1a1916",
                border: "1px solid rgba(201,169,110,0.12)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,169,110,0.35)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,169,110,0.12)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                style={{
                  aspectRatio: "3/4",
                  background: "#0d0c0b",
                  overflow: "hidden",
                }}
              >
                {img ? (
                  <img
                    src={img}
                    alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 60 60" fill="none">
                      <rect x="10" y="10" width="40" height="40" stroke="rgba(201,169,110,0.2)" strokeWidth="0.8" />
                    </svg>
                  </div>
                )}
              </div>
              <div style={{ padding: "10px 10px 12px" }}>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 13,
                    fontWeight: 300,
                    color: "#f0e6d0",
                    marginBottom: 4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 15,
                    color: "#c9a96e",
                  }}
                >
                  {"₹" + Number(p.price || 0).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isLoggedIn } = useAuthStore();
  const guestItems = useGuestCartStore((s) => s.items);
  const guestRemove = useGuestCartStore((s) => s.removeItem);
  const guestUpdate = useGuestCartStore((s) => s.updateItem);
  const guestClear = useGuestCartStore((s) => s.clear);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.get().then((r) => r.data.data),
    enabled: isLoggedIn,
    retry: 1,
  });

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity, size }) =>
      isLoggedIn
        ? cartApi.updateItem(productId, quantity, size)
        : (guestUpdate(productId, size, quantity), Promise.resolve()),
    onSuccess: () => {
      if (isLoggedIn) qc.invalidateQueries(["cart"]);
    },
    onError: () => showToast("Failed to update quantity"),
  });

  const removeMutation = useMutation({
    mutationFn: ({ productId, size }) =>
      isLoggedIn
        ? cartApi.removeItem(productId, size)
        : (guestRemove(productId, size), Promise.resolve()),
    onSuccess: () => {
      if (isLoggedIn) qc.invalidateQueries(["cart"]);
      showToast("Item removed");
    },
    onError: () => showToast("Failed to remove item"),
  });

  const clearMutation = useMutation({
    mutationFn: () =>
      isLoggedIn ? cartApi.clear() : (guestClear(), Promise.resolve()),
    onSuccess: () => {
      if (isLoggedIn) qc.invalidateQueries(["cart"]);
      showToast("Cart cleared");
    },
  });

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await couponsApi.validate(couponCode.trim(), subtotal);
      setCoupon(res.data.data);
      showToast("Coupon applied successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Invalid coupon code");
    }
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      navigate("/login?return=/checkout");
    } else {
      navigate("/checkout", { state: { coupon, total } });
    }
  };

  const items = isLoggedIn
    ? data?.items || []
    : guestItems.map((i) => ({ ...i, priceAtAdd: i.priceAtAdd || 0 }));
  const subtotal =
    data?.subtotal ||
    items.reduce((s, i) => s + (i.priceAtAdd || 0) * i.quantity, 0);
  const shipping = data?.shippingCost || 0;
  const tax = data?.tax || Math.round(subtotal * 0.18);
  const discount = Math.round(coupon?.discountAmount || 0);
  const total = coupon?.totalAmount ?? subtotal + shipping + tax - discount;

  if (isLoggedIn && isLoading) {
    return (
      <div
        className="page-center"
        style={{ minHeight: "100vh", paddingTop: 80 }}
      >
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-page__container">
        {/* Page heading */}
        <div className="cart-page__heading">
          <div className="section-label">
            <div className="section-label__line" />
            Shopping Cart
          </div>
          <h1 className="cart-page__title">
            Your{" "}
            <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Curation</em>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(201,169,110,0.3)"
              strokeWidth="1"
              style={{ margin: "0 auto 20px", display: "block" }}
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <div className="cart-empty__title">Your cart is empty</div>
            <p
              style={{
                fontSize: 13,
                color: "rgba(240,230,208,0.38)",
                marginBottom: 24,
              }}
            >
              Discover something extraordinary
            </p>
            <button
              onClick={() => navigate("/collections")}
              className="btn-primary"
            >
              Browse Collections
            </button>
          </div>
        ) : (
          <>
            <div className="cart-layout">
              {/* Left — items */}
              <div>
                <div className="cart-items-header">
                  <span className="cart-items-count">
                    {items.length} Item{items.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => clearMutation.mutate()}
                    className="cart-clear-btn"
                  >
                    Clear All
                  </button>
                </div>

                {items.map((item) => (
                  <CartItem
                    key={item.productId + (item.size || "")}
                    item={item}
                    onUpdate={(args) => updateMutation.mutate(args)}
                    onRemove={(args) => removeMutation.mutate(args)}
                  />
                ))}

                <CompleteTheLook firstProductId={items[0]?.productId} />

                <CouponInput
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  onApply={handleApplyCoupon}
                  coupon={coupon}
                  discount={discount}
                />

                {/* Spacer for mobile sticky bar */}
                <div style={{ height: 80 }} className="mobile-cart-spacer" />
              </div>

              {/* Right — summary (hidden on mobile, replaced by sticky bar) */}
              <div className="cart-summary-desktop">
                <OrderSummary
                  items={items}
                  subtotal={subtotal}
                  shipping={shipping}
                  tax={tax}
                  discount={discount}
                  total={total}
                  coupon={coupon}
                  isLoggedIn={isLoggedIn}
                  onCheckout={handleCheckout}
                />
              </div>
            </div>

            {/* Mobile sticky checkout bar */}
            <div className="mobile-sticky-summary">
              <div>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(240,230,208,0.38)",
                    marginBottom: 2,
                  }}
                >
                  Total
                </div>
                <div className="mobile-sticky-summary__total">{fmt(total)}</div>
              </div>
              <button
                className="mobile-sticky-summary__btn"
                onClick={handleCheckout}
              >
                {isLoggedIn ? "Checkout →" : "Sign In →"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Hide desktop summary & spacer on mobile via style tag */}
      <style>{`
        @media (min-width: 640px) {
          .mobile-sticky-summary { display: none !important; }
          .mobile-cart-spacer { display: none !important; }
        }
        @media (max-width: 639px) {
          .cart-summary-desktop { display: none !important; }
          .cart-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../api/cart";
import { couponsApi } from "../api/orders";
import { useAuthStore } from "../store/authStore";
import { useGuestCartStore } from "../store/guestCartStore";
import Toast from "../components/ui/Toast";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

function CartItem({ item, onUpdate, onRemove }) {
  return (
    <div className="cart-item">
      <div className="cart-item__img">
        {item.image ? (
          <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <rect x="15" y="8" width="30" height="44" stroke="rgba(201,169,110,0.6)" strokeWidth="0.8" />
            <line x1="20" y1="20" x2="40" y2="20" stroke="rgba(201,169,110,0.3)" strokeWidth="0.8" />
            <line x1="20" y1="26" x2="40" y2="26" stroke="rgba(201,169,110,0.3)" strokeWidth="0.8" />
            <circle cx="30" cy="42" r="4" stroke="rgba(201,169,110,0.4)" strokeWidth="0.8" />
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
            onClick={() => onUpdate({ productId: item.productId, quantity: Math.max(1, item.quantity - 1), size: item.size })}
            className="cart-item__qty-btn"
          >−</button>
          <span className="cart-item__qty-val">{item.quantity}</span>
          <button
            onClick={() => onUpdate({ productId: item.productId, quantity: item.quantity + 1, size: item.size })}
            className="cart-item__qty-btn"
          >+</button>
        </div>
      </div>

      <div className="cart-item__right">
        <div className="cart-item__price">{fmt((item.priceAtAdd || 0) * item.quantity)}</div>
        <button
          onClick={() => onRemove({ productId: item.productId, size: item.size })}
          className="cart-item__remove"
        >Remove</button>
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
        <button onClick={onApply} className="coupon-section__btn">Apply</button>
      </div>
      {coupon && (
        <div className="coupon-section__success">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {coupon.coupon.code} applied — You save {fmt(discount)}
        </div>
      )}
    </div>
  );
}

function OrderSummary({ items, subtotal, shipping, tax, discount, total, coupon, isLoggedIn, onCheckout }) {
  return (
    <div className="order-summary">
      <div className="order-summary__title">Order Summary</div>

      <div className="order-summary__rows">
        {[
          { label: `Subtotal (${items.length} items)`, value: fmt(subtotal) },
          { label: "Shipping", value: shipping === 0 ? "Free" : fmt(shipping), green: shipping === 0 },
          { label: "Tax (18% GST)", value: fmt(tax) },
          ...(discount > 0 ? [{ label: `Discount (${coupon.coupon.code})`, value: `−${fmt(discount)}`, green: true }] : []),
        ].map((row, i) => (
          <div key={i} className="order-summary__row">
            <span className="order-summary__row-label">{row.label}</span>
            <span className={`order-summary__row-val${row.green ? " green" : ""}`}>{row.value}</span>
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
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        256-bit SSL · Razorpay PCI DSS
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
    onSuccess: () => { if (isLoggedIn) qc.invalidateQueries(["cart"]); },
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

  const items = isLoggedIn
    ? data?.items || []
    : guestItems.map((i) => ({ ...i, priceAtAdd: i.priceAtAdd || 0 }));
  const subtotal = data?.subtotal || items.reduce((s, i) => s + (i.priceAtAdd || 0) * i.quantity, 0);
  const shipping = data?.shippingCost || 0;
  const tax = data?.tax || Math.round(subtotal * 0.18);
  const discount = Math.round(coupon?.discountAmount || 0);
  const total = coupon?.totalAmount ?? subtotal + shipping + tax - discount;

  if (isLoggedIn && isLoading) {
    return (
      <div className="page-center" style={{ minHeight: "100vh", paddingTop: 80 }}>
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
            Your <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Curation</em>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty__title">Your cart is empty</div>
            <button onClick={() => navigate("/collections")} className="btn-primary" style={{ marginTop: 16 }}>
              Browse Collections
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Left — items */}
            <div>
              <div className="cart-items-header">
                <span className="cart-items-count">
                  {items.length} Item{items.length !== 1 ? "s" : ""}
                </span>
                <button onClick={() => clearMutation.mutate()} className="cart-clear-btn">
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

              <CouponInput
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                onApply={handleApplyCoupon}
                coupon={coupon}
                discount={discount}
              />
            </div>

            {/* Right — summary */}
            <div>
              <OrderSummary
                items={items}
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                discount={discount}
                total={total}
                coupon={coupon}
                isLoggedIn={isLoggedIn}
                onCheckout={() => {
                  if (!isLoggedIn) {
                    navigate("/login?return=/checkout");
                  } else {
                    navigate("/checkout", { state: { coupon, total } });
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}

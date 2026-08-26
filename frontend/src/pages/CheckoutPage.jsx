import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../api/cart";
import { userApi } from "../api/user";
import { ordersApi } from "../api/orders";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

function Stepper({ step }) {
  const steps = ["Delivery", "Review", "Payment"];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        marginBottom: "clamp(28px,5vw,52px)",
      }}
    >
      {steps.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "clamp(28px,6vw,36px)",
                height: "clamp(28px,6vw,36px)",
                border: `1px solid ${step > i ? "#c9a96e" : step === i ? "#c9a96e" : "rgba(201,169,110,0.18)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  step > i
                    ? "#c9a96e"
                    : step === i
                      ? "rgba(201,169,110,0.06)"
                      : "transparent",
                color:
                  step > i
                    ? "#0d0c0b"
                    : step === i
                      ? "#c9a96e"
                      : "rgba(240,230,208,0.38)",
                fontSize: "clamp(9px,2vw,11px)",
                fontFamily: "'DM Mono',monospace",
                transition: "all 0.5s cubic-bezier(0.23,1,0.32,1)",
                flexShrink: 0,
              }}
            >
              {step > i ? "✓" : `0${i + 1}`}
            </div>
            <span
              style={{
                fontSize: "clamp(9px,1.5vw,10px)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: step >= i ? "#f0e6d0" : "rgba(240,230,208,0.38)",
                transition: "color 0.5s",
                display: "block",
              }}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                flex: 1,
                height: 1,
                minWidth: 8,
                background:
                  step > i ? "rgba(201,169,110,0.4)" : "rgba(201,169,110,0.18)",
                margin: "0 clamp(8px,2vw,16px)",
                transition: "background 0.5s",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function FormField({ label, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        style={{
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(240,230,208,0.38)",
        }}
      >
        {label}
      </label>
      <input
        {...props}
        style={{
          padding: "clamp(11px,2vw,14px) clamp(12px,3vw,18px)",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(201,169,110,0.18)",
          color: "#f0e6d0",
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 14,
          outline: "none",
          width: "100%",
          minHeight: 44,
          ...props.style,
        }}
      />
    </div>
  );
}

function addrLine(addr) {
  if (!addr) return "";
  return [addr.street, addr.city, addr.state, addr.zipCode]
    .filter(Boolean)
    .join(", ");
}

const NAV_BTN_BASE = {
  padding: "clamp(13px,2vw,18px) clamp(16px,4vw,28px)",
  background: "none",
  color: "rgba(240,230,208,0.38)",
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  border: "1px solid rgba(201,169,110,0.18)",
  cursor: "pointer",
  fontFamily: "'DM Sans',sans-serif",
  minHeight: 44,
};
const PRIMARY_BTN_BASE = {
  padding: "clamp(13px,2vw,18px) clamp(20px,5vw,36px)",
  background: "#c9a96e",
  color: "#0d0c0b",
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  fontWeight: 500,
  border: "none",
  cursor: "pointer",
  fontFamily: "'DM Sans',sans-serif",
  minHeight: 44,
  flex: "1 1 auto",
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddr, setNewAddr] = useState({
    label: "Home",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [processing, setProcessing] = useState(false);
  const [addrError, setAddrError] = useState("");

  const coupon = location.state?.coupon;

  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.get().then((r) => r.data.data),
  });

  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => userApi.getAddresses().then((r) => r.data.data),
  });

  useEffect(() => {
    if (addresses?.length > 0 && !selectedAddress) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddress(def);
    }
  }, [addresses]);

  const items = cart?.items || [];
  const subtotal =
    cart?.subtotal ||
    items.reduce((s, i) => s + (i.priceAtAdd || 0) * i.quantity, 0);
  const tax = Math.round(subtotal * 0.18);

  const discount = coupon
    ? coupon.discountType === "PERCENTAGE"
      ? Math.round(subtotal * ((coupon.discountValue || 0) / 100))
      : coupon.discountType === "FIXED"
        ? Math.min(coupon.discountValue || 0, subtotal)
        : 0
    : 0;
  const total = subtotal + tax - discount;

  const createAddressMutation = useMutation({
    mutationFn: (d) => userApi.createAddress(d),
  });
  const createOrderMutation = useMutation({
    mutationFn: (body) => ordersApi.create(body),
    onSuccess: (res) => {
      const oid =
        res.data.data?.orderId || res.data.data?.id || res.data.data?._id;
      handlePayment(oid, total);
    },
    onError: (err) => {
      setProcessing(false);
      alert(err.response?.data?.message || "Order creation failed");
    },
  });

  const handlePayment = async (oid, amount) => {
    try {
      const payRes = await ordersApi.pay(oid);
      const rzpData = payRes.data.data;
      if (!rzpData?.razorpayOrderId) {
        setProcessing(false);
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        navigate("/order-confirmation", { state: { orderId: oid } });
        return;
      }
      const options = {
        key: rzpData.key,
        amount: rzpData.amount,
        currency: rzpData.currency || "INR",
        order_id: rzpData.razorpayOrderId,
        name: "NeuralShop",
        description: "Purchase",
        //After payment success, this handler will be called
        handler: () => {
          setProcessing(false);
          queryClient.invalidateQueries({ queryKey: ["cart"] });
          navigate("/order-confirmation", { state: { orderId: oid } });
        },
        prefill: {
          name: selectedAddress?.label || "",
          contact: selectedAddress?.phone || newAddr.phone,
        },
        theme: { color: "#c9a96e" },
        // If user closes the payment modal, reset processing state
        modal: { ondismiss: () => setProcessing(false) },
      };
      const rzp = new window.Razorpay(options);
      // Open the Razorpay payment modal
      rzp.open();
    } catch {
      setProcessing(false);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      navigate("/order-confirmation", { state: { orderId: oid } });
    }
  };

  const placeOrder = async () => {
    setProcessing(true);
    setAddrError("");
    let addressId = selectedAddress?.id;
    if (!addressId) {
      if (
        !newAddr.street ||
        !newAddr.city ||
        !newAddr.state ||
        !newAddr.zipCode
      ) {
        setAddrError("Please fill in all required address fields.");
        setProcessing(false);
        return;
      }
      try {
        const res = await createAddressMutation.mutateAsync(newAddr);
        addressId = res.data.data?.id || res.data.data?._id;
        await refetchAddresses(); //refetchAddresses is the function returned by useQuery to manually fetch the addresses API again.
      } catch (err) {
        setAddrError(err.response?.data?.message || "Failed to save address.");
        setProcessing(false);
        return;
      }
    }
    createOrderMutation.mutate({
      addressId,
      couponCode: coupon?.code,
      paymentMethod,
    });
  };

  // Mini order summary sidebar
  const miniSummary = (
    <div
      style={{
        background: "#1a1916",
        border: "1px solid rgba(201,169,110,0.18)",
        padding: "clamp(20px,3vw,28px)",
        position: "sticky",
        top: 100,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(240,230,208,0.38)",
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: "1px solid rgba(201,169,110,0.18)",
        }}
      >
        Order Summary
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(10px,2vw,16px)",
            padding: "12px 0",
            borderBottom: "1px solid rgba(201,169,110,0.08)",
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
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
                <rect
                  x="15"
                  y="8"
                  width="30"
                  height="44"
                  stroke="rgba(201,169,110,0.5)"
                  strokeWidth="0.8"
                />
              </svg>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(13px,2vw,16px)",
                fontWeight: 300,
                color: "#f0e6d0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(240,230,208,0.38)",
                marginTop: 4,
              }}
            >
              Qty: {item.quantity}
              {item.size ? ` · ${item.size}` : ""}
            </div>
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(15px,2vw,18px)",
              color: "#c9a96e",
              flexShrink: 0,
            }}
          >
            {fmt((item.priceAtAdd || 0) * item.quantity)}
          </div>
        </div>
      ))}
      <div
        style={{
          marginTop: 16,
          padding: "16px 0 0",
          borderTop: "1px solid rgba(201,169,110,0.18)",
        }}
      >
        {[
          { label: "Subtotal", val: fmt(subtotal) },
          { label: "Tax (18%)", val: fmt(tax) },
          ...(discount > 0
            ? [{ label: "Discount", val: `−${fmt(discount)}`, green: true }]
            : []),
        ].map((r, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              fontSize: 12,
              color: r.green
                ? "rgba(138,173,135,0.9)"
                : "rgba(240,230,208,0.55)",
            }}
          >
            <span>{r.label}</span>
            <span style={{ fontFamily: "'DM Mono',monospace" }}>{r.val}</span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 0 0",
            marginTop: 8,
            borderTop: "1px solid rgba(201,169,110,0.18)",
          }}
        >
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(240,230,208,0.38)",
            }}
          >
            Total
          </span>
          <span
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(20px,3vw,24px)",
              color: "#c9a96e",
              fontWeight: 300,
            }}
          >
            {fmt(total)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", paddingTop: "clamp(64px,10vw,100px)" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        .checkout-addr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .checkout-city-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 32px; }
        .checkout-action-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .checkout-summary-aside { display: block; }
        @media (max-width: 1023px) {
          .checkout-summary-aside { display: none; }
        }
        @media (max-width: 639px) {
          .checkout-addr-grid { grid-template-columns: 1fr !important; }
          .checkout-city-grid { grid-template-columns: 1fr 1fr !important; }
          .checkout-action-row button { flex: 1 1 100%; }
        }
        @media (max-width: 440px) {
          .checkout-city-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Processing overlay */}
      {processing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,12,11,0.97)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              border: "1px solid rgba(201,169,110,0.18)",
              borderTopColor: "#c9a96e",
              borderRadius: "50%",
              animation: "spin 1.2s linear infinite",
            }}
          />
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(18px,4vw,22px)",
              fontWeight: 300,
              color: "#f0e6d0",
              animation: "pulse 2s ease-in-out infinite",
              textAlign: "center",
              padding: "0 20px",
            }}
          >
            Securing your order
          </div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(240,230,208,0.38)",
            }}
          >
            End-to-end encrypted · Razorpay
          </div>
        </div>
      )}

      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          padding: "0 var(--page-px)",
        }}
      >
        {/* Page header */}
        <div style={{ padding: "clamp(24px,5vw,60px) 0 clamp(16px,3vw,48px)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 10,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#c9a96e",
              marginBottom: 14,
            }}
          >
            <div style={{ width: 28, height: 1, background: "#c9a96e" }} />
            Secure Checkout
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(30px,5vw,64px)",
              fontWeight: 300,
              color: "#f0e6d0",
              lineHeight: 1.05,
            }}
          >
            <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Complete</em>{" "}
            Your Order
          </h1>
        </div>

        <Stepper step={step} />

        {/* Main layout: form + aside summary */}
        <div
          className="checkout-layout"
          style={{ paddingLeft: 0, paddingRight: 0 }}
        >
          {/* Form area */}
          <div className="checkout-step-content">
            {/* ── Step 0: Delivery ── */}
            {step === 0 && (
              <div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: "clamp(20px,3vw,24px)",
                    fontWeight: 300,
                    color: "#f0e6d0",
                    marginBottom: 24,
                  }}
                >
                  Delivery Address
                </div>

                {/* Saved addresses */}
                {addresses?.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill,minmax(220px,1fr))",
                      gap: 12,
                      marginBottom: 24,
                    }}
                  >
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr)}
                        style={{
                          padding: "clamp(14px,3vw,20px)",
                          border: `1px solid ${selectedAddress?.id === addr.id ? "#c9a96e" : "rgba(201,169,110,0.18)"}`,
                          cursor: "pointer",
                          transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
                          background:
                            selectedAddress?.id === addr.id
                              ? "rgba(201,169,110,0.04)"
                              : "transparent",
                          position: "relative",
                        }}
                      >
                        {selectedAddress?.id === addr.id && (
                          <div
                            style={{
                              position: "absolute",
                              top: -1,
                              left: 0,
                              right: 0,
                              height: 2,
                              background: "#c9a96e",
                            }}
                          />
                        )}
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#f0e6d0",
                            marginBottom: 4,
                          }}
                        >
                          {addr.label || "Address"}
                          {addr.phone && (
                            <span
                              style={{
                                fontSize: 11,
                                color: "rgba(240,230,208,0.4)",
                                marginLeft: 8,
                              }}
                            >
                              {addr.phone}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "rgba(240,230,208,0.38)",
                            lineHeight: 1.7,
                          }}
                        >
                          {addr.street}
                          <br />
                          {addr.city}, {addr.state} {addr.zipCode}
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            width: 16,
                            height: 16,
                            border: "1px solid rgba(201,169,110,0.18)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {selectedAddress?.id === addr.id && (
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                background: "#c9a96e",
                                borderRadius: "50%",
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* New address form */}
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: "clamp(16px,2vw,20px)",
                    fontWeight: 300,
                    color: "rgba(240,230,208,0.6)",
                    marginBottom: 20,
                  }}
                >
                  {addresses?.length > 0
                    ? "Or add a new address"
                    : "Enter delivery address"}
                </div>
                {addrError && (
                  <div
                    style={{
                      marginBottom: 16,
                      padding: "10px 16px",
                      background: "rgba(180,60,60,0.12)",
                      border: "1px solid rgba(180,60,60,0.3)",
                      fontSize: 12,
                      color: "rgba(240,150,150,0.9)",
                    }}
                  >
                    {addrError}
                  </div>
                )}

                <div className="checkout-addr-grid">
                  <FormField
                    label="Address Label (e.g. Home, Work)"
                    value={newAddr.label}
                    onChange={(e) => {
                      setSelectedAddress(null);
                      setNewAddr((p) => ({ ...p, label: e.target.value }));
                    }}
                  />
                  <FormField
                    label="Phone"
                    value={newAddr.phone}
                    onChange={(e) => {
                      setSelectedAddress(null);
                      setNewAddr((p) => ({ ...p, phone: e.target.value }));
                    }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <FormField
                    label="Street Address *"
                    value={newAddr.street}
                    onChange={(e) => {
                      setSelectedAddress(null);
                      setNewAddr((p) => ({ ...p, street: e.target.value }));
                    }}
                  />
                </div>
                <div className="checkout-city-grid">
                  <FormField
                    label="City *"
                    value={newAddr.city}
                    onChange={(e) => {
                      setSelectedAddress(null);
                      setNewAddr((p) => ({ ...p, city: e.target.value }));
                    }}
                  />
                  <FormField
                    label="State *"
                    value={newAddr.state}
                    onChange={(e) => {
                      setSelectedAddress(null);
                      setNewAddr((p) => ({ ...p, state: e.target.value }));
                    }}
                  />
                  <FormField
                    label="ZIP / Pincode *"
                    value={newAddr.zipCode}
                    onChange={(e) => {
                      setSelectedAddress(null);
                      setNewAddr((p) => ({ ...p, zipCode: e.target.value }));
                    }}
                  />
                </div>

                <div className="checkout-action-row">
                  <button
                    onClick={() => navigate("/cart")}
                    style={NAV_BTN_BASE}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      if (
                        !selectedAddress &&
                        (!newAddr.street ||
                          !newAddr.city ||
                          !newAddr.state ||
                          !newAddr.zipCode)
                      ) {
                        setAddrError(
                          "Please fill in all required address fields.",
                        );
                        return;
                      }
                      setAddrError("");
                      setStep(1);
                    }}
                    style={PRIMARY_BTN_BASE}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 1: Review ── */}
            {step === 1 && (
              <div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: "clamp(20px,3vw,24px)",
                    fontWeight: 300,
                    color: "#f0e6d0",
                    marginBottom: 24,
                  }}
                >
                  Review Your Order
                </div>
                {items.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "clamp(12px,3vw,16px)",
                      alignItems: "center",
                      padding: "16px 0",
                      borderBottom: "1px solid rgba(201,169,110,0.08)",
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
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : null}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "'Cormorant Garamond',serif",
                          fontSize: "clamp(14px,2vw,16px)",
                          fontWeight: 300,
                          color: "#f0e6d0",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(240,230,208,0.38)",
                          marginTop: 4,
                        }}
                      >
                        Qty: {item.quantity}
                        {item.size ? ` · Size: ${item.size}` : ""}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: "clamp(15px,2vw,18px)",
                        color: "#c9a96e",
                        flexShrink: 0,
                      }}
                    >
                      {fmt((item.priceAtAdd || 0) * item.quantity)}
                    </div>
                  </div>
                ))}

                {(selectedAddress || newAddr.street) && (
                  <div
                    style={{
                      marginTop: 20,
                      padding: "clamp(12px,3vw,16px) clamp(14px,3vw,20px)",
                      background: "rgba(201,169,110,0.03)",
                      border: "1px solid rgba(201,169,110,0.12)",
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
                      Deliver to
                    </div>
                    <div style={{ fontSize: 13, color: "#f0e6d0" }}>
                      {selectedAddress ? selectedAddress.label : newAddr.label}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(240,230,208,0.5)",
                        marginTop: 4,
                      }}
                    >
                      {addrLine(selectedAddress || newAddr)}
                    </div>
                  </div>
                )}

                <div className="checkout-action-row" style={{ marginTop: 28 }}>
                  <button onClick={() => setStep(0)} style={NAV_BTN_BASE}>
                    ← Back
                  </button>
                  <button onClick={() => setStep(2)} style={PRIMARY_BTN_BASE}>
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Payment ── */}
            {step === 2 && (
              <div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: "clamp(20px,3vw,24px)",
                    fontWeight: 300,
                    color: "#f0e6d0",
                    marginBottom: 24,
                  }}
                >
                  Payment Method
                </div>

                <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
                  {[
                    {
                      id: "razorpay",
                      name: "Razorpay",
                      desc: "Cards, UPI, Netbanking, Wallets",
                    },
                    {
                      id: "cod",
                      name: "Cash on Delivery",
                      desc: "Pay when your order arrives",
                    },
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "clamp(12px,3vw,16px)",
                        padding: "clamp(14px,3vw,18px) clamp(14px,3vw,20px)",
                        border: `1px solid ${paymentMethod === method.id ? "#c9a96e" : "rgba(201,169,110,0.18)"}`,
                        cursor: "pointer",
                        transition: "all 0.4s",
                        position: "relative",
                      }}
                    >
                      {paymentMethod === method.id && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: 3,
                            background: "#c9a96e",
                          }}
                        />
                      )}
                      <div
                        style={{
                          width: 44,
                          height: 28,
                          border: "1px solid rgba(201,169,110,0.18)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          color: "#c9a96e",
                          fontFamily: "'DM Mono',monospace",
                          flexShrink: 0,
                        }}
                      >
                        {method.id === "razorpay" ? "RZP" : "COD"}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#f0e6d0",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {method.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "rgba(240,230,208,0.38)",
                          }}
                        >
                          {method.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "clamp(10px,2vw,12px) clamp(12px,3vw,16px)",
                    border: "1px solid rgba(74,92,71,0.25)",
                    background: "rgba(74,92,71,0.08)",
                    fontSize: 11,
                    color: "rgba(138,173,135,0.8)",
                    marginBottom: 24,
                    flexWrap: "wrap",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Your payment is secured with 256-bit SSL encryption
                </div>

                <div className="checkout-action-row">
                  <button onClick={() => setStep(1)} style={NAV_BTN_BASE}>
                    ← Back
                  </button>
                  <button
                    onClick={placeOrder}
                    disabled={processing}
                    style={{
                      ...PRIMARY_BTN_BASE,
                      opacity: processing ? 0.7 : 1,
                    }}
                  >
                    Place Order — {fmt(total)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Aside summary — hidden on tablet/mobile via CSS */}
          <div className="checkout-summary-aside">{miniSummary}</div>
        </div>

        {/* Mobile order summary — always visible below form on small screens */}
        <div style={{ display: "none" }} className="checkout-mobile-summary">
          <div
            style={{
              marginTop: 32,
              marginBottom: 40,
              borderTop: "1px solid rgba(201,169,110,0.08)",
              paddingTop: 24,
            }}
          >
            {miniSummary}
          </div>
        </div>
        <style>{`
          @media (max-width: 1023px) {
            .checkout-mobile-summary { display: block !important; }
          }

          @media (max-width: 767px) {
            .checkout-action-row {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
              background: rgba(13,12,11,0.96);
              border-top: 1px solid rgba(201,169,110,0.12);
              z-index: 22;
              backdrop-filter: blur(10px);
            }

            .checkout-action-row button {
              flex: 1 1 100%;
              min-width: 0;
            }

            .checkout-step-content {
              padding-bottom: 80px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

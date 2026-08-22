import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { agentApi } from "../api/agent";
import { ordersApi } from "../api/orders";
import { userApi } from "../api/user";
import { getSessionId } from "../hooks/useBehaviorTracker";
import { useAuthStore } from "../store/authStore";
import "./AgentPage.css";

const suggestions = [
  "Find a premium black wedding outfit under ₹10,000",
  "Find something similar to what I bought last time",
  "Find the best rated option under ₹5,000",
];

export default function AgentPage() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const { data: addresses = [] } = useQuery({
    queryKey: ["agent-addresses"],
    queryFn: () =>
      userApi.getAddresses().then((response) => response.data?.data || []),
    enabled: isLoggedIn,
    retry: false,
  });

  const askAgent = async (value = message) => {
    if (!value.trim() || loading) return;
    setLoading(true);
    try {
      const defaultAddress =
        addresses.find((address) => address.isDefault) || addresses[0];
      const response = await agentApi.chat(
        value.trim(),
        getSessionId(),
        defaultAddress?.id,
      );
      setResult(response.data?.data || null);
      setMessage("");
    } catch (error) {
      setResult({
        message:
          error.response?.data?.message ||
          "I could not reach the commerce agent. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    if (!result?.memory?.preparedOrderId || payment) return;
    setLoading(true);
    try {
      const response = await agentApi.confirmPayment(
        result.sessionId || getSessionId(),
      );
      setPayment(response.data?.data || null);
    } catch (error) {
      setResult((current) => ({
        ...current,
        message:
          error.response?.data?.message ||
          "Payment could not be started. Nothing was charged.",
      }));
    } finally {
      setLoading(false);
    }
  };

  const openRazorpay = () => {
    if (!payment || !window.Razorpay) return;
    const razorpay = new window.Razorpay({
      key: payment.key,
      amount: payment.amount,
      currency: payment.currency || "INR",
      order_id: payment.razorpayOrderId,
      name: "NeuralShop",
      description: "NeuralShop Agent order",
      handler: async () => {
        const orderId = result?.memory?.preparedOrderId;
        try {
          await ordersApi.waitForPaymentConfirmation(orderId);
          navigate("/order-confirmation", { state: { orderId } });
        } catch {
          setResult((current) => ({
            ...current,
            message:
              "Payment was submitted, but the server has not confirmed it yet. Check your orders shortly.",
          }));
        }
      },
      theme: { color: "#c9a96e" },
    });
    razorpay.open();
  };

  const products = result?.data?.products || [];

  return (
    <main className="agent-page">
      <section className="agent-hero">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="agent-kicker">NEURALSHOP / CONCIERGE</p>
          <h1>
            Shopping, with <em>judgment.</em>
          </h1>
          <p className="agent-lede">
            Tell me the occasion, the feeling, or the constraint. I will search
            the real catalog, check availability, and keep every commerce action
            under your control.
          </p>
        </motion.div>
        <div className="agent-suggestions">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setMessage(suggestion);
                askAgent(suggestion);
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </section>

      <section className="agent-console" aria-live="polite">
        <div className="agent-input-row">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && askAgent()}
            placeholder="What are you looking for?"
            aria-label="Shopping request"
          />
          <button
            className="agent-send"
            type="button"
            disabled={loading}
            onClick={() => askAgent()}
          >
            {loading ? "Working..." : "Ask agent"}
          </button>
        </div>
        {loading && (
          <div className="agent-activity">
            <span className="agent-pulse" /> Understanding your request{" "}
            <span>→</span> Searching the catalog <span>→</span> Checking what
            fits
          </div>
        )}
        {result && !loading && (
          <div className="agent-result">
            <p className="agent-result-label">
              {result.intent || "AGENT RESPONSE"}
            </p>
            <p className="agent-message">{result.message}</p>
            {result.requiresConfirmation && (
              <div className="agent-confirmation">
                <strong>Payment boundary</strong>
                <span>
                  Nothing has been charged. Confirm this exact order to open
                  Razorpay.
                </span>
                {payment ? (
                  <button type="button" onClick={openRazorpay}>
                    Open Razorpay
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={confirmPayment}
                  >
                    {loading ? "Preparing payment..." : "Confirm and continue"}
                  </button>
                )}
              </div>
            )}
            {!isLoggedIn && result.tool === "add_to_cart" && (
              <button
                type="button"
                onClick={() => navigate("/login?return=/agent")}
              >
                Sign in to add this to cart
              </button>
            )}
            {products.length > 0 && (
              <div className="agent-products">
                {products.map((product) => (
                  <article className="agent-product" key={product.id}>
                    <img src={product.images?.[0]} alt="" />
                    <div>
                      <h2>{product.name}</h2>
                      <p>
                        ₹{Number(product.price || 0).toLocaleString("en-IN")} ·{" "}
                        {product.rating ? `${product.rating}★` : "New"}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        View piece
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

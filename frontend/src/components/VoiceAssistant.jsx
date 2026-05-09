import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useGuestCartStore } from "../store/guestCartStore";
import { useQuery } from "@tanstack/react-query";
import { cartApi } from "../api/cart";
import { voiceApi } from "../api/voice";

// ─── Speech helpers ───────────────────────────────────────────────────────────

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const supported = !!SpeechRecognition;

function speak(text) {
  if (!text || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-IN";
  utt.rate = 0.95;
  utt.pitch = 1.0;

  // Prefer a natural voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"),
  ) || voices.find((v) => v.lang.startsWith("en"));
  if (preferred) utt.voice = preferred;

  window.speechSynthesis.speak(utt);
}

// ─── Pulsing mic icon ─────────────────────────────────────────────────────────

function MicIcon({ listening }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
      {listening && (
        <circle cx="12" cy="8" r="1.5" fill="currentColor" opacity="0.7">
          <animate attributeName="r" values="1.5;3;1.5" dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: productId } = useParams();

  const { isLoggedIn } = useAuthStore();
  const guestItems = useGuestCartStore((s) => s.items);

  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.get().then((r) => r.data.data),
    enabled: isLoggedIn,
    retry: 0,
  });

  const cartItems = isLoggedIn ? cartData?.items || [] : guestItems;

  // ── State ────────────────────────────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Product context injected by ProductDetailPage via custom event
  const productCtxRef = useRef({ productId: null, productName: null, availableSizes: [], selectedSize: null });

  const recRef = useRef(null);
  const panelRef = useRef(null);

  // ── Listen for product context updates from ProductDetailPage ────────────────
  useEffect(() => {
    const handler = (e) => { productCtxRef.current = e.detail; };
    window.addEventListener("voice:product_context", handler);
    return () => window.removeEventListener("voice:product_context", handler);
  }, []);

  // ── Close panel on route change ───────────────────────────────────────────────
  useEffect(() => {
    setOpen(false);
    stopListening();
  }, [location.pathname]);

  // ── Click outside to close ────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        stopListening();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── Speech recognition ────────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!supported) {
      setError("Voice is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    setTranscript("");
    setResponse("");
    setError("");

    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    recRef.current = rec;

    rec.onstart = () => setListening(true);

    rec.onresult = (e) => {
      const interim = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(interim);
    };

    rec.onerror = (e) => {
      setListening(false);
      if (e.error !== "aborted") setError("Couldn't hear you. Please try again.");
    };

    rec.onend = () => {
      setListening(false);
      const final = transcript || recRef.current?._lastTranscript;
      if (final?.trim()) sendToNLU(final.trim());
    };

    // Capture final transcript at end
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(text);
      if (rec) rec._lastTranscript = text;
    };

    rec.start();
  }, [transcript]);

  // ── NLU + action execution ────────────────────────────────────────────────────
  const sendToNLU = useCallback(async (text) => {
    setLoading(true);
    setError("");

    const pCtx = productCtxRef.current;
    const context = {
      page: location.pathname,
      productId: pCtx.productId || productId || null,
      productName: pCtx.productName || null,
      cartItemCount: cartItems.length,
      isCartEmpty: cartItems.length === 0,
      isLoggedIn,
      availableSizes: pCtx.availableSizes || [],
      selectedSize: pCtx.selectedSize || null,
    };

    try {
      const res = await voiceApi.interpret(text, context);
      const result = res.data?.data;

      if (!result) throw new Error("No response");

      setResponse(result.speak || "");
      if (result.speak) speak(result.speak);

      executeAction(result);
    } catch (_) {
      const msg = "Sorry, something went wrong. Please try again.";
      setResponse(msg);
      speak(msg);
    } finally {
      setLoading(false);
    }
  }, [location.pathname, cartItems, isLoggedIn, productId]);

  const executeAction = useCallback((result) => {
    const { action, params = {} } = result;

    switch (action) {
      case "navigate":
        if (params.route) {
          setTimeout(() => { setOpen(false); navigate(params.route); }, 1200);
        }
        break;

      case "search":
        if (params.query) {
          setTimeout(() => {
            setOpen(false);
            navigate(`/collections?search=${encodeURIComponent(params.query)}`);
          }, 1200);
        }
        break;

      case "filter_collection": {
        const qs = new URLSearchParams();
        if (params.category) qs.set("category", params.category);
        if (params.priceMax) qs.set("priceMax", String(params.priceMax));
        if (params.priceMin) qs.set("priceMin", String(params.priceMin));
        setTimeout(() => {
          setOpen(false);
          navigate(`/collections?${qs.toString()}`);
        }, 1200);
        break;
      }

      case "add_to_cart":
        window.dispatchEvent(
          new CustomEvent("voice:add_to_cart", { detail: { size: params.size } }),
        );
        break;

      case "view_cart":
        setTimeout(() => { setOpen(false); navigate("/cart"); }, 1200);
        break;

      case "checkout":
        setTimeout(() => {
          setOpen(false);
          navigate(isLoggedIn ? "/checkout" : "/login?return=/checkout");
        }, 1200);
        break;

      case "view_orders":
        setTimeout(() => { setOpen(false); navigate("/account/orders"); }, 1200);
        break;

      case "view_wishlist":
        setTimeout(() => { setOpen(false); navigate("/account/wishlist"); }, 1200);
        break;

      case "view_profile":
        setTimeout(() => { setOpen(false); navigate("/account/profile"); }, 1200);
        break;

      case "logout":
        setTimeout(() => { setOpen(false); navigate("/logout"); }, 1200);
        break;

      // validation_error, not_understood, speak_info — just speak, no navigation
      default:
        break;
    }
  }, [navigate, isLoggedIn]);

  // Don't render on admin or auth pages
  const path = location.pathname;
  if (
    path.startsWith("/admin") ||
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/verify-email") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/new-password") ||
    path.startsWith("/logout") ||
    path.startsWith("/logged-out")
  ) {
    return null;
  }

  return (
    <>
      <style>{`
        .va-fab {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #0d0c0b;
          border: 1px solid rgba(201,169,110,0.45);
          color: #c9a96e;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.23,1,0.32,1);
          box-shadow: 0 4px 24px rgba(0,0,0,0.5);
        }
        .va-fab:hover {
          border-color: #c9a96e;
          transform: scale(1.08);
          box-shadow: 0 0 20px rgba(201,169,110,0.2), 0 4px 24px rgba(0,0,0,0.5);
        }
        .va-fab.listening {
          border-color: #c9a96e;
          box-shadow: 0 0 0 4px rgba(201,169,110,0.15), 0 0 0 8px rgba(201,169,110,0.06), 0 4px 24px rgba(0,0,0,0.5);
          animation: va-pulse 1.4s ease-in-out infinite;
        }
        @keyframes va-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(201,169,110,0.15), 0 0 0 8px rgba(201,169,110,0.06), 0 4px 24px rgba(0,0,0,0.5); }
          50% { box-shadow: 0 0 0 8px rgba(201,169,110,0.1), 0 0 0 16px rgba(201,169,110,0.03), 0 4px 24px rgba(0,0,0,0.5); }
        }
        .va-panel {
          position: fixed;
          bottom: 92px;
          right: 28px;
          z-index: 9998;
          width: min(380px, calc(100vw - 40px));
          background: #111009;
          border: 1px solid rgba(201,169,110,0.22);
          box-shadow: 0 12px 48px rgba(0,0,0,0.7);
          padding: 24px;
          animation: va-slide-up 0.25s cubic-bezier(0.23,1,0.32,1);
        }
        @keyframes va-slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .va-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .va-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 300;
          color: #f0e6d0;
        }
        .va-close {
          width: 28px; height: 28px;
          background: none;
          border: 1px solid rgba(201,169,110,0.18);
          color: rgba(240,230,208,0.4);
          cursor: pointer;
          font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .va-close:hover { border-color: rgba(201,169,110,0.4); color: #c9a96e; }
        .va-status {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .va-transcript {
          min-height: 48px;
          padding: 12px 14px;
          background: rgba(201,169,110,0.04);
          border: 1px solid rgba(201,169,110,0.12);
          font-size: 14px;
          color: #f0e6d0;
          line-height: 1.5;
          margin-bottom: 14px;
          font-family: 'DM Sans', sans-serif;
        }
        .va-response {
          padding: 12px 14px;
          background: rgba(201,169,110,0.06);
          border-left: 2px solid rgba(201,169,110,0.4);
          font-size: 13px;
          color: rgba(240,230,208,0.75);
          line-height: 1.6;
          font-family: 'DM Sans', sans-serif;
        }
        .va-hint {
          font-size: 10px;
          color: rgba(240,230,208,0.3);
          margin-top: 14px;
          line-height: 1.7;
          font-family: 'DM Mono', monospace;
        }
        .va-listen-btn {
          width: 100%;
          padding: 11px;
          background: listening ? '#c9a96e' : 'rgba(201,169,110,0.08)';
          border: 1px solid rgba(201,169,110,0.3);
          color: #c9a96e;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          margin-top: 16px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.25s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .va-listen-btn:hover { background: rgba(201,169,110,0.15); }
        .va-listen-btn.active { background: rgba(201,169,110,0.18); border-color: #c9a96e; }
        .va-error {
          font-size: 11px;
          color: rgba(220,100,80,0.85);
          margin-top: 10px;
          font-family: 'DM Sans', sans-serif;
        }
        .va-unsupported {
          font-size: 12px;
          color: rgba(240,230,208,0.4);
          text-align: center;
          padding: 16px 0;
          line-height: 1.6;
        }
        .va-spinner {
          width: 14px; height: 14px;
          border: 1px solid rgba(201,169,110,0.3);
          border-top-color: #c9a96e;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) {
          .va-fab { bottom: 20px; right: 16px; }
          .va-panel { bottom: 84px; right: 16px; }
        }
      `}</style>

      {/* Floating mic button */}
      <button
        className={`va-fab${listening ? " listening" : ""}`}
        onClick={() => setOpen((v) => !v)}
        title="Voice Assistant"
        aria-label="Open voice assistant"
      >
        <MicIcon listening={listening} />
      </button>

      {/* Panel */}
      {open && (
        <div className="va-panel" ref={panelRef}>
          <div className="va-header">
            <div className="va-title">Neural Assistant</div>
            <button
              className="va-close"
              onClick={() => { setOpen(false); stopListening(); }}
            >
              ×
            </button>
          </div>

          {!supported ? (
            <div className="va-unsupported">
              Voice recognition requires Chrome or Edge browser.
              <br />
              Please switch browsers to use this feature.
            </div>
          ) : (
            <>
              <div
                className="va-status"
                style={{ color: listening ? "#c9a96e" : "rgba(201,169,110,0.45)" }}
              >
                {listening
                  ? "● Listening…"
                  : loading
                  ? "● Processing…"
                  : "○ Ready"}
              </div>

              {transcript && (
                <div className="va-transcript">
                  <span style={{ color: "rgba(201,169,110,0.5)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    You said
                  </span>
                  {transcript}
                </div>
              )}

              {response && (
                <div className="va-response">
                  <span style={{ color: "rgba(201,169,110,0.5)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    Neural
                  </span>
                  {response}
                </div>
              )}

              {error && <div className="va-error">{error}</div>}

              <button
                className={`va-listen-btn${listening ? " active" : ""}`}
                onClick={listening ? stopListening : startListening}
                disabled={loading}
              >
                {loading ? (
                  <><span className="va-spinner" /> Thinking…</>
                ) : listening ? (
                  <><MicIcon listening={true} /> Stop</>
                ) : (
                  <><MicIcon listening={false} /> Tap to Speak</>
                )}
              </button>

              <div className="va-hint">
                Try: "Show me jackets" · "Add to cart" · "Go to my orders"
                <br />
                "Search for something under ₹2000" · "What's in my cart?"
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

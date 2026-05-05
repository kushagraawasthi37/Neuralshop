import { useState } from "react";
import { useReveal } from "../../hooks/useReveal";

export default function Newsletter() {
  const ref = useReveal();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
    setEmail("");
  };

  return (
    <section
      id="newsletter"
      className="landing-section-sm newsletter-section"
      style={{
        background: "linear-gradient(135deg, #14120f 0%, #0d0c0b 100%)",
        position: "relative",
        overflow: "hidden",
        borderTop: "1px solid rgba(201,169,110,0.08)",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          width: "min(600px, 80vw)",
          height: "min(600px, 80vw)",
          borderRadius: "50%",
          background: "#c9a96e",
          filter: "blur(150px)",
          opacity: 0.04,
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }}
      />

      <div
        ref={ref}
        className="reveal"
        style={{
          maxWidth: 700,
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
          zIndex: 2,
          padding: "0 var(--page-px)",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ width: 30, height: 1, background: "#c9a96e" }} />
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#c9a96e",
            }}
          >
            Stay Rare
          </span>
          <div style={{ width: 30, height: 1, background: "#c9a96e" }} />
        </div>

        {/* Heading */}
        <h2
          className="newsletter-heading"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(28px, 5vw, 56px)",
            fontWeight: 300,
            color: "#f0e6d0",
            marginBottom: 16,
            lineHeight: 1.1,
          }}
        >
          First to know.
          <br />
          <em style={{ fontStyle: "italic", color: "#c9a96e" }}>
            Last to forget.
          </em>
        </h2>

        {/* Sub */}
        <p
          className="newsletter-sub"
          style={{
            fontSize: "clamp(12px, 1.5vw, 14px)",
            color: "rgba(240,230,208,0.4)",
            marginBottom: "clamp(28px, 5vw, 40px)",
            lineHeight: 1.6,
            maxWidth: 520,
            margin: "0 auto clamp(28px, 5vw, 40px)",
          }}
        >
          Join our inner circle for early access to rare drops, curated edits,
          and the occasional note from our neural engine.
        </p>

        {/* Form / Success */}
        {status === "success" ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: "#c9a96e",
              fontSize: 14,
              flexWrap: "wrap",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c9a96e"
              strokeWidth="1.5"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            You're in. Watch for something rare.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="newsletter-form"
            style={{
              display: "flex",
              border: "1px solid rgba(201,169,110,0.2)",
              overflow: "hidden",
              maxWidth: 480,
              margin: "0 auto",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "rgba(201,169,110,0.5)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "rgba(201,169,110,0.2)")
            }
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                flex: 1,
                padding: "16px 20px",
                background: "rgba(255,255,255,0.02)",
                border: "none",
                color: "#f0e6d0",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                outline: "none",
                minWidth: 0 /* prevents overflow */,
                minHeight: "var(--touch-min)",
              }}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                padding: "16px clamp(16px, 3vw, 28px)",
                background: "#c9a96e",
                color: "#0d0c0b",
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                transition: "background 0.3s",
                whiteSpace: "nowrap",
                flexShrink: 0,
                minHeight: "var(--touch-min)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f0e6d0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#c9a96e")
              }
            >
              {status === "loading" ? "…" : "Join"}
            </button>
          </form>
        )}
      </div>

      {/* Responsive: stack form on narrow screens */}
      <style>{`
        @media (max-width: 480px) {
          .newsletter-form {
            flex-direction: column !important;
            max-width: 100% !important;
          }
          .newsletter-form input {
            border-bottom: 1px solid rgba(201,169,110,0.18) !important;
          }
          .newsletter-form button {
            width: 100% !important;
            padding: 15px !important;
          }
        }
      `}</style>
    </section>
  );
}

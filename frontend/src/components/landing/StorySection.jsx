import { Link } from "react-router-dom";
import { useReveal } from "../../hooks/useReveal";

const stats = [
  { num: "2021", label: "Founded" },
  { num: "50K+", label: "Happy Clients" },
  { num: "847", label: "Verified Sellers" },
];

export default function StorySection() {
  const leftRef = useReveal();
  const rightRef = useReveal(0.1);

  return (
    <section
      id="story"
      className="landing-section-xl"
      style={{
        position: "relative",
        background: "linear-gradient(to bottom, #0d0c0b 0%, #0f0e0c 100%)",
        overflow: "hidden",
      }}
    >
      <div className="story-two-col">
        {/* ── Visual: framed stats ── */}
        <div ref={leftRef} className="reveal story-visual">
          {/* Border frame */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "1px solid rgba(201,169,110,0.1)",
            }}
          >
            {/* Corner accents — sized with CSS classes for responsive control */}
            <div
              className="story-corner-tl"
              style={{
                position: "absolute",
                top: -20,
                left: -20,
                width: 60,
                height: 60,
                borderTop: "1px solid #c9a96e",
                borderLeft: "1px solid #c9a96e",
              }}
            />
            <div
              className="story-corner-br"
              style={{
                position: "absolute",
                bottom: -20,
                right: -20,
                width: 60,
                height: 60,
                borderBottom: "1px solid #c9a96e",
                borderRight: "1px solid #c9a96e",
              }}
            />
          </div>

          {/* Stats */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 0,
              padding: "clamp(20px, 4vw, 40px)",
            }}
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="story-stat-pad"
                style={{
                  textAlign: "center",
                  width: "100%",
                  padding: "clamp(14px, 2.5vw, 24px) 0",
                  borderBottom:
                    i < stats.length - 1
                      ? "1px solid rgba(201,169,110,0.08)"
                      : "none",
                }}
              >
                <div
                  className="story-stat-number"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(32px, 5vw, 52px)",
                    fontWeight: 300,
                    color: "#c9a96e",
                    lineHeight: 1,
                  }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(240,230,208,0.35)",
                    marginTop: 8,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Text ── */}
        <div ref={rightRef} className="reveal">
          {/* Eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 30,
                height: 1,
                background: "#c9a96e",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#c9a96e",
              }}
            >
              Our Story
            </span>
          </div>

          {/* Heading */}
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(28px, 4vw, 56px)",
              fontWeight: 300,
              lineHeight: 1.1,
              color: "#f0e6d0",
              marginBottom: 28,
            }}
          >
            Where taste
            <br />
            meets{" "}
            <em style={{ fontStyle: "italic", color: "#c9a96e" }}>
              intelligence
            </em>
          </h2>

          {/* Body */}
          <p
            style={{
              fontSize: "clamp(13px, 1.5vw, 15px)",
              lineHeight: 1.8,
              color: "rgba(240,230,208,0.5)",
              fontWeight: 300,
              marginBottom: 20,
            }}
          >
            NeuralShop was born from a simple belief: that commerce should be as
            refined as the objects it carries. We built an AI-powered curation
            engine that scours thousands of sellers to surface only what
            deserves your attention.
          </p>
          <p
            style={{
              fontSize: "clamp(13px, 1.5vw, 15px)",
              lineHeight: 1.8,
              color: "rgba(240,230,208,0.5)",
              fontWeight: 300,
              marginBottom: "clamp(28px, 4vw, 40px)",
            }}
          >
            Every product listed has passed through our neural verification
            layer — verified for authenticity, quality, and that ineffable
            quality that separates the merely good from the genuinely rare.
          </p>

          <Link to="/about" className="btn-gold-flip">
            <span>Discover Our Vision</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

import { useNavigate } from "react-router-dom";

const PILLARS = [
  {
    icon: "◈",
    title: "Neural Curation",
    body: "Every product in our catalogue is evaluated by machine-learning models trained on luxury market data, historical resale performance, and craft heritage — then validated by human connoisseurs.",
  },
  {
    icon: "◇",
    title: "Verified Authenticity",
    body: "Each piece undergoes a multi-layer provenance check before it is listed. We cross-reference serial numbers, maker signatures, and supply-chain records to guarantee what you receive is genuine.",
  },
  {
    icon: "◉",
    title: "Elevated Experience",
    body: "From the moment you browse to the instant your order arrives, every touchpoint is designed to feel unhurried, precise, and worthy of what you're acquiring.",
  },
  {
    icon: "◊",
    title: "Responsible Luxury",
    body: "We work exclusively with brands that meet our standards for environmental stewardship and ethical production — because true luxury leaves a legacy worth having.",
  },
];

const STATS = [
  { num: "4,200+", label: "Curated Pieces" },
  { num: "98%", label: "Authenticity Rate" },
  { num: "60+", label: "Heritage Brands" },
  { num: "12", label: "Countries Served" },
];

const TEAM = [
  { initials: "KA", name: "Kushagra Awasthi", role: "Founder & Chief Curator" },
  { initials: "SS", name: "Shivanshu Sharma", role: "Head of AI & Curation" },
  { initials: "AV", name: "Avneesh", role: "Luxury Partnerships" },
  { initials: "AR", name: "Aditya", role: "Tech Head" },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80, background: "#0d0c0b" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .about-fade { animation: fadeUp 0.9s cubic-bezier(0.23,1,0.32,1) both; }
        .about-pillar-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
        }
        .about-team-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
        }
        .about-mission-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(32px, 6vw, 80px);
          align-items: center;
        }
        @media (max-width: 1023px) {
          .about-pillar-grid { grid-template-columns: repeat(2, 1fr); }
          .about-team-grid   { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) and (max-width: 1440px) {
          .about-section-padded {
            padding-left: clamp(24px, 3vw, 48px) !important;
            padding-right: clamp(24px, 3vw, 48px) !important;
          }
        }
        @media (max-width: 639px) {
          .about-pillar-grid  { grid-template-columns: 1fr; }
          .about-team-grid    { grid-template-columns: repeat(2, 1fr); }
          .about-mission-grid { grid-template-columns: 1fr; }
          .about-cta-btns     { flex-direction: column; }
          .about-cta-btns button { width: 100% !important; }
        }
      `}</style>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          padding:
            "clamp(36px,6vw,80px) min(24px, var(--page-px)) clamp(32px,5vw,64px)",
          borderBottom: "1px solid rgba(201,169,110,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(201,169,110,0.055) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div
            className="about-fade"
            style={{
              fontSize: 9,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "#c9a96e",
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                width: 36,
                height: 1,
                background: "linear-gradient(to right, transparent, #c9a96e)",
                display: "inline-block",
              }}
            />
            Our Story
            <span
              style={{
                width: 36,
                height: 1,
                background: "linear-gradient(to left, transparent, #c9a96e)",
                display: "inline-block",
              }}
            />
          </div>
          <h1
            className="about-fade"
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(36px,6.5vw,88px)",
              fontWeight: 300,
              color: "#f0e6d0",
              lineHeight: 1.06,
              marginBottom: 24,
              animationDelay: "0.1s",
            }}
          >
            Where Machine Intelligence
            <br />
            Meets{" "}
            <em style={{ fontStyle: "italic", color: "#c9a96e" }}>
              Human Desire
            </em>
          </h1>
          <p
            className="about-fade"
            style={{
              fontSize: "clamp(13px,2vw,15px)",
              color: "rgba(240,230,208,0.5)",
              maxWidth: 620,
              lineHeight: 1.8,
              animationDelay: "0.2s",
            }}
          >
            NeuralShop was born from a simple conviction: the finest objects in
            the world deserve to be discovered with the same precision and care
            with which they were made. We built the infrastructure for that
            discovery.
          </p>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section
        style={{
          padding: "clamp(28px,5vw,64px) min(24px, var(--page-px))",
          borderBottom: "1px solid rgba(201,169,110,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 2,
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={i}
              style={{
                padding: "clamp(24px,4vw,36px) clamp(16px,3vw,28px)",
                background: "rgba(201,169,110,0.025)",
                border: "1px solid rgba(201,169,110,0.1)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "clamp(36px,5vw,48px)",
                  fontWeight: 300,
                  color: "#c9a96e",
                  lineHeight: 1,
                  marginBottom: 10,
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(240,230,208,0.38)",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission ────────────────────────────────────────────── */}
      <section
        className="about-section-padded"
        style={{
          padding: "clamp(40px,6vw,96px) var(--page-px)",
          borderBottom: "1px solid rgba(201,169,110,0.08)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="about-mission-grid">
            <div>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "rgba(201,169,110,0.55)",
                  marginBottom: 16,
                }}
              >
                The Mission
              </div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "clamp(26px,3.5vw,48px)",
                  fontWeight: 300,
                  color: "#f0e6d0",
                  lineHeight: 1.15,
                  marginBottom: 24,
                }}
              >
                A marketplace{" "}
                <em style={{ fontStyle: "italic", color: "#c9a96e" }}>
                  without compromise
                </em>
              </h2>
              <p
                style={{
                  fontSize: "clamp(12px,1.5vw,14px)",
                  color: "rgba(240,230,208,0.45)",
                  lineHeight: 1.85,
                  marginBottom: 20,
                }}
              >
                We set out to solve the oldest problem in luxury commerce: the
                gap between what a brand promises and what a buyer receives. By
                embedding AI at every stage — from product sourcing to delivery
                routing — we collapse that gap to near zero.
              </p>
              <p
                style={{
                  fontSize: "clamp(12px,1.5vw,14px)",
                  color: "rgba(240,230,208,0.45)",
                  lineHeight: 1.85,
                }}
              >
                Our technology stack learns continuously. As tastes evolve and
                new makers emerge, NeuralShop surfaces them first — giving our
                community a perpetual edge over the conventional market.
              </p>
            </div>

            {/* Visual panel — hidden on mobile via grid collapse */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4/5",
                  background:
                    "linear-gradient(135deg, rgba(201,169,110,0.04) 0%, rgba(201,169,110,0.01) 100%)",
                  border: "1px solid rgba(201,169,110,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: "clamp(80px,14vw,160px)",
                    fontWeight: 300,
                    color: "rgba(201,169,110,0.06)",
                    userSelect: "none",
                    lineHeight: 1,
                  }}
                >
                  N
                </div>
                {/* Corner accents */}
                {[
                  [0, 0],
                  [0, "auto"],
                  ["auto", 0],
                  ["auto", "auto"],
                ].map(([t, b, l, r], i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      top: i < 2 ? 12 : "auto",
                      bottom: i >= 2 ? 12 : "auto",
                      left: i % 2 === 0 ? 12 : "auto",
                      right: i % 2 !== 0 ? 12 : "auto",
                      width: 20,
                      height: 20,
                      borderTop:
                        i < 2 ? "1px solid rgba(201,169,110,0.3)" : "none",
                      borderBottom:
                        i >= 2 ? "1px solid rgba(201,169,110,0.3)" : "none",
                      borderLeft:
                        i % 2 === 0
                          ? "1px solid rgba(201,169,110,0.3)"
                          : "none",
                      borderRight:
                        i % 2 !== 0
                          ? "1px solid rgba(201,169,110,0.3)"
                          : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pillars ────────────────────────────────────────────── */}
      <section
        className="about-section-padded"
        style={{
          padding: "clamp(40px,6vw,96px) var(--page-px)",
          borderBottom: "1px solid rgba(201,169,110,0.08)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "clamp(36px,5vw,64px)",
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(201,169,110,0.55)",
                marginBottom: 14,
              }}
            >
              Our Principles
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(26px,3vw,44px)",
                fontWeight: 300,
                color: "#f0e6d0",
              }}
            >
              The four{" "}
              <em style={{ fontStyle: "italic", color: "#c9a96e" }}>pillars</em>
            </h2>
          </div>

          <div className="about-pillar-grid">
            {PILLARS.map((p, i) => (
              <div
                key={i}
                style={{
                  padding: "clamp(24px,4vw,40px) clamp(20px,3vw,32px)",
                  background: "rgba(201,169,110,0.02)",
                  border: "1px solid rgba(201,169,110,0.1)",
                  transition: "border-color 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(201,169,110,0.28)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(201,169,110,0.1)")
                }
              >
                <div
                  style={{
                    fontSize: "clamp(20px,3vw,26px)",
                    color: "#c9a96e",
                    marginBottom: 16,
                    lineHeight: 1,
                  }}
                >
                  {p.icon}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#f0e6d0",
                    letterSpacing: "0.06em",
                    marginBottom: 14,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {p.title}
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(240,230,208,0.42)",
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ───────────────────────────────────────────────── */}
      <section
        className="about-section-padded"
        style={{
          padding: "clamp(40px,6vw,96px) var(--page-px)",
          borderBottom: "1px solid rgba(201,169,110,0.08)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "clamp(36px,5vw,64px)",
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(201,169,110,0.55)",
                marginBottom: 14,
              }}
            >
              The People Behind It
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(26px,3vw,44px)",
                fontWeight: 300,
                color: "#f0e6d0",
              }}
            >
              Built by{" "}
              <em style={{ fontStyle: "italic", color: "#c9a96e" }}>
                Obsessives
              </em>
            </h2>
          </div>

          <div className="about-team-grid">
            {TEAM.map((m, i) => (
              <div
                key={i}
                style={{
                  padding: "clamp(28px,5vw,40px) clamp(16px,3vw,32px)",
                  background: "rgba(201,169,110,0.025)",
                  border: "1px solid rgba(201,169,110,0.1)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "clamp(56px,12vw,72px)",
                    height: "clamp(56px,12vw,72px)",
                    borderRadius: "50%",
                    background: "rgba(201,169,110,0.08)",
                    border: "1px solid rgba(201,169,110,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: "clamp(18px,3vw,24px)",
                    fontWeight: 300,
                    color: "#c9a96e",
                  }}
                >
                  {m.initials}
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: "clamp(16px,2vw,20px)",
                    fontWeight: 300,
                    color: "#f0e6d0",
                    marginBottom: 8,
                  }}
                >
                  {m.name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(201,169,110,0.5)",
                  }}
                >
                  {m.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section style={{ padding: "clamp(48px,6vw,96px) var(--page-px)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(201,169,110,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                width: 32,
                height: 1,
                background: "rgba(201,169,110,0.35)",
                display: "inline-block",
              }}
            />
            Begin Your Journey
            <span
              style={{
                width: 32,
                height: 1,
                background: "rgba(201,169,110,0.35)",
                display: "inline-block",
              }}
            />
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(26px,4vw,52px)",
              fontWeight: 300,
              color: "#f0e6d0",
              lineHeight: 1.12,
              marginBottom: 20,
            }}
          >
            Discover objects worthy of{" "}
            <em style={{ fontStyle: "italic", color: "#c9a96e" }}>
              your attention
            </em>
          </h2>
          <p
            style={{
              fontSize: "clamp(12px,2vw,13px)",
              color: "rgba(240,230,208,0.4)",
              lineHeight: 1.75,
              marginBottom: 36,
              padding: "0 clamp(0px,4vw,20px)",
            }}
          >
            Every piece in our collection has been held to a standard most
            marketplaces don't attempt. Step inside and see what that difference
            looks like.
          </p>
          <div
            className="about-cta-btns"
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigate("/collections")}
              style={{
                padding: "clamp(13px,2vw,16px) clamp(24px,5vw,40px)",
                background: "#c9a96e",
                border: "none",
                color: "#0d0c0b",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                transition: "background 0.3s",
                minHeight: 44,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#b8954a")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#c9a96e")
              }
            >
              Explore the Collection
            </button>
            <button
              onClick={() => navigate("/search")}
              style={{
                padding: "clamp(13px,2vw,16px) clamp(24px,5vw,40px)",
                background: "none",
                border: "1px solid rgba(201,169,110,0.35)",
                color: "#c9a96e",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                transition: "border-color 0.3s",
                minHeight: 44,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#c9a96e")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(201,169,110,0.35)")
              }
            >
              Search Products
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

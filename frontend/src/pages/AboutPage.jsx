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
  { initials: "AK", name: "Kushagra Awasthi", role: "Founder & Chief Curator" },
  { initials: "MS", name: "Shivanshu Sharma", role: "Head of AI & Curation" },
  { initials: "RV", name: "Avneesh ", role: "Luxury Partnerships" },
  { initials: "RV", name: "Aditya", role: "Tech Head" },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80, background: "#0d0c0b" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .about-fade { animation: fadeUp 0.9s cubic-bezier(0.23,1,0.32,1) both; }
      `}</style>

      {/* Hero */}
      <section
        style={{
          position: "relative",
          padding: "100px 52px 96px",
          borderBottom: "1px solid rgba(201,169,110,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(201,169,110,0.055) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative" }}>
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
              marginBottom: 22,
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
              fontSize: "clamp(44px,6.5vw,88px)",
              fontWeight: 300,
              color: "#f0e6d0",
              lineHeight: 1.04,
              marginBottom: 28,
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
              fontSize: 15,
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

      {/* Stats */}
      <section
        style={{
          padding: "72px 52px",
          borderBottom: "1px solid rgba(201,169,110,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 2,
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={i}
              style={{
                padding: "36px 28px",
                background: "rgba(201,169,110,0.025)",
                border: "1px solid rgba(201,169,110,0.1)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 48,
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

      {/* Mission */}
      <section
        style={{
          padding: "96px 52px",
          borderBottom: "1px solid rgba(201,169,110,0.08)",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "center",
            }}
          >
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
                  fontSize: "clamp(30px,3.5vw,48px)",
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
                  fontSize: 14,
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
                  fontSize: 14,
                  color: "rgba(240,230,208,0.45)",
                  lineHeight: 1.85,
                }}
              >
                Our models don't just match price to product. They understand
                provenance, rarity, and the subtle signals that separate a
                timeless investment from a trend.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                "Sourced from verified partners only",
                "AI-scored quality assessment on every listing",
                "Real-time pricing benchmarked against 14 global markets",
                "White-glove delivery with live tracking",
              ].map((pt, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    padding: "20px 24px",
                    background: "rgba(201,169,110,0.025)",
                    border: "1px solid rgba(201,169,110,0.1)",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      background: "#c9a96e",
                      borderRadius: "50%",
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      color: "rgba(240,230,208,0.55)",
                      lineHeight: 1.6,
                    }}
                  >
                    {pt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section
        style={{
          padding: "96px 52px",
          borderBottom: "1px solid rgba(201,169,110,0.08)",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(201,169,110,0.55)",
                marginBottom: 14,
              }}
            >
              What We Stand For
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(28px,3vw,44px)",
                fontWeight: 300,
                color: "#f0e6d0",
              }}
            >
              Four{" "}
              <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Pillars</em>{" "}
              of NeuralShop
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 2,
            }}
          >
            {PILLARS.map((p, i) => (
              <div
                key={i}
                style={{
                  padding: "40px 32px",
                  background: "rgba(201,169,110,0.025)",
                  border: "1px solid rgba(201,169,110,0.1)",
                  transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(201,169,110,0.28)";
                  e.currentTarget.style.background = "rgba(201,169,110,0.045)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(201,169,110,0.1)";
                  e.currentTarget.style.background = "rgba(201,169,110,0.025)";
                }}
              >
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 28,
                    color: "#c9a96e",
                    marginBottom: 18,
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

      {/* Team */}
      <section
        style={{
          padding: "96px 52px",
          borderBottom: "1px solid rgba(201,169,110,0.08)",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
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
                fontSize: "clamp(28px,3vw,44px)",
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 2,
            }}
          >
            {TEAM.map((m, i) => (
              <div
                key={i}
                style={{
                  padding: "40px 32px",
                  background: "rgba(201,169,110,0.025)",
                  border: "1px solid rgba(201,169,110,0.1)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "rgba(201,169,110,0.08)",
                    border: "1px solid rgba(201,169,110,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 24,
                    fontWeight: 300,
                    color: "#c9a96e",
                  }}
                >
                  {m.initials}
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 20,
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

      {/* CTA */}
      <section style={{ padding: "96px 52px" }}>
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
              fontSize: "clamp(30px,4vw,52px)",
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
              fontSize: 13,
              color: "rgba(240,230,208,0.4)",
              lineHeight: 1.75,
              marginBottom: 40,
            }}
          >
            Every piece in our collection has been held to a standard most
            marketplaces don't attempt. Step inside and see what that difference
            looks like.
          </p>
          <div
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
                padding: "16px 40px",
                background: "#c9a96e",
                border: "none",
                color: "#0d0c0b",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#b8954a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#c9a96e";
              }}
            >
              Explore the Collection
            </button>
            <button
              onClick={() => navigate("/search")}
              style={{
                padding: "16px 40px",
                background: "none",
                border: "1px solid rgba(201,169,110,0.35)",
                color: "#c9a96e",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#c9a96e";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,169,110,0.35)";
              }}
            >
              Search Products
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

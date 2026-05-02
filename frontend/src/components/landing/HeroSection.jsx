import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function CountUp({ target, suffix = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const end = parseInt(target);
    const duration = 2000;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      if (ref.current)
        ref.current.textContent = Math.floor(start).toLocaleString() + suffix;
    }, 16);
    return () => clearInterval(timer);
  }, [target, suffix]);
  return <span ref={ref}>0</span>;
}

export default function HeroSection() {
  const stageRef = useRef(null);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!stageRef.current) return;
      const rx = (e.clientY / window.innerHeight - 0.5) * -20;
      const ry = (e.clientX / window.innerWidth - 0.5) * 20;
      stageRef.current.style.transform = `rotateX(${8 + rx * 0.3}deg) rotateY(${-8 + ry * 0.3}deg)`;
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "#0d0c0b",
      }}
    >
      {/* Ambient glows */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "#c9a96e",
            filter: "blur(120px)",
            opacity: 0.12,
            top: -200,
            right: -100,
            animation: "floatGlow 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "#4a5c47",
            filter: "blur(120px)",
            opacity: 0.08,
            bottom: -300,
            left: -200,
            animation: "floatGlow 10s ease-in-out infinite reverse",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "#8b6340",
            filter: "blur(80px)",
            opacity: 0.06,
            top: "30%",
            left: "20%",
            animation: "floatGlow 12s ease-in-out infinite 2s",
          }}
        />
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(201,169,110,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.04) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            animation: "gridDrift 20s linear infinite",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1400,
          margin: "0 auto",
          padding: "clamp(60px,7vw,100px) var(--page-px) 0",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,340px),1fr))",
          alignItems: "center",
          gap: "clamp(32px,5vw,80px)",
        }}
      >
        {/* Left: Copy */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 32,
              opacity: 0,
              animation: "fadeUp 1s ease 0.3s forwards",
            }}
          >
            <div style={{ width: 40, height: 1, background: "#c9a96e" }} />
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#c9a96e",
                fontWeight: 400,
              }}
            >
              AI-Curated Commerce · 2026 Collection
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(52px, 6vw, 88px)",
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              color: "#f0e6d0",
              opacity: 0,
              animation: "fadeUp 1.1s ease 0.5s forwards",
            }}
          >
            <span style={{ display: "block" }}>Objects of</span>
            <span style={{ display: "block", position: "relative" }}>
              <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Rare</em>{" "}
              Desire
            </span>
            <span style={{ display: "block" }}>Redefined</span>
          </h1>

          <p
            style={{
              marginTop: 28,
              fontSize: 15,
              lineHeight: 1.7,
              color: "rgba(240,230,208,0.5)",
              fontWeight: 300,
              maxWidth: 440,
              opacity: 0,
              animation: "fadeUp 1s ease 0.8s forwards",
            }}
          >
            Where neural intelligence meets human taste. A curated ecosystem of
            products discovered, verified, and elevated by machine intuition —
            refined by yours.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(16px,3vw,28px)",
              marginTop: "clamp(28px,4vw,52px)",
              opacity: 0,
              animation: "fadeUp 1s ease 1s forwards",
              flexWrap: "wrap",
            }}
          >
            <Link to="/collections" className="btn-primary-hero">
              <span>Explore Collection</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ position: "relative", zIndex: 1 }}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/about" className="btn-ghost-hero">
              Watch Story
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="10,8 16,12 10,16" />
              </svg>
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              gap: "clamp(20px,4vw,40px)",
              marginTop: "clamp(32px,5vw,64px)",
              paddingTop: "clamp(20px,3vw,40px)",
              borderTop: "1px solid rgba(201,169,110,0.12)",
              opacity: 0,
              animation: "fadeUp 1s ease 1.2s forwards",
              flexWrap: "wrap",
            }}
          >
            {[
              { target: "12400", label: "Curated Items" },
              { target: "847", label: "Verified Sellers" },
              { target: "99", label: "% Satisfaction", suffix: "%" },
            ].map(({ target, label, suffix }) => (
              <div key={label}>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(24px,3vw,36px)",
                    fontWeight: 300,
                    color: "#c9a96e",
                    lineHeight: 1,
                  }}
                >
                  <CountUp target={target} suffix={suffix || ""} />
                </div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(240,230,208,0.4)",
                    marginTop: 6,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 3D Product Stage — hidden on mobile via .hero-visual-wrap */}
        <div
          className="hero-visual-wrap"
          style={{
            position: "relative",
            height: "clamp(420px, 50vw, 600px)",
            opacity: 0,
            animation: "fadeIn 1.4s ease 0.6s forwards",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 58,
              right: 60,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#c9a96e",
              boxShadow: "0 0 24px rgba(201,169,110,0.8)",
              animation: "dotRise 4.4s linear infinite",
              zIndex: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 180,
              right: 110,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#c9a96e",
              boxShadow: "0 0 18px rgba(201,169,110,0.7)",
              animation: "dotRise 5.2s linear infinite",
              animationDelay: "0.6s",
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 260,
              right: 30,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#c9a96e",
              boxShadow: "0 0 14px rgba(201,169,110,0.6)",
              animation: "dotRise 4.8s linear infinite",
              animationDelay: "1.2s",
              zIndex: 1,
            }}
          />

          <div
            ref={stageRef}
            style={{
              position: "relative",
              width: "min(420px, 90%)",
              height: "min(420px, 90vw)",
              transformStyle: "preserve-3d",
              animation: "stageFloat 6s ease-in-out infinite",
              transition: "transform 0.3s ease",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%) rotateX(75deg)",
                width: 340,
                height: 340,
                background:
                  "radial-gradient(ellipse at center, rgba(201,169,110,0.15) 0%, transparent 70%)",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: 320,
                height: 8,
                background:
                  "radial-gradient(ellipse, rgba(201,169,110,0.2) 0%, transparent 70%)",
                borderRadius: "50%",
                filter: "blur(4px)",
              }}
            />

            {/* Side card left */}
            <ProductCard3D
              style={{
                width: 160,
                height: 200,
                top: "50%",
                left: 0,
                transform: "translate(-60px, -50%) rotate(-8deg) scale(0.9)",
                opacity: 0.7,
              }}
              small
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 12,
                  color: "#f0e6d0",
                  marginBottom: 4,
                }}
              >
                Phantom Watch
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 14,
                  color: "#c9a96e",
                }}
              >
                ₹48,000
              </div>
            </ProductCard3D>

            {/* Main card */}
            <ProductCard3D
              style={{
                width: 240,
                height: 300,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              badge="Neural Pick"
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 16,
                  color: "#f0e6d0",
                  marginBottom: 4,
                }}
              >
                Aeon Vessel
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(240,230,208,0.4)",
                  letterSpacing: "0.08em",
                  marginBottom: 12,
                }}
              >
                Limited Edition · S/S 2026
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 18,
                    color: "#f0e6d0",
                  }}
                >
                  ₹1,24,000
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(201,169,110,0.5)",
                    letterSpacing: "0.1em",
                  }}
                >
                  ★★★★★
                </div>
              </div>
            </ProductCard3D>

            {/* Side card right */}
            <ProductCard3D
              style={{
                width: 140,
                height: 180,
                top: "50%",
                right: 0,
                transform: "translate(60px, -30%) rotate(8deg) scale(0.85)",
                opacity: 0.6,
              }}
              small
              dark
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 12,
                  color: "#f0e6d0",
                  marginBottom: 4,
                }}
              >
                Moss Scent
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 14,
                  color: "#c9a96e",
                }}
              >
                ₹6,800
              </div>
            </ProductCard3D>
          </div>

          <div
            style={{
              position: "absolute",
              top: 30,
              right: -20,
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontSize: 10,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(201,169,110,0.3)",
            }}
          >
            Featured Collection
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="hero-scroll-hint"
        style={{
          position: "absolute",
          bottom: 40,
          left: "var(--page-px)",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: 0,
          animation: "fadeIn 1s ease 2s forwards",
        }}
      >
        <div
          style={{
            width: 1,
            height: 60,
            background: "rgba(201,169,110,0.3)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 30,
              background: "#c9a96e",
              animation: "scrollDown 2s ease-in-out infinite",
            }}
          />
        </div>
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(201,169,110,0.5)",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
          }}
        >
          Scroll to discover
        </span>
      </div>

      <style>{`
        @keyframes floatGlow {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-20px) scale(1.05); }
          66% { transform: translate(-20px,30px) scale(0.95); }
        }
        @keyframes gridDrift {
          0% { transform: translateY(0); }
          100% { transform: translateY(80px); }
        }
        @keyframes stageFloat {
          0%, 100% { transform: rotateX(8deg) rotateY(-8deg) translateY(0); }
          50% { transform: rotateX(4deg) rotateY(4deg) translateY(-16px); }
        }
        @keyframes dotRise {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateY(-120px); opacity: 1; }
          100% { transform: translateY(-240px); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scrollDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }
        .btn-primary-hero {
          display: inline-flex; align-items: center; gap: 12px;
          padding: 16px 36px; background: #c9a96e;
          color: #0d0c0b; font-size: 12px; letter-spacing: 0.14em;
          text-transform: uppercase; font-weight: 500;
          border: none; cursor: pointer; position: relative; overflow: hidden;
          transition: all 0.4s ease; text-decoration: none;
        }
        .btn-primary-hero::before {
          content: ''; position: absolute; inset: 0;
          background: #f0e6d0; transform: scaleX(0); transform-origin: right;
          transition: transform 0.4s ease;
        }
        .btn-primary-hero:hover::before { transform: scaleX(1); transform-origin: left; }
        .btn-primary-hero span, .btn-primary-hero svg { position: relative; z-index: 1; }
        .btn-ghost-hero {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 0; color: rgba(240,230,208,0.6); font-size: 12px;
          letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer;
          text-decoration: none; border-bottom: 1px solid rgba(201,169,110,0.2);
          transition: all 0.3s; background: none;
        }
        .btn-ghost-hero:hover { color: #c9a96e; border-color: #c9a96e; }
        .product-card-3d {
          position: absolute;
          background: linear-gradient(135deg, rgba(37,35,32,0.95) 0%, rgba(26,25,22,0.95) 100%);
          border: 1px solid rgba(201,169,110,0.15);
          border-radius: 2px;
          padding: 24px;
          transform-style: preserve-3d;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: pointer;
          backdrop-filter: blur(20px);
          overflow: hidden;
        }
        .product-card-3d::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(201,169,110,0.06) 0%, transparent 50%);
          pointer-events: none;
        }
        .product-card-3d.dark {
          background: linear-gradient(135deg, rgba(13,12,11,0.95) 0%, rgba(20,18,15,0.95) 100%);
          border-color: rgba(255,255,255,0.08);
        }
        .product-card-3d:hover {
          border-color: rgba(201,169,110,0.4);
          transform: translateY(-8px) scale(1.02) !important;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 40px rgba(201,169,110,0.08);
        }
        .card-img-placeholder {
          width: 100%;
          background: linear-gradient(135deg, rgba(201,169,110,0.1) 0%, rgba(74,92,71,0.1) 100%);
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          margin-bottom: 16px;
        }
        .card-img-placeholder::after {
          content: '';
          position: absolute; top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: linear-gradient(45deg, transparent 30%, rgba(201,169,110,0.08) 50%, transparent 70%);
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(50%); }
        }
      `}</style>
    </section>
  );
}

function ProductCard3D({ children, style, badge, small, dark }) {
  const imgH = small ? 80 : 150;
  return (
    <div
      className={`product-card-3d${dark ? " dark" : ""}`}
      style={{
        position: "absolute",
        background: dark
          ? "linear-gradient(135deg, rgba(13,12,11,0.95) 0%, rgba(20,18,15,0.95) 100%)"
          : "linear-gradient(135deg, rgba(37,35,32,0.95) 0%, rgba(26,25,22,0.95) 100%)",
        border: dark
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(201,169,110,0.15)",
        padding: 24,
        transformStyle: "preserve-3d",
        backdropFilter: "blur(20px)",
        overflow: "hidden",
        transition: "all 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
        cursor: "pointer",
        ...style,
      }}
    >
      {badge && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "#c9a96e",
            color: "#0d0c0b",
            fontSize: 9,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "4px 8px",
            fontWeight: 500,
          }}
        >
          {badge}
        </div>
      )}
      <div
        className="card-img-placeholder"
        style={{
          height: imgH,
          border: dark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(201,169,110,0.08)",
        }}
      >
        <svg
          viewBox="0 0 80 80"
          fill="none"
          stroke="#c9a96e"
          strokeWidth="1"
          width={small ? 40 : 60}
          height={small ? 40 : 60}
          opacity={0.4}
        >
          <path d="M40 10 L65 25 L65 55 L40 70 L15 55 L15 25 Z" />
          <path d="M40 10 L40 70M15 25 L65 55M65 25 L15 55" />
          <circle cx="40" cy="40" r="8" fill="rgba(201,169,110,0.1)" />
        </svg>
      </div>
      {children}
    </div>
  );
}

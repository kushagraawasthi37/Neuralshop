import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "../../api/products";
import { getSessionId } from "../../hooks/useBehaviorTracker";

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
  const navigate = useNavigate();

  const { data: heroProducts = [] } = useQuery({
    queryKey: ["hero-picks"],
    queryFn: () =>
      productApi
        .personalized(getSessionId())
        .then((r) => (r.data.data || []).slice(0, 3)),
    staleTime: 0,
    retry: 0,
  });

  const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
  const [p0, p1, p2] = heroProducts;

  // 3D tilt — only on pointer devices
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;
    const onMouseMove = (e) => {
      if (!stageRef.current) return;
      const rx = (e.clientY / window.innerHeight - 0.5) * -12;
      const ry = (e.clientX / window.innerWidth - 0.5) * 12;
      stageRef.current.style.transform = `rotateX(${8 + rx}deg) rotateY(${-8 + ry}deg) translateY(0)`;
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  // Particles
  useEffect(() => {
    const container = document.getElementById("particles-container");
    if (!container) return;
    container.innerHTML = "";
    // Fewer particles on mobile for performance
    const count = window.innerWidth < 640 ? 15 : 35;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      const size = Math.random() * 2 + 0.5;
      p.className = "particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.bottom = "-10px";
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.animationDuration = 6 + Math.random() * 10 + "s";
      p.style.animationDelay = Math.random() * 5 + "s";
      container.appendChild(p);
    }
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
      <div
        id="particles-container"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      />

      {/* Ambient glows */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            width: "min(700px, 90vw)",
            height: "min(700px, 90vw)",
            borderRadius: "50%",
            background: "#c9a96e",
            filter: "blur(120px)",
            opacity: 0.18,
            top: -200,
            right: -100,
            animation: "floatGlow 10s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "min(700px, 90vw)",
            height: "min(700px, 90vw)",
            borderRadius: "50%",
            background: "#4a5c47",
            filter: "blur(120px)",
            opacity: 0.12,
            bottom: -300,
            left: -200,
            animation: "floatGlow 12s ease-in-out infinite reverse",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "min(400px, 60vw)",
            height: "min(400px, 60vw)",
            borderRadius: "50%",
            background: "#8b6340",
            filter: "blur(80px)",
            opacity: 0.1,
            top: "30%",
            left: "20%",
            animation: "floatGlow 14s ease-in-out infinite 2s",
          }}
        />
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(201,169,110,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.05) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            animation: "gridDrift 20s linear infinite",
          }}
        />
      </div>

      {/* Noise */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

      {/* Content grid */}
      <div
        className="hero-content-grid"
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1400,
          margin: "0 auto",
          padding: "clamp(80px,10vw,120px) var(--page-px) clamp(48px,6vw,80px)",
          width: "100%",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          alignItems: "center",
          gap: "clamp(32px, 5vw, 80px)",
        }}
      >
        {/* ── LEFT: Copy ── */}
        <div>
          {/* Eyebrow */}
          <div
            className="hero-eyebrow-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 32,
              opacity: 0,
              animation: "fadeUp 1s ease 0.3s forwards",
            }}
          >
            <div
              style={{
                width: 40,
                height: 1,
                background: "#c9a96e",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#c9a96e",
                fontWeight: 400,
                lineHeight: 1.4,
              }}
            >
              AI-Curated Commerce · 2026 Collection
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(44px, 6vw, 88px)",
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              color: "#f0e6d0",
              opacity: 0,
              animation: "fadeUp 1.1s ease 0.5s forwards",
            }}
          >
            <span style={{ display: "block" }}>Objects of</span>
            <span
              className="hero-line-accent"
              style={{ display: "block", position: "relative" }}
            >
              <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Rare</em>{" "}
              Desire
            </span>
            <span style={{ display: "block" }}>Redefined</span>
          </h1>

          {/* Sub */}
          <p
            style={{
              marginTop: 28,
              fontSize: "clamp(13px, 1.5vw, 15px)",
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

          {/* CTAs */}
          <div
            className="hero-cta-row"
            style={{ opacity: 0, animation: "fadeUp 1s ease 1s forwards" }}
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

          {/* Stats */}
          <div
            className="hero-stats-row"
            style={{ opacity: 0, animation: "fadeUp 1s ease 1.2s forwards" }}
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
                    fontSize: "clamp(22px, 3vw, 36px)",
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

        {/* ── RIGHT: 3D Stage — hidden on mobile via .hero-visual-wrap ── */}
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
            {/* Shadow disc */}
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
              imgSrc={p0?.images?.[0]}
              onClick={() => p0 && navigate(`/product/${p0._id || p0.id}`)}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 12,
                  color: "#f0e6d0",
                  marginBottom: 4,
                }}
              >
                {p0?.name || "Phantom Watch"}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 14,
                  color: "#c9a96e",
                }}
              >
                {p0 ? fmt(p0.price) : "₹48,000"}
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
              imgSrc={p1?.images?.[0]}
              onClick={() => p1 && navigate(`/product/${p1._id || p1.id}`)}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 16,
                  color: "#f0e6d0",
                  marginBottom: 4,
                }}
              >
                {p1?.name || "Aeon Vessel"}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(240,230,208,0.4)",
                  letterSpacing: "0.08em",
                  marginBottom: 12,
                }}
              >
                {p1?.category || "Limited Edition"} · S/S 2026
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
                  {p1 ? fmt(p1.price) : "₹1,24,000"}
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
              imgSrc={p2?.images?.[0]}
              onClick={() => p2 && navigate(`/product/${p2._id || p2.id}`)}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 12,
                  color: "#f0e6d0",
                  marginBottom: 4,
                }}
              >
                {p2?.name || "Moss Scent"}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 14,
                  color: "#c9a96e",
                }}
              >
                {p2 ? fmt(p2.price) : "₹6,800"}
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

      {/* Scroll hint */}
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
        @keyframes lineGrow { to { width: 100%; } }
        .hero-line-accent::after {
          content: '';
          position: absolute; bottom: -4px; left: 0;
          width: 0; height: 1px; background: #c9a96e;
          animation: lineGrow 1.2s ease 1.6s forwards;
        }
        @keyframes gridDrift {
          0%   { transform: translateY(0); }
          100% { transform: translateY(80px); }
        }
        @keyframes stageFloat {
          0%, 100% { transform: rotateX(8deg) rotateY(-8deg) translateY(0); }
          50%       { transform: rotateX(4deg) rotateY(4deg) translateY(-16px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scrollDown {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }

        /* ── Hero CTA row — responsive ── */
        .hero-cta-row {
          display: flex;
          align-items: center;
          gap: clamp(16px, 3vw, 28px);
          margin-top: clamp(28px, 4vw, 52px);
          flex-wrap: wrap;
        }
        /* ── Hero stats row — responsive ── */
        .hero-stats-row {
          display: flex;
          gap: clamp(20px, 4vw, 40px);
          margin-top: clamp(32px, 5vw, 64px);
          padding-top: clamp(20px, 3vw, 40px);
          border-top: 1px solid rgba(201,169,110,0.12);
          flex-wrap: wrap;
        }

        /* ── Buttons ── */
        .btn-primary-hero {
          display: inline-flex; align-items: center; gap: 12px;
          padding: 16px 36px; background: #c9a96e;
          color: #0d0c0b; font-size: 12px; letter-spacing: 0.14em;
          text-transform: uppercase; font-weight: 500;
          border: none; cursor: pointer; position: relative; overflow: hidden;
          transition: all 0.4s ease; text-decoration: none;
          min-height: 48px;
        }
        .btn-primary-hero::before {
          content: ''; position: absolute; inset: 0;
          background: #f0e6d0; transform: scaleX(0); transform-origin: right;
          transition: transform 0.4s ease;
        }
        @media (hover: hover) {
          .btn-primary-hero:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(201,169,110,0.25);
          }
          .btn-primary-hero:hover::before { transform: scaleX(1); transform-origin: left; }
        }
        .btn-primary-hero span,
        .btn-primary-hero svg { position: relative; z-index: 1; }

        .btn-ghost-hero {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 0; color: rgba(240,230,208,0.6); font-size: 12px;
          letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer;
          text-decoration: none; border-bottom: 1px solid rgba(201,169,110,0.2);
          transition: all 0.3s; background: none; min-height: 48px;
        }
        @media (hover: hover) {
          .btn-ghost-hero:hover { color: #c9a96e; border-color: #c9a96e; }
        }

        /* ── 3D Cards ── */
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
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(201,169,110,0.06) 0%, transparent 50%);
          pointer-events: none;
        }
        .product-card-3d.dark {
          background: linear-gradient(135deg, rgba(13,12,11,0.95) 0%, rgba(20,18,15,0.95) 100%);
          border-color: rgba(255,255,255,0.08);
        }
        @media (hover: hover) {
          .product-card-3d:hover {
            border-color: rgba(201,169,110,0.4);
            transform: translateY(-8px) scale(1.02) !important;
            box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 40px rgba(201,169,110,0.08);
          }
        }
        .card-img-placeholder {
          width: 100%;
          background: linear-gradient(135deg, rgba(201,169,110,0.1) 0%, rgba(74,92,71,0.1) 100%);
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden; margin-bottom: 16px;
        }
        .card-img-placeholder::after {
          content: '';
          position: absolute; top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: linear-gradient(45deg, transparent 30%, rgba(201,169,110,0.08) 50%, transparent 70%);
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(50%); }
        }
        .particle {
          position: absolute; border-radius: 50%;
          background: #c9a96e; opacity: 0.4;
          animation: particleFloat linear infinite;
        }
        @keyframes particleFloat {
          0%   { transform: translateY(0); opacity: 0; }
          10%  { opacity: 0.6; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-500px); opacity: 0; }
        }

        /* ── Mobile overrides ── */
        @media (max-width: 639px) {
          .btn-primary-hero {
            width: 100%; justify-content: center;
            padding: 15px 20px; font-size: 11px;
          }
          .btn-ghost-hero {
            padding: 12px 0; font-size: 11px;
          }
          .hero-eyebrow-row { margin-bottom: 20px !important; }
          .hero-line-accent::after { display: none !important; }
          .hero-content-grid { padding-top: 28px !important; }
          .hero-scroll-hint { display: none !important; }
        }
      `}</style>
    </section>
  );
}

function ProductCard3D({ children, style, badge, small, dark, imgSrc, onClick }) {
  const imgH = small ? 80 : 150;
  return (
    <div
      className={`product-card-3d${dark ? " dark" : ""}`}
      onClick={onClick}
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
          overflow: "hidden",
        }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
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
        )}
      </div>
      {children}
    </div>
  );
}

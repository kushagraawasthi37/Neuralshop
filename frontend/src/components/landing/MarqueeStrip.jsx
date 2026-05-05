const items = [
  "Neural Intelligence",
  "Rare Objects",
  "Verified Excellence",
  "Curated Desire",
  "Multi-Vendor Mastery",
  "Elevated Commerce",
];
const doubled = [...items, ...items];

export default function MarqueeStrip() {
  return (
    <div
      className="marquee-strip-wrap"
      style={{
        padding: "clamp(18px, 3vw, 28px) 0",
        background: "#c9a96e",
        overflow: "hidden",
        display: "flex",
      }}
    >
      <div
        className="marquee-strip-inner"
        style={{
          display: "flex",
          gap: "clamp(28px, 4vw, 48px)",
          whiteSpace: "nowrap",
          animation: "marqueeScroll 25s linear infinite",
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="marquee-strip-item"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(13px, 1.5vw, 16px)",
              fontWeight: 300,
              color: "#0d0c0b",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "clamp(16px, 2vw, 24px)",
            }}
          >
            {item}
            <span
              style={{
                width: 4,
                height: 4,
                background: "rgba(13,12,11,0.4)",
                borderRadius: "50%",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (max-width: 639px) {
          .marquee-strip-inner { animation-duration: 18s !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-strip-inner { animation-play-state: paused; }
        }
      `}</style>
    </div>
  );
}

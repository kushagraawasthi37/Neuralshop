export default function SectionHeading({ label, title, accent, className = "" }) {
  return (
    <div className={className}>
      <div
        style={{
          fontSize: 9,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "#c9a96e",
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            width: 24,
            height: 1,
            background: "#c9a96e",
            display: "inline-block",
          }}
        />
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: "clamp(24px,3vw,36px)",
          fontWeight: 300,
          color: "#f0e6d0",
        }}
      >
        {title}{" "}
        {accent && (
          <em style={{ fontStyle: "italic", color: "#c9a96e" }}>{accent}</em>
        )}
      </div>
    </div>
  );
}

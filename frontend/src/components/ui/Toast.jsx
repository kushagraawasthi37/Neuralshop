export default function Toast({ msg, show }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        zIndex: 9000,
        background: "#1a1916",
        border: "1px solid rgba(201,169,110,0.18)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontSize: 12,
        color: "#f0e6d0",
        transform: show ? "translateY(0)" : "translateY(80px)",
        opacity: show ? 1 : 0,
        transition: "all 0.5s cubic-bezier(0.23,1,0.32,1)",
        minWidth: 240,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          background: "#c9a96e",
          borderRadius: "50%",
          flexShrink: 0,
        }}
      />
      {msg}
    </div>
  );
}

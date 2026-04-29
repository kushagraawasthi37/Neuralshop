import { useState, forwardRef } from "react";

const BORDER = "rgba(201,169,110,0.18)";
const BORDER_FOCUS = "rgba(201,169,110,0.5)";
const BORDER_ERROR = "rgba(192,57,43,0.6)";
const TEXT_MUTED = "rgba(240,230,208,0.38)";

export const AuthField = forwardRef(function AuthField(
  { label, error, hint, type = "text", style: extStyle, ...props },
  ref,
) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: TEXT_MUTED,
            marginBottom: 7,
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          ref={ref}
          type={isPassword && show ? "text" : type}
          {...props}
          style={{
            width: "100%",
            padding: "12px 16px",
            paddingRight: isPassword ? 56 : 16,
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${error ? BORDER_ERROR : BORDER}`,
            color: "#f0e6d0",
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 14,
            outline: "none",
            transition: "border-color 0.3s,background 0.3s",
            appearance: "none",
            ...extStyle,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = BORDER_FOCUS;
            e.target.style.background = "rgba(201,169,110,0.03)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? BORDER_ERROR : BORDER;
            e.target.style.background = "rgba(255,255,255,0.02)";
          }}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: TEXT_MUTED,
              transition: "color 0.3s",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a96e")}
            onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_MUTED)}
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && (
        <p style={{ fontSize: 11, color: "#c17a6a", marginTop: 5 }}>{error}</p>
      )}
      {hint && !error && (
        <p
          style={{
            fontSize: 11,
            color: TEXT_MUTED,
            marginTop: 5,
            letterSpacing: "0.02em",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
});

export function PasswordStrength({ password }) {
  const score = !password
    ? 0
    : password.length < 6
      ? 1
      : password.length < 8
        ? 2
        : /[A-Z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9]/.test(password)
          ? 4
          : /[A-Z]/.test(password) && /[0-9]/.test(password)
            ? 3
            : 2;
  const colors = ["", "#b05a4a", "#a07840", "#4a7c59", "#c9a96e"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div
      style={{ marginTop: 6, display: "flex", gap: 4, alignItems: "center" }}
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            height: 2,
            flex: 1,
            background: i <= score ? colors[score] : BORDER,
            transition: "background 0.4s",
          }}
        />
      ))}
      <span
        style={{
          fontSize: 10,
          color: TEXT_MUTED,
          letterSpacing: "0.1em",
          minWidth: 36,
          textAlign: "right",
        }}
      >
        {labels[score]}
      </span>
    </div>
  );
}

export function AuthBtn({ children, loading, style: extStyle, ...props }) {
  const [hovered, setHovered] = useState(false);
  const isDisabled = loading || props.disabled;

  return (
    <button
      {...props}
      disabled={isDisabled}
      style={{
        width: "100%",
        padding: "14px 32px",
        background: "#c9a96e",
        color: "#0d0c0b",
        fontFamily: "'DM Sans',sans-serif",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        border: "none",
        cursor: isDisabled ? "default" : "pointer",
        position: "relative",
        overflow: "hidden",
        marginBottom: 12,
        opacity: isDisabled ? 0.75 : 1,
        transition: "opacity 0.3s",
        ...extStyle,
      }}
      onMouseEnter={() => !isDisabled && setHovered(true)}
      onMouseLeave={() => !isDisabled && setHovered(false)}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          background: "#f0e6d0",
          transform: hovered ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: hovered ? "left" : "right",
          transition: "transform 0.4s ease",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {loading ? (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            position: "relative",
            zIndex: 1,
          }}
        >
          <span
            style={{
              width: 13,
              height: 13,
              border: "1.5px solid rgba(13,12,11,0.4)",
              borderTopColor: "#0d0c0b",
              borderRadius: "50%",
              animation: "authSpin 0.8s linear infinite",
              display: "inline-block",
            }}
          />
          Processing
        </span>
      ) : (
        <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      )}
      <style>{`@keyframes authSpin{to{transform:rotate(360deg)}}`}</style>
    </button>
  );
}

export function GhostBtn({ children, style: extStyle, ...props }) {
  return (
    <button
      {...props}
      style={{
        width: "100%",
        padding: "13px 32px",
        background: "transparent",
        color: "rgba(240,230,208,0.55)",
        fontFamily: "'DM Sans',sans-serif",
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        border: "1px solid rgba(201,169,110,0.18)",
        cursor: "pointer",
        transition: "border-color 0.3s,color 0.3s",
        ...extStyle,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(201,169,110,0.45)";
        e.currentTarget.style.color = "#c9a96e";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(201,169,110,0.18)";
        e.currentTarget.style.color = "rgba(240,230,208,0.55)";
      }}
    >
      {children}
    </button>
  );
}

export function FormEyebrow({ children, style: extStyle }) {
  return (
    <div
      style={{
        fontSize: 10,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: "#c9a96e",
        marginBottom: 8,
        display: "flex",
        alignItems: "center",
        gap: 10,
        ...extStyle,
      }}
    >
      <span
        style={{
          width: 20,
          height: 1,
          background: "#c9a96e",
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {children}
    </div>
  );
}

export function FormTitle({ children, style: extStyle }) {
  return (
    <div
      style={{
        fontFamily: "'Cormorant Garamond',serif",
        fontSize: 36,
        fontWeight: 300,
        lineHeight: 1.1,
        color: "#f0e6d0",
        marginBottom: 6,
        ...extStyle,
      }}
    >
      {children}
    </div>
  );
}

export function FormSubtitle({ children, tight, style: extStyle }) {
  return (
    <p
      style={{
        fontSize: 13,
        color: TEXT_MUTED,
        marginBottom: tight ? 20 : 28,
        lineHeight: 1.6,
        ...extStyle,
      }}
    >
      {children}
    </p>
  );
}

export function FormDivider() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "16px 0",
      }}
    >
      <div style={{ flex: 1, height: 1, background: BORDER }} />
      <span
        style={{
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: TEXT_MUTED,
        }}
      >
        or
      </span>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
    </div>
  );
}

export function FormFoot({ children, style: extStyle }) {
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: 16,
        fontSize: 12,
        color: TEXT_MUTED,
        ...extStyle,
      }}
    >
      {children}
    </div>
  );
}

export function TextLink({ children, style: extStyle, ...props }) {
  return (
    <button
      type="button"
      {...props}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#c9a96e",
        fontSize: 12,
        fontFamily: "'DM Sans',sans-serif",
        letterSpacing: "0.06em",
        display: "inline",
        transition: "opacity 0.3s",
        padding: 0,
        ...extStyle,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.65")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return (
    <div
      style={{
        padding: "10px 14px",
        background: "rgba(192,57,43,0.07)",
        border: "1px solid rgba(192,57,43,0.28)",
        fontSize: 12,
        color: "#c17a6a",
        marginBottom: 16,
        lineHeight: 1.5,
      }}
    >
      {message}
    </div>
  );
}

export function StatusBadge({ children, dot = "#c9a96e" }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        border: "1px solid rgba(201,169,110,0.25)",
        background: "rgba(201,169,110,0.06)",
        fontSize: 10,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#c9a96e",
        marginBottom: 16,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: dot,
          animation: "statusPulse 2s ease-in-out infinite",
        }}
      />
      {children}
      <style>{`@keyframes statusPulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

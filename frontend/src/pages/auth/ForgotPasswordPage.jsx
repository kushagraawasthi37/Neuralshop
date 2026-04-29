import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";
import {
  AuthField,
  AuthBtn,
  FormEyebrow,
  FormTitle,
  FormSubtitle,
  FormFoot,
  TextLink,
  FormError,
} from "../../components/auth/AuthField";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

/* Centred layout — no split panel needed here */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const pendingRole = useAuthStore((s) => s.pendingRole);
  const setPendingEmail = useAuthStore((s) => s.setPendingEmail);
  const setPendingRole = useAuthStore((s) => s.setPendingRole);
  const [role, setRole] = useState(pendingRole || "user");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    setServerError("");
    try {
      await authApi.forgotPassword({ email, role });
      setPendingEmail(email);
      setPendingRole(role);
      setSent(true);
      setTimeout(() => navigate("/reset-password"), 2200);
    } catch (err) {
      setServerError(
        err.response?.data?.message || "No account found with that email.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0e0d0b",
        padding: "120px 40px 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          filter: "blur(140px)",
          background: "rgba(201,169,110,0.05)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }}
      />
      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(201,169,110,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(201,169,110,0.02) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 460,
          position: "relative",
          zIndex: 2,
        }}
      >
        {sent ? (
          <SentState email={getValues("email")} />
        ) : (
          <>
            <div style={{ marginBottom: 40 }}>
              <TextLink
                onClick={() => navigate("/login")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11,
                  letterSpacing: "0.12em",
                }}
              >
                ← Back to sign in
              </TextLink>
            </div>

            <FormEyebrow>Password Recovery</FormEyebrow>
            <FormTitle>
              Reset your
              <br />
              password.
            </FormTitle>
            <FormSubtitle>
              Enter your email and we'll send you a reset code.
            </FormSubtitle>

            <FormError message={serverError} />

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <AuthField
                label="Email address"
                type="email"
                placeholder="your@email.com"
                error={errors.email?.message}
                {...register("email")}
              />
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(240,230,208,0.38)",
                    marginBottom: 8,
                  }}
                >
                  Account type
                </label>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(201,169,110,0.18)",
                    color: "#f0e6d0",
                    fontSize: 14,
                    outline: "none",
                  }}
                >
                  <option value="user">Customer Account</option>
                  <option value="admin">Admin Account</option>
                </select>
                <p
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    color: "rgba(240,230,208,0.38)",
                    letterSpacing: "0.02em",
                  }}
                >
                  Choose the account type for password recovery.
                </p>
              </div>
              <AuthBtn type="submit" loading={loading}>
                Send Reset Code →
              </AuthBtn>
            </form>

            <FormFoot>
              Remember it?{" "}
              <TextLink onClick={() => navigate("/login")}>Sign in →</TextLink>
            </FormFoot>
          </>
        )}
      </div>
    </div>
  );
}

function SentState({ email }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* Status badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 12px",
          border: "1px solid rgba(201,169,110,0.25)",
          background: "rgba(201,169,110,0.06)",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#c9a96e",
          marginBottom: 28,
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#c9a96e",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
        Code Sent
      </div>

      <div
        style={{
          width: 64,
          height: 64,
          border: "1px solid rgba(201,169,110,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -4,
            border: "1px solid rgba(201,169,110,0.1)",
          }}
        />
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c9a96e"
          strokeWidth="1.5"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </div>

      <div
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: 32,
          fontWeight: 300,
          color: "#f0e6d0",
          marginBottom: 12,
        }}
      >
        Check your inbox.
      </div>
      <p
        style={{
          fontSize: 13,
          color: "rgba(240,230,208,0.4)",
          lineHeight: 1.6,
          marginBottom: 8,
        }}
      >
        A reset code has been dispatched to
      </p>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          border: "1px solid rgba(201,169,110,0.18)",
          fontFamily: "'DM Mono',monospace",
          fontSize: 12,
          color: "rgba(240,230,208,0.58)",
          marginBottom: 24,
        }}
      >
        {email}
      </div>
      <p style={{ fontSize: 12, color: "rgba(240,230,208,0.3)" }}>
        Redirecting to reset…
      </p>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

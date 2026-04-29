import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";
import OtpInput from "../../components/auth/OtpInput";
import {
  AuthBtn,
  FormEyebrow,
  FormTitle,
  FormSubtitle,
  FormFoot,
  TextLink,
  FormError,
} from "../../components/auth/AuthField";

const RESEND_SECS = 60;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { pendingEmail, pendingRole } = useAuthStore();
  const [otp, setOtp] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_SECS);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!pendingEmail) navigate("/forgot-password");
  }, [pendingEmail, navigate]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const resetRole = pendingRole || "user";

  const onSubmit = async () => {
    if (otp.length < 6) {
      setServerError("Enter the 6-digit OTP first");
      return;
    }
    setLoading(true);
    setServerError("");
    try {
      await authApi.verifyResetOtp({
        email: pendingEmail,
        otp,
        role: resetRole,
      });
      navigate("/new-password", { state: { otp } });
    } catch (err) {
      setServerError(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setServerError("");
    try {
      await authApi.resendOtp({
        email: pendingEmail,
        type: "reset",
        role: resetRole,
      });
      setResendTimer(RESEND_SECS);
    } catch (err) {
      setServerError(err.response?.data?.message || "Could not resend OTP.");
    } finally {
      setResending(false);
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
        <div style={{ marginBottom: 40 }}>
          <TextLink
            onClick={() => navigate("/forgot-password")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 11,
              letterSpacing: "0.12em",
            }}
          >
            ← Back
          </TextLink>
        </div>

        <FormEyebrow>Verification</FormEyebrow>
        <FormTitle>
          Enter the
          <br />
          verification code.
        </FormTitle>
        <FormSubtitle>We've sent a 6-digit code to your email.</FormSubtitle>

        {pendingEmail && (
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
              marginBottom: 28,
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c9a96e"
              strokeWidth="1.5"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            {pendingEmail}
          </div>
        )}

        <div style={{ marginBottom: 4 }}>
          <label
            style={{
              display: "block",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(240,230,208,0.38)",
              marginBottom: 12,
            }}
          >
            Verification Code
          </label>
          <OtpInput value={otp} onChange={setOtp} />
        </div>

        {/* Resend */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontSize: 12,
            color: "rgba(240,230,208,0.38)",
            marginBottom: 28,
          }}
        >
          {resendTimer > 0 ? (
            <>
              Resend in{" "}
              <span
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 16,
                  color: "#c9a96e",
                }}
              >
                {resendTimer}s
              </span>
            </>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#c9a96e",
                fontSize: 12,
                fontFamily: "'DM Sans',sans-serif",
                letterSpacing: "0.06em",
                opacity: resending ? 0.5 : 1,
              }}
            >
              {resending ? "Sending…" : "Resend code →"}
            </button>
          )}
        </div>

        <FormError message={serverError} />

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          noValidate
        >
          <div style={{ marginTop: 8 }}>
            <AuthBtn type="submit" loading={loading}>
              Verify Code →
            </AuthBtn>
          </div>
        </form>

        <FormFoot>
          Back to{" "}
          <TextLink onClick={() => navigate("/forgot-password")}>
            Forgot password →
          </TextLink>
        </FormFoot>
      </div>
    </div>
  );
}

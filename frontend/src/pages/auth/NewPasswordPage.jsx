import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";
import {
  AuthField,
  PasswordStrength,
  AuthBtn,
  FormEyebrow,
  FormTitle,
  FormSubtitle,
  FormFoot,
  TextLink,
  FormError,
} from "../../components/auth/AuthField";

const schema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function NewPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingEmail, pendingRole, setPendingEmail } = useAuthStore();
  const [otp] = useState(location.state?.otp || "");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const newPassword = watch("newPassword", "");

  useEffect(() => {
    if (!pendingEmail || !otp) navigate("/reset-password");
  }, [pendingEmail, otp, navigate]);

  const onSubmit = async ({ newPassword }) => {
    setLoading(true);
    setServerError("");
    try {
      await authApi.resetPassword({
        email: pendingEmail,
        otp,
        newPassword,
        role: pendingRole || "user",
      });
      setDone(true);
      setPendingEmail(null);
      setTimeout(
        () => navigate(pendingRole === "admin" ? "/admin/login" : "/login"),
        2200,
      );
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Reset failed. Check the OTP and try again.",
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
        padding:
          "clamp(90px,12vw,120px) clamp(16px,6vw,40px) clamp(48px,8vw,80px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          width: "min(600px,90vw)",
          height: "min(600px,90vw)",
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
        {done ? (
          <DoneState />
        ) : (
          <>
            <div style={{ marginBottom: 36 }}>
              <TextLink
                onClick={() => navigate("/reset-password")}
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

            <FormEyebrow>Reset Complete</FormEyebrow>
            <FormTitle>
              Set new
              <br />
              password.
            </FormTitle>
            <FormSubtitle>
              Choose a strong password. After reset, all existing sessions will
              be invalidated.
            </FormSubtitle>

            <FormError message={serverError} />

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div>
                <AuthField
                  label="New Password"
                  type="password"
                  placeholder="New secure password"
                  error={errors.newPassword?.message}
                  {...register("newPassword")}
                />
                <PasswordStrength password={newPassword} />
              </div>
              <div style={{ marginTop: 12 }}>
                <AuthField
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat new password"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
              </div>
              <div style={{ marginTop: 8 }}>
                <AuthBtn type="submit" loading={loading}>
                  Reset Password →
                </AuthBtn>
              </div>
            </form>

            <FormFoot>
              Back to{" "}
              <TextLink onClick={() => navigate("/login")}>Sign in →</TextLink>
            </FormFoot>
          </>
        )}
      </div>
    </div>
  );
}

function DoneState() {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "clamp(64px,16vw,80px)",
          height: "clamp(64px,16vw,80px)",
          borderRadius: "50%",
          background: "rgba(201,169,110,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c9a96e"
          strokeWidth="2"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <FormTitle>
        Password
        <br />
        reset successful!
      </FormTitle>
      <FormSubtitle style={{ marginTop: 16 }}>
        You can now sign in with your new password.
      </FormSubtitle>
    </div>
  );
}

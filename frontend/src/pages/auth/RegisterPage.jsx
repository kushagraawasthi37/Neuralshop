import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  AuthField,
  PasswordStrength,
  AuthBtn,
  FormDivider,
  FormEyebrow,
  FormTitle,
  FormSubtitle,
  FormFoot,
  TextLink,
  FormError,
} from "../../components/auth/AuthField";
import { GoogleBtn } from "./LoginPage";
import { authApi } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";

const schema = z.object({
  name: z.string().min(2, "Min 2 characters"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Min 8 characters"),
  agree: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setPendingEmail, setPendingRole } = useAuthStore();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });
  const password = watch("password", "");

  const onSubmit = async ({ name, email, password }) => {
    setLoading(true);
    setServerError("");
    try {
      const { data } = await authApi.register({ name, email, password });
      localStorage.setItem("token", data.token);
      setPendingEmail(email);
      setPendingRole("user");
      navigate("/verify-email");
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="New Member"
      title="Curated for those who"
      titleAccent="know better"
      body="Join thousands experiencing commerce elevated by neural intelligence."
      features={[
        "Email verification via OTP",
        "bcrypt-secured password hashing",
        "JWT stored in httpOnly cookie",
        "Google OAuth supported",
      ]}
    >
      <StepBar current={1} />
      <FormEyebrow>Create Account</FormEyebrow>
      <FormTitle>
        Join
        <br />
        NeuralShop.
      </FormTitle>
      <FormSubtitle tight>Craft your neural commerce identity.</FormSubtitle>

      <FormError message={serverError} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Name + Email — 2-col on ≥480px, stacked on mobile */}
        <div
          className="auth-register-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 0,
          }}
        >
          <AuthField
            label="Full Name"
            placeholder="Ada Lovelace"
            error={errors.name?.message}
            {...register("name")}
          />
          <AuthField
            label="Email"
            type="email"
            placeholder="ada@email.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <style>{`
          @media (max-width: 480px) {
            .auth-register-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        <div>
          <AuthField
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrength password={password} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            margin: "14px 0 12px",
          }}
        >
          <input
            type="checkbox"
            id="agree"
            {...register("agree")}
            style={{
              width: 18,
              height: 18,
              flexShrink: 0,
              marginTop: 2,
              accentColor: "#c9a96e",
              cursor: "pointer",
            }}
          />
          <label
            htmlFor="agree"
            style={{
              fontSize: 12,
              color: "rgba(240,230,208,0.38)",
              lineHeight: 1.5,
              cursor: "pointer",
            }}
          >
            I agree to the{" "}
            <Link
              to="/terms"
              style={{ color: "#c9a96e", textDecoration: "none" }}
            >
              Terms
            </Link>
            {" & "}
            <Link
              to="/privacy"
              style={{ color: "#c9a96e", textDecoration: "none" }}
            >
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.agree && (
          <p
            style={{
              fontSize: 11,
              color: "#c17a6a",
              marginBottom: 10,
              marginTop: -6,
            }}
          >
            {errors.agree.message}
          </p>
        )}

        <AuthBtn type="submit" loading={loading}>
          Create Account →
        </AuthBtn>
      </form>

      <FormDivider />
      <GoogleBtn />

      <FormFoot>
        Have an account?{" "}
        <TextLink onClick={() => navigate("/login")}>Sign in →</TextLink>
      </FormFoot>
    </AuthLayout>
  );
}

export function StepBar({ current }) {
  const steps = ["Account", "Verify", "Done"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < steps.length - 1 ? 1 : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 500,
                  border: `1px solid ${done || active ? "#c9a96e" : "rgba(201,169,110,0.18)"}`,
                  background: done ? "#c9a96e" : "transparent",
                  color: done
                    ? "#0d0c0b"
                    : active
                      ? "#c9a96e"
                      : "rgba(240,230,208,0.38)",
                  transition: "all 0.3s",
                }}
              >
                {done ? "✓" : n}
              </div>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: done || active ? "#f0e6d0" : "rgba(240,230,208,0.38)",
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: done
                    ? "rgba(201,169,110,0.4)"
                    : "rgba(201,169,110,0.18)",
                  margin: "0 10px",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

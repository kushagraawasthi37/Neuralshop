import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithPopup } from "firebase/auth";
import { firebaseAuth, googleProvider } from "../../config/firebase";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  AuthField,
  AuthBtn,
  FormDivider,
  FormEyebrow,
  FormTitle,
  FormSubtitle,
  FormFoot,
  TextLink,
  FormError,
} from "../../components/auth/AuthField";
import { authApi } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";
import { cartApi } from "../../api/cart";
import { useGuestCartStore } from "../../store/guestCartStore";

const schema = z.object({
  email: z.email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); //React router hook to read and manage the query parameter of the URL
  const setAuth = useAuthStore((s) => s.setAuth);
  const setPendingRole = useAuthStore((s) => s.setPendingRole);
  const guestItems = useGuestCartStore((s) => s.items);
  const clearGuestCart = useGuestCartStore((s) => s.clear);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    setServerError("");
    try {
      const { data } = await authApi.login({ email, password });
      setPendingRole("user");
      setAuth(data.user, data.token, "user");

      if (guestItems.length > 0) {
        try {
          await cartApi.merge({ items: guestItems });
          clearGuestCart();
        } catch (_) {}
      }

      const returnTo = searchParams.get("return") || "/";
      navigate(returnTo);
    } catch (err) {
      setServerError(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Customer Portal"
      title="Where machine intelligence meets"
      titleAccent="human desire"
      body="A curated ecosystem of products discovered, verified, and elevated by AI — refined by you."
    >
      <FormEyebrow>Customer Portal</FormEyebrow>
      <FormTitle>
        Welcome
        <br />
        back.
      </FormTitle>
      <FormSubtitle tight>
        Sign in to continue your curated journey.
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
        <div>
          <AuthField
            label="Password"
            type="password"
            placeholder="Your password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div style={{ textAlign: "right", marginTop: -10, marginBottom: 14 }}>
            <TextLink onClick={() => navigate("/forgot-password")}>
              Forgot password →
            </TextLink>
          </div>
        </div>

        <AuthBtn type="submit" loading={loading}>
          Sign In →
        </AuthBtn>
      </form>

      <FormDivider />
      <GoogleBtn />

      <FormFoot>
        No account?{" "}
        <TextLink onClick={() => navigate("/register")}>Register →</TextLink>
        {"  ·  "}
        <TextLink onClick={() => navigate("/admin/login")}>Admin →</TextLink>
      </FormFoot>
    </AuthLayout>
  );
}

export function GoogleBtn() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setPendingRole = useAuthStore((s) => s.setPendingRole);
  const guestItems = useGuestCartStore((s) => s.items);
  const clearGuestCart = useGuestCartStore((s) => s.clear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();
      const { data } = await authApi.googleLogin({ idToken });
      setPendingRole("user");
      setAuth(data.user, data.token, "user");
      if (guestItems.length > 0) {
        try {
          await cartApi.merge({ items: guestItems });
          clearGuestCart();
        } catch (_) {}
      }
      navigate("/");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Google sign-in failed.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <p
          style={{
            fontSize: 11,
            color: "#c17a6a",
            marginBottom: 8,
            marginTop: -4,
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={loading}
        onClick={handleGoogleLogin}
        style={{
          width: "100%",
          padding: "13px 24px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(201,169,110,0.18)",
          color: loading ? "rgba(240,230,208,0.3)" : "rgba(240,230,208,0.58)",
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 12,
          letterSpacing: "0.06em",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          transition: "all 0.3s",
          marginBottom: 8,
          minHeight: 44,
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.borderColor = "rgba(201,169,110,0.45)";
            e.currentTarget.style.color = "#f0e6d0";
            e.currentTarget.style.background = "rgba(201,169,110,0.04)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(201,169,110,0.18)";
          e.currentTarget.style.color = loading
            ? "rgba(240,230,208,0.3)"
            : "rgba(240,230,208,0.58)";
          e.currentTarget.style.background = "rgba(255,255,255,0.02)";
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
        >
          <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.34 5 12c0-4.18 3.17-7.27 7.19-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.33 0 9.25-3.65 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
        </svg>
        {loading ? "Signing in…" : "Continue with Google"}
      </button>
    </>
  );
}

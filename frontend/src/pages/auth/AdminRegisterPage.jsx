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
import { authApi } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";

const schema = z.object({
  name: z.string().min(2, "Min 2 characters"),
  email: z.email("Valid email required"),
  password: z.string().min(8, "Min 8 characters"),
  agree: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
});

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const { setPendingEmail, setPendingRole } = useAuthStore();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch, //React hook function that obsereves current value of the form field
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  //We are doing this to check the password strength as the user types in the password field. The watch function allows us to observe the current value of the password field in real-time.
  // Value change hone par component re-render ho sakta hai
  const password = watch("password", "");

  const onSubmit = async ({ name, email, password }) => {
    setLoading(true);
    setServerError("");
    try {
      const { data } = await authApi.adminRegister({ name, email, password });
      localStorage.setItem("token", data.token);
      setPendingEmail(email);
      setPendingRole("admin");
      navigate("/verify-email");
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Admin Onboarding"
      title="Elevate to"
      titleAccent="administrative intelligence"
      body="Register as an administrator to access full system controls and multi-vendor management."
      leftGlow="#8b6340"
      leftGlow2="#4a5c47"
    >
      <FormEyebrow>Admin Registration</FormEyebrow>
      <FormTitle>
        Become an
        <br />
        Administrator.
      </FormTitle>
      <FormSubtitle tight>Secure your administrative access.</FormSubtitle>

      <FormError message={serverError} />

      {/* noValidate attribute is used to disable the browser's default validation and allow custom validation logic to be applied. */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 0,
          }}
        >
          <AuthField
            label="Full Name"
            placeholder="Admin Name"
            error={errors.name?.message}
            {...register("name")}
          />
          <AuthField
            label="Admin Email"
            type="email"
            placeholder="admin@neuralshop.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

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
              width: 15,
              height: 15,
              flexShrink: 0,
              marginTop: 2,
              accentColor: "#c9a96e",
              cursor: "pointer",
            }}
          />
          <label
            htmlFor="agree"
            style={{
              fontSize: 11,
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
          Register Admin →
        </AuthBtn>
      </form>

      <FormDivider />

      <FormFoot>
        Already an admin?{" "}
        <TextLink onClick={() => navigate("/admin/login")}>
          Admin Sign In →
        </TextLink>
        {"  ·  "}
        <TextLink onClick={() => navigate("/login")}>
          Customer Portal →
        </TextLink>
      </FormFoot>
    </AuthLayout>
  );
}

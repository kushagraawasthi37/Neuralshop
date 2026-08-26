import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";//for form handeling
import { z } from "zod"; //for Schema-based validation 
import { zodResolver } from "@hookform/resolvers/zod";
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

const schema = z.object({
  email: z.email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setPendingRole = useAuthStore((s) => s.setPendingRole);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,//React hook function that connects the input fields to the react hook form 
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) }/*It tells the form to use the zod resolver for validation*/);

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    setServerError("");
    try {
      const { data } = await authApi.adminLogin({ email, password });
      setPendingRole("admin");
      setAuth(data.user, data.token, "admin");
      navigate("/admin/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Admin Intelligence Hub"
      title="Full administrative control over"
      titleAccent="products, orders, analytics"
      body="Manage multi-vendor operations, inventory, user data, and system analytics with AI-powered insights."
      
      leftGlow="#8b6340"
      leftGlow2="#4a5c47"
    >
      <FormEyebrow>Administrator</FormEyebrow>
      <FormTitle>
        Admin
        <br />
        Access
      </FormTitle>
      <FormSubtitle tight>
        Authenticate with your administrator credentials.
      </FormSubtitle>

      <FormError message={serverError} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          label="Admin Email"
          type="email"
          placeholder="admin@neuralshop.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <div>
          <AuthField
            label="Password"
            type="password"
            placeholder="Your admin password"
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
          Admin Sign In →
        </AuthBtn>
      </form>

      <FormDivider />

      <FormFoot>
        Not an admin?{" "}
        <TextLink onClick={() => navigate("/login")}>
          Customer Portal →
        </TextLink>
        {"  ·  "}
        <TextLink onClick={() => navigate("/admin/register")}>
          Register Admin →
        </TextLink>
      </FormFoot>
    </AuthLayout>
  );
}

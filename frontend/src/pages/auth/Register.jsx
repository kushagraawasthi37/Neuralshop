import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../hooks/useAuth.js";
import { useUiStore } from "../../stores/uiStore.js";
import { ROUTES } from "../../constants/routes.js";
import { MESSAGES } from "../../constants/messages.js";
import Button from "../../components/ui/atoms/Button.jsx";
import Input from "../../components/ui/atoms/Input.jsx";
import Label from "../../components/ui/atoms/Label.jsx";
import Spinner from "../../components/ui/atoms/Spinner.jsx";

// Validation schema
const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, MESSAGES.VALIDATION.NAME_MIN)
      .max(50, MESSAGES.VALIDATION.NAME_MAX),
    email: z
      .string()
      .min(1, MESSAGES.VALIDATION.REQUIRED)
      .email(MESSAGES.VALIDATION.EMAIL),
    password: z.string().min(8, MESSAGES.VALIDATION.PASSWORD_MIN),
    confirmPassword: z.string().min(1, MESSAGES.VALIDATION.REQUIRED),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: MESSAGES.VALIDATION.PASSWORD_MATCH,
    path: ["confirmPassword"],
  });

/**
 * Register page component
 */
const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { showSuccess, showError } = useUiStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = data;
      const result = await registerUser(userData);

      if (result.success) {
        showSuccess(result.message);
        navigate(ROUTES.LOGIN);
      } else {
        showError(result.message);
      }
    } catch (error) {
      showError(MESSAGES.ERROR.GENERIC);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to={ROUTES.LOGIN}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="name" required>
            Full Name
          </Label>
          <div className="mt-1">
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              error={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="email" required>
            Email address
          </Label>
          <div className="mt-1">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              error={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="password" required>
            Password
          </Label>
          <div className="mt-1">
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password (min 8 characters)"
              error={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword" required>
            Confirm Password
          </Label>
          <div className="mt-1">
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              error={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // TODO: Implement Google OAuth
              showInfo("Google registration coming soon!");
            }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        By creating an account, you agree to our{" "}
        <a href="#" className="text-primary-600 hover:text-primary-500">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-primary-600 hover:text-primary-500">
          Privacy Policy
        </a>
      </div>
    </div>
  );
};

export default Register;

import React from "react";
import { clsx } from "clsx";

/**
 * Button component - Basic clickable element
 * @param {Object} props
 * @param {string} props.variant - primary, secondary, outline, ghost, danger
 * @param {string} props.size - sm, md, lg, xl
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state
 * @param {string} props.type - button, submit, reset
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional classes
 */
const Button = ({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  type = "button",
  onClick,
  children,
  className,
  ...props
}) => {
  const baseClasses =
    "btn inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 focus:bg-primary-700 disabled:bg-primary-400",
    secondary:
      "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:bg-secondary-200 disabled:bg-secondary-50",
    outline:
      "border border-secondary-300 bg-transparent hover:bg-secondary-50 focus:bg-secondary-50 disabled:bg-transparent",
    ghost:
      "bg-transparent hover:bg-secondary-100 focus:bg-secondary-100 disabled:bg-transparent",
    danger:
      "bg-error-600 text-white hover:bg-error-700 focus:bg-error-700 disabled:bg-error-400",
  };

  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    xl: "h-14 px-8 text-lg",
  };

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    loading && "cursor-wait",
    className,
  );

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;

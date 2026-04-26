import React, { forwardRef } from "react";
import { clsx } from "clsx";

/**
 * Input component - Basic form input element
 * @param {Object} props
 * @param {string} props.type - input, email, password, number, tel, url, search
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Input value
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.error - Error state
 * @param {string} props.className - Additional classes
 */
const Input = forwardRef(
  (
    {
      type = "text",
      placeholder,
      value,
      disabled = false,
      error = false,
      className,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "input flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50";

    const errorClasses = error
      ? "border-error-500 focus:ring-error-500"
      : "border-secondary-300";

    const classes = clsx(baseClasses, errorClasses, className);

    return (
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        className={classes}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export default Input;

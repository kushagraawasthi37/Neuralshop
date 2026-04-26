import React from "react";
import { clsx } from "clsx";

/**
 * Label component - Form label element
 * @param {Object} props
 * @param {string} props.htmlFor - Associated input id
 * @param {boolean} props.required - Show required indicator
 * @param {boolean} props.error - Error state
 * @param {string} props.className - Additional classes
 * @param {React.ReactNode} props.children - Label content
 */
const Label = ({
  htmlFor,
  required = false,
  error = false,
  className,
  children,
  ...props
}) => {
  const baseClasses =
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

  const stateClasses = error ? "text-error-600" : "text-secondary-900";

  const classes = clsx(baseClasses, stateClasses, className);

  return (
    <label htmlFor={htmlFor} className={classes} {...props}>
      {children}
      {required && (
        <span className="text-error-500 ml-1" aria-label="required">
          *
        </span>
      )}
    </label>
  );
};

export default Label;

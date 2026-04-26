import React from "react";
import Spinner from "../ui/atoms/Spinner.jsx";

/**
 * LoadingSpinner component - Full page or section loading indicator
 * @param {Object} props
 * @param {string} props.size - xs, sm, md, lg, xl
 * @param {string} props.message - Loading message
 * @param {boolean} props.fullScreen - Full screen overlay
 * @param {string} props.className - Additional classes
 */
const LoadingSpinner = ({
  size = "md",
  message = "Loading...",
  fullScreen = false,
  className = "",
  ...props
}) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80"
    : "flex flex-col items-center justify-center p-8";

  return (
    <div className={`${containerClasses} ${className}`} {...props}>
      <Spinner size={size} color="primary" />
      {message && (
        <p className="mt-4 text-sm text-secondary-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;

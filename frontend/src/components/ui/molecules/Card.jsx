import React from "react";
import { clsx } from "clsx";

/**
 * Card component - Container for content with shadow and border
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional classes
 * @param {boolean} props.hover - Hover effect
 * @param {boolean} props.padding - Default padding
 */
const Card = ({
  children,
  className,
  hover = false,
  padding = true,
  ...props
}) => {
  return (
    <div
      className={clsx(
        "bg-white rounded-lg border border-gray-200 shadow-sm",
        {
          "hover:shadow-md transition-shadow duration-200": hover,
          "p-6": padding,
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

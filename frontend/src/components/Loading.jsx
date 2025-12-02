import React, { useEffect, useRef } from "react";
import gsap from "gsap";

function Loading() {
  const ref = useRef(null);

  // Smooth fade-in loading animation
  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { opacity: 0, scale: 0.6, filter: "blur(6px)" },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.6,
        ease: "power3.out",
      }
    );
  }, []);

  return (
    <div
      ref={ref}
      className="
        flex items-center justify-center 
        w-full h-full
        p-6
      "
    >
      <div className="relative">
        {/* Soft glow */}
        <div className="absolute inset-0 w-8 h-8 rounded-full blur-xl bg-cyan-400/20"></div>

        {/* Actual spinner */}
        <svg
          className="animate-spin h-8 w-8 text-cyan-300 relative z-[2]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-80"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    </div>
  );
}

export default Loading;

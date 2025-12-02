import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

function NotFound() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Smooth fade + pop in animation (consistent with other pages)
    gsap.from(contentRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });
  }, []);

  // 3D tilt effect based on cursor movement
  const handleMouseMove = (e) => {
    const rect = pageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(contentRef.current, {
      rotationY: x * 0.02,
      rotationX: -y * 0.02,
      transformPerspective: 800,
      ease: "power2.out",
      duration: 0.3,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(contentRef.current, {
      rotationX: 0,
      rotationY: 0,
      ease: "power3.out",
      duration: 0.6,
    });
  };

  return (
    <div
      ref={pageRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-[100vw] min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] flex flex-col items-center justify-center px-4"
    >
      <div
        ref={contentRef}
        className="text-white text-center flex flex-col items-center gap-6 px-4 select-none"
      >
        <h1 className="text-[40px] md:text-[80px] font-extrabold tracking-wide drop-shadow-xl">
          404
        </h1>

        <p className="text-[16px] md:text-[20px] max-w-[450px] opacity-80">
          Oops! Yeh page shayad exist nahi karta ya move ho gaya hai.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="px-7 py-3 rounded-xl text-[18px] font-semibold 
          bg-white text-black 
          hover:bg-yellow-400 hover:text-white 
          transition-all duration-300 
          shadow-md hover:shadow-yellow-400/40"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

export default NotFound;

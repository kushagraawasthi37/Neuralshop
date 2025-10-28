import React from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="w-[100vw] min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] flex flex-col items-center justify-center gap-6 text-white px-4 text-center">
      <h1 className="text-[30px] md:text-[70px] font-bold tracking-wide">
        404 - Page Not Found
      </h1>
      <p className="text-[16px] md:text-[20px] max-w-[400px]">
        The page you are looking for does not exist or has been moved.
      </p>
      <button
        onClick={() => navigate("/login")}
        className="bg-white text-black px-6 py-3 rounded-xl text-[18px] font-semibold hover:bg-yellow-400 hover:text-white transition-colors duration-300 cursor-pointer"
      >
        Go to Login
      </button>
    </div>
  );
}

export default NotFound;

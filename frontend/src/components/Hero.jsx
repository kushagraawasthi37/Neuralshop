import React, { useEffect } from "react";
import { FaCircle } from "react-icons/fa";
import gsap from "gsap";

function Hero({ heroData, heroCount, setHeroCount }) {
  // Text stagger animation
  useEffect(() => {
    gsap.fromTo(
      ".hero-line",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
      }
    );
  }, [heroData]);

  return (
    <div className="absolute inset-0 w-[45%] flex flex-col justify-center pl-[3%] z-10">
      {/* Cinematic Hero Text */}
      <div
        className="
        text-[#f8d26e]
        font-semibold
        text-[22px] sm:text-[30px] md:text-[44px] lg:text-[62px]
        leading-tight tracking-tight drop-shadow-[0_6px_20px_rgba(0,0,0,0.5)]
      "
      >
        <p className="hero-line">{heroData.text1}</p>
        <p className="hero-line text-[#b6ecf3]">{heroData.text2}</p>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-3 mt-6 md:mt-8 select-none">
        {[0, 1, 2, 3].map((i) => (
          <FaCircle
            key={i}
            onClick={() => setHeroCount(i)}
            className={`
              w-3.5 h-3.5 cursor-pointer transition-all duration-300
              ${
                heroCount === i
                  ? "text-[#f8d26e] scale-[1.25] drop-shadow-[0_0_10px_#f8d26e]"
                  : "text-white/50 hover:text-white hover:scale-110"
              }
            `}
          />
        ))}
      </div>
    </div>
  );
}

export default Hero;

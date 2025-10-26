import React from "react";
import { FaCircle } from "react-icons/fa";

function Hero(props) {
  const { heroData, heroCount, setHeroCount } = props;

  return (
    <div className="w-[38%] absolute inset-0 flex flex-col justify-center pl-[3%] text-left z-10">
      {/* Text */}
      <div className="text-[#f8d26e] font-semibold text-[20px] sm:text-[26px] md:text-[40px] lg:text-[60px] leading-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
        <p>{heroData.text1}</p>
        <p className="text-[#b6ecf3]">{heroData.text2}</p>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-2.5 mt-6 md:mt-8">
        {[0, 1, 2, 3].map((i) => (
          <FaCircle
            key={i}
            onClick={() => setHeroCount(i)}
            className={`w-3.5 transition-all duration-500 cursor-pointer ${
              heroCount === i
                ? "text-[#f8d26e] scale-110 drop-shadow-[0_0_8px_#f8d26e]"
                : "text-white/60 hover:text-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default Hero;

import React from "react";
import { FaCircle } from "react-icons/fa";
import gsap from "gsap";

function Hero({ heroData, heroCount, setHeroCount }) {
  const handleDotClick = (index) => {
    gsap.fromTo(
      `.dot-${index}`,
      { scale: 0.6, opacity: 0.5 },
      {
        scale: 1.2,
        opacity: 1,
        duration: 0.4,
        ease: "power3.out",
      }
    );

    setHeroCount(index);
  };

  return (
    <div className="w-[42%] absolute inset-0 flex flex-col justify-center pl-[3%] text-left z-10">
      {/* Text Section */}
      <div
        className="
          text-[#f8d26e]
          font-semibold
          text-[22px]
          sm:text-[30px]
          md:text-[44px]
          lg:text-[62px]
          leading-tight
          drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]
          tracking-tight
        "
      >
        <p>{heroData.text1}</p>
        <p className="text-[#b6ecf3]">{heroData.text2}</p>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-3 mt-6 md:mt-8">
        {[0, 1, 2, 3].map((i) => (
          <FaCircle
            key={i}
            onClick={() => handleDotClick(i)}
            className={`
              dot-${i}
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

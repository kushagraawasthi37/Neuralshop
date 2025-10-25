import React from "react";
import { FaCircle } from "react-icons/fa";

function Hero(props) {
  const { heroData, heroCount, setHeroCount } = props;
  return (
    <div className="w-[40%] h-full  relative">
      <div className="absolute  text-[#88d9ee]  text-4 md:text-[40px] lg:text-[55px] md:left-[10%] md:top-[90px] lg:top-[130px] left-[10%] top-2.5">
        <p>{heroData.text1}</p>
        <p>{heroData.text2}</p>
      </div>
      <div className="absolute md:top-[400px]   lg:top-[500px] top-40 left-[10%] flex items-center justify-center gap-2.5 ">
        <FaCircle
          className={`w-3.5 ${heroCount === 0 ? "text-red-400" : "text-white"}`}
          // Kis circle  par click karke kaha jayenege
          onClick={() => setHeroCount(0)}
        />
        <FaCircle
          className={`w-3.5 ${
            heroCount === 1 ? "text-red-400" : "text-white"
          }`}
          onClick={() => setHeroCount(1)}
        />
        <FaCircle
          className={`w-3.5 ${
            heroCount === 2 ? "text-red-400" : "text-white"
          }`}
          onClick={() => setHeroCount(2)}
        />
        <FaCircle
          className={`w-3.5 ${
            heroCount === 3 ? "text-red-400" : "text-white"
          }`}
          onClick={() => setHeroCount(3)}
        />
        
      </div>
    </div>
  );
}

export default Hero;

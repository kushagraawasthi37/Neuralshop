import React from "react";
import Title from "./Title";
import { RiExchangeFundsLine } from "react-icons/ri";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { BiSupport } from "react-icons/bi";

function OurPolicy() {
  const policies = [
    {
      icon: <RiExchangeFundsLine className="text-[#2dd4bf]" />,
      title: "Easy Exchange Policy",
      description: "Quick and hassle-free exchange process.",
    },
    {
      icon: <TbRosetteDiscountCheckFilled className="text-[#2dd4bf]" />,
      title: "7 Days Return Policy",
      description: "Shop with peace of mind — 7-day easy returns.",
    },
    {
      icon: <BiSupport className="text-[#2dd4bf]" />,
      title: "Best Customer Support",
      description: "Always ready to help with any query.",
    },
  ];

  return (
    <div
      className="
      w-full py-20 px-6 md:px-16 
      bg-[#0c2025] select-none
      flex flex-col items-center gap-12
    "
    >
      <div className="text-center">
        <Title text1={"OUR"} text2={"POLICY"} />
        <p className="mt-2 text-sm md:text-lg text-blue-200 max-w-xl mx-auto">
          Customer-friendly policies built to give you the best shopping
          experience.
        </p>
      </div>

      <div
        className="
        w-full max-w-6xl 
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
        gap-6 md:gap-8
        justify-center
      "
      >
        {policies.map((p, idx) => (
          <div
            key={idx}
            className="
              w-full p-6 rounded-xl
              bg-[#141a26] border border-[#1f2937]
              shadow-[0_0_14px_rgba(0,0,0,0.5)]
              hover:border-[#2dd4bf] hover:shadow-[0_0_18px_rgba(45,212,191,0.4)]
              transition-all hover:-translate-y-1 cursor-pointer

              flex flex-col items-center text-center gap-3
            "
          >
            <div className="text-4xl md:text-6xl">{p.icon}</div>

            <h3 className="text-lg md:text-xl text-[#a5faf7] font-semibold">
              {p.title}
            </h3>

            <p className="text-sm md:text-base text-blue-200 leading-relaxed">
              {p.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OurPolicy;

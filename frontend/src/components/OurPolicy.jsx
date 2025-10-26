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
      description:
        "Exchange Made Easy – Quick, Simple, and Customer-Friendly Process.",
    },
    {
      icon: <TbRosetteDiscountCheckFilled className="text-[#2dd4bf]" />,
      title: "7 Days Return Policy",
      description: "Shop with Confidence – 7 Days Easy Return Guarantee.",
    },
    {
      icon: <BiSupport className="text-[#2dd4bf]" />,
      title: "Best Customer Support",
      description:
        "Trusted Customer Support – Your Satisfaction Is Our Priority.",
    },
  ];

  return (
    <div className="w-screen min-h-[] flex flex-col items-center justify-start bg-gradient-to-l from-[#141414] to-[#0c2025] gap-12 py-20 px-4 md:px-16 select-none">
      <div className="w-full max-w-5xl text-center">
        <Title text1={"OUR"} text2={"POLICY"} />
        <p className="mt-2 text-sm md:text-lg text-blue-200 max-w-xl mx-auto">
          Customer-Friendly Policies – Committed to Your Satisfaction and Safety.
        </p>
      </div>

      <div className="w-full max-w-5xl flex flex-wrap md:flex-nowrap justify-center gap-6 md:gap-8 lg:gap-10">
        {policies.map(({ icon, title, description }, idx) => (
          <div
            key={idx}
            className="
              w-full max-w-sm md:w-1/3 lg:w-1/3 flex-shrink-0 flex-grow-0 box-border
              flex flex-col items-center gap-2 p-4 md:p-6
              h-[150px] md:h-[200px]
              bg-[#141a26cc] backdrop-blur-lg rounded-xl border-[2.5px] border-[#1f2937]
              shadow-lg shadow-black/60
              transition-transform duration-300 hover:scale-105 hover:shadow-teal-500/70 hover:border-[#2dd4bf] cursor-pointer
            "
          >
            <div className="text-3xl md:text-6xl lg:text-7xl mb-1 md:mb-2 transition-transform duration-500 hover:rotate-12">
              {icon}
            </div>
            <h3 className="text-base md:text-lg lg:text-2xl font-semibold text-[#afe2f2] text-center truncate w-full">
              {title}
            </h3>
            <p className="text-[10px] md:text-xs lg:text-sm text-[#c0d9ff] text-center leading-relaxed break-words w-full">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OurPolicy;

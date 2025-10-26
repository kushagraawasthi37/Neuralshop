import React from "react";
import Title from "../components/Title";
import about from "../assets/asset/about.jpg";
import NewLetterBox from "../components/NewLetterBox";

function About() {
  return (
    <div className="w-[99vw] min-h-screen flex flex-col items-center justify-center bg-gradient-to-l from-[#141414] to-[#0c2025] gap-12 pt-20 px-5 md:px-16 select-none">
      <Title text1={"ABOUT"} text2={"US"} />

      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-10">
        <div className="lg:w-1/2 w-full flex items-center justify-center">
          <img
            src={about}
            alt="About Us"
            className="
             w-4/5 lg:w-2/3 shadow-lg rounded-sm transition-transform transition-shadow duration-500
            hover:scale-105 hover:shadow-[0_0_15px_5px_rgba(45,212,191,0.8)] hover:ring-4 hover:ring-teal-400 hover:ring-opacity-50
            "
          />
        </div>

        <div className="lg:w-1/2 w-10/12 flex flex-col gap-5 mt-5 lg:mt-0">
          <p className="lg:w-4/5 w-full text-white md:text-lg text-sm leading-relaxed">
            NeuralShop born for smart, seamless shopping—created to deliver
            quality products, trending styles, and everyday essentials in one
            place. With reliable service, fast delivery, and great value,
            NeuralShop makes your online shopping experience simple, satisfying,
            and stress-free.
          </p>
          <p className="lg:w-4/5 w-full text-white md:text-lg text-sm leading-relaxed">
            modern shoppers—combining style, convenience, and affordability.
            Whether it’s fashion, essentials, or trends, we bring everything you
            need to one trusted platform with fast delivery, easy returns, and a
            customer-first shopping experience you’ll love.
          </p>
          <p className="lg:w-4/5 w-full text-white md:text-xl text-base font-bold mt-3">
            Our Mission
          </p>
          <p className="lg:w-4/5 w-full text-white md:text-lg text-sm leading-relaxed">
            Our mission is to redefine online shopping by delivering quality,
            affordability, and convenience. NeuralShop connects customers with
            trusted products and brands, offering a seamless, customer-focused
            experience that saves time, adds value, and fits every lifestyle and
            need.
          </p>
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-center gap-8 py-10">
        {[
          {
            title: "Quality Assurance",
            desc: "We guarantee quality through strict checks, reliable sourcing, and a commitment to customer satisfaction always.",
          },
          {
            title: "Convenience",
            desc: "Shop easily with fast delivery, simple navigation, secure checkout, and everything you need in one place.",
          },
          {
            title: "Exceptional Customer Service",
            desc: "Our dedicated support team ensures quick responses, helpful solutions, and a smooth shopping experience every time.",
          },
        ].map(({ title, desc }, idx) => (
          <div
            key={idx}
            className="
        w-11/12 sm:w-72 md:w-80 lg:w-1/3 h-60 border border-gray-200 rounded-xl backdrop-blur-[2px] bg-white/5
        shadow-lg shadow-black/50 p-6 flex flex-col justify-center items-center gap-4
        text-white text-center transition-all duration-500 ease-in-out transform
        hover:scale-105 hover:shadow-[0_0_25px_8px_rgba(12,34,37,0.85)] cursor-pointer
      "
          >
            <b className="text-xl font-semibold text-[#bff1f9]">{title}</b>
            <p className="text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <NewLetterBox />
    </div>
  );
}

export default About;

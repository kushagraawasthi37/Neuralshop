import React from "react";
import Title from "../components/Title";
import about from "../assets/asset/about.jpg";
import NewLetterBox from "../components/NewLetterBox";
import { motion } from "framer-motion";

function About() {
  return (
    <div
      className="w-[99vw] min-h-screen flex flex-col items-center justify-center 
      bg-gradient-to-br from-[#020202] via-[#051619] to-[#000d11]
      gap-24 pt-24 px-6 md:px-16 select-none relative overflow-hidden"
    >
      {/* Background floating lights */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-16 right-16 w-96 h-96 bg-teal-500/10 blur-[150px] rounded-full"></div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <Title text1={"ABOUT"} text2={"US"} />
      </motion.div>

      {/* TOP SECTION */}
      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-20">
        {/* IMAGE WITH PARALLAX + 3D TILT */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="lg:w-1/2 w-full flex items-center justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.08, rotateZ: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="relative group"
          >
            <div
              className="absolute inset-0 bg-teal-300/30 blur-3xl opacity-0 group-hover:opacity-40 
              transition-all duration-700 rounded-2xl"
            ></div>

            <motion.img
              src={about}
              alt="About Us"
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="w-4/5 lg:w-2/3 rounded-xl shadow-[0_0_30px_rgba(0,255,255,0.2)]
                transition-all duration-700"
            />

            {/* Glow Accent */}
            <div
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 
              bg-cyan-300/20 blur-3xl rounded-full group-hover:opacity-90 opacity-0 
              transition-all duration-700"
            ></div>
          </motion.div>
        </motion.div>

        {/* TEXT */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="
            lg:w-1/2 w-11/12 flex flex-col gap-6 mt-5 lg:mt-0
            p-6 rounded-xl bg-white/5 border border-white/10
            backdrop-blur-xl shadow-[0_0_25px_rgba(0,255,255,0.08)]
          "
        >
          <p className="text-gray-200 text-lg leading-relaxed">
            NeuralShop born for smart, seamless shopping—created to deliver
            quality products, trending styles, and everyday essentials in one
            place. With reliable service, fast delivery, and great value,
            NeuralShop makes your online shopping experience simple, satisfying,
            and stress-free.
          </p>

          <p className="text-gray-200 text-lg leading-relaxed">
            Modern shoppers—combining style, convenience, and affordability.
            Whether it’s fashion, essentials, or trends, we bring everything you
            need with fast delivery, easy returns, and a customer-first shopping
            experience you'll love.
          </p>

          <p className="text-cyan-300 text-2xl font-bold mt-3 tracking-wide">
            Our Mission
          </p>

          <p className="text-gray-200 text-lg leading-relaxed">
            Our mission is to redefine online shopping by delivering quality,
            affordability, and convenience. NeuralShop connects customers with
            trusted products and brands, offering a seamless, customer-focused
            experience that saves time and adds value.
          </p>
        </motion.div>
      </div>

      {/* FEATURES SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="w-full max-w-7xl flex flex-col md:flex-row justify-center gap-10 py-16"
      >
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
          <motion.div
            key={idx}
            whileHover={{ scale: 1.07, y: -10 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="
              relative w-11/12 sm:w-72 md:w-80 lg:w-1/3 h-64 
              rounded-2xl p-6 flex flex-col justify-center items-center gap-4
              text-white text-center bg-gradient-to-br from-white/10 to-white/5
              border border-white/10 shadow-[0_0_25px_rgba(0,255,255,0.2)]
              backdrop-blur-xl cursor-pointer overflow-hidden group
            "
          >
            {/* Glow */}
            <div
              className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 blur-3xl 
              rounded-full opacity-0 group-hover:opacity-80 transition-all duration-700"
            ></div>

            <b className="text-2xl font-semibold text-cyan-300 drop-shadow-[0_0_8px_cyan]">
              {title}
            </b>
            <p className="text-gray-200 text-sm leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <NewLetterBox />
    </div>
  );
}

export default About;

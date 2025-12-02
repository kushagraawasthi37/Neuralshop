import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import logo from "../assets/asset/logo.png";

function Footer() {
  const footerRef = useRef(null);

  // Vision Pro GSAP Entrance Animation
  useEffect(() => {
    const el = footerRef.current;
    gsap.fromTo(
      el,
      { opacity: 0, y: 40, filter: "blur(10px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.2,
        ease: "power3.out",
      }
    );
  }, []);

  return (
    <div
      ref={footerRef}
      className="
        w-full mt-auto 
        bg-gradient-to-b from-[#020b0d] via-[#051619] to-[#000d11]
        border-t border-white/10
        relative z-10
        select-none
      "
      style={{ fontFamily: "Sora, sans-serif" }}
    >
      {/* Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[120px] bg-cyan-400/10 blur-[120px] pointer-events-none"></div>

      {/* Main Footer Grid */}
      <div
        className="w-full max-w-[1400px] mx-auto py-14 px-6 lg:px-16
          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 
          text-white"
      >
        {/* Brand Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="NeuralShop" className="w-16 h-16" />
            <p className="text-cyan-300 text-xl font-semibold tracking-wide">
              NeuralShop
            </p>
          </div>

          <p className="text-gray-400 leading-relaxed text-sm md:text-base max-w-[260px]">
            Where innovation meets shopping — fast delivery, premium products,
            and a seamless experience built for the modern world.
          </p>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-4">
          <h3 className="text-cyan-300 text-lg font-semibold">COMPANY</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="hover:text-cyan-300 cursor-pointer transition">
              Home
            </li>
            <li className="hover:text-cyan-300 cursor-pointer transition">
              About Us
            </li>
            <li className="hover:text-cyan-300 cursor-pointer transition">
              Delivery
            </li>
            <li className="hover:text-cyan-300 cursor-pointer transition">
              Privacy Policy
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className="flex flex-col gap-4">
          <h3 className="text-cyan-300 text-lg font-semibold">SUPPORT</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="hover:text-cyan-300 cursor-pointer transition">
              Contact
            </li>
            <li className="hover:text-cyan-300 cursor-pointer transition">
              Payments
            </li>
            <li className="hover:text-cyan-300 cursor-pointer transition">
              FAQ
            </li>
            <li className="hover:text-cyan-300 cursor-pointer transition">
              Terms & Service
            </li>
          </ul>
        </div>

        {/* Get In Touch */}
        <div className="flex flex-col gap-4">
          <h3 className="text-cyan-300 text-lg font-semibold">GET IN TOUCH</h3>
          <ul className="space-y-2 text-gray-400">
            <li>+91-9876543210</li>
            <li>contact@neuralshop.com</li>
            <li>+1-123-456-7890</li>
            <li>support@neuralshop.com</li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/10"></div>

      {/* Bottom Section */}
      <div
        className="w-full py-5 text-center text-gray-400 text-sm"
        style={{ fontFamily: "Sora, sans-serif" }}
      >
        © {new Date().getFullYear()} NeuralShop — All Rights Reserved
      </div>
    </div>
  );
}

export default Footer;

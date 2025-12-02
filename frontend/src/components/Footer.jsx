import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import logo from "../assets/asset/logo.png";

function Footer() {
  const footerRef = useRef(null);

  // Smooth Vision Pro Entrance
  useEffect(() => {
    const el = footerRef.current;

    gsap.fromTo(
      el,
      { opacity: 0, y: 50, filter: "blur(12px)" },
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
    <footer
      ref={footerRef}
      className="
        w-full mt-auto
        bg-gradient-to-b from-[#020b0d] via-[#051619] to-[#000d11]
        border-t border-white/10 
        relative z-10 select-none
        overflow-hidden
        font-sora
      "
    >
      {/* Top Glow */}
      <div
        className="
        absolute top-0 left-1/2 -translate-x-1/2
        w-[70%] h-[150px]
        bg-cyan-400/10 blur-[130px]
        pointer-events-none
      "
      ></div>

      {/* Floating Blobs */}
      <div className="absolute -top-10 right-10 w-56 h-56 bg-cyan-500/10 blur-[110px] rounded-full"></div>
      <div className="absolute bottom-0 left-16 w-64 h-64 bg-teal-400/10 blur-[120px] rounded-full"></div>

      {/* FIXED & PERFECT GRID */}
      <div
        className="
          w-full max-w-[1300px] mx-auto 
          py-14 px-6 md:px-12 lg:px-16

          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
          gap-10
          auto-rows-auto
          place-items-start
        "
      >
        {/* Brand Column */}
        <div className="flex flex-col gap-5 min-w-[200px]">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="NeuralShop"
              className="w-14 h-14 md:w-16 md:h-16 transition-transform duration-500 hover:scale-105"
            />
            <p className="text-cyan-300 text-2xl font-semibold tracking-wide">
              NeuralShop
            </p>
          </div>

          <p className="text-gray-400 leading-relaxed text-[15px] max-w-[270px]">
            Where innovation meets shopping — premium products, smooth
            experiences, and lightning-fast delivery.
          </p>
        </div>

        {/* Company Column */}
        <div className="flex flex-col gap-5 min-w-[200px]">
          <h3 className="text-cyan-300 text-lg font-semibold tracking-wide">
            COMPANY
          </h3>

          <ul className="space-y-2 text-gray-400 text-[15px]">
            {["Home", "About Us", "Delivery", "Privacy Policy"].map((item) => (
              <li
                key={item}
                className="
                    hover:text-cyan-300 
                    cursor-pointer 
                    transition-all duration-300 
                    hover:translate-x-1
                  "
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Support Column */}
        <div className="flex flex-col gap-5 min-w-[200px]">
          <h3 className="text-cyan-300 text-lg font-semibold tracking-wide">
            SUPPORT
          </h3>

          <ul className="space-y-2 text-gray-400 text-[15px]">
            {["Contact", "Payments", "FAQ", "Terms & Service"].map((item) => (
              <li
                key={item}
                className="
                  hover:text-cyan-300 cursor-pointer 
                  transition-all duration-300 hover:translate-x-1
                "
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Column */}
        <div className="flex flex-col gap-5 min-w-[200px]">
          <h3 className="text-cyan-300 text-lg font-semibold tracking-wide">
            GET IN TOUCH
          </h3>

          <ul className="space-y-2 text-gray-400 text-[15px]">
            <li>+91-9876543210</li>
            <li>contact@neuralshop.com</li>
            <li>+1-123-456-7890</li>
            <li>support@neuralshop.com</li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/10"></div>

      {/* Bottom Bar */}
      <div className="w-full py-6 text-center text-gray-400 text-sm font-light tracking-wide">
        © {new Date().getFullYear()} NeuralShop — All Rights Reserved
      </div>
    </footer>
  );
}

export default Footer;

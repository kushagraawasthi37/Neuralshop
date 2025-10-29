import React from "react";
import logo from "../assets/asset/logo.png";

function Footer() {
  return (
    <div className="w-full mb-[38px] md:mb-0 md:h-[36vh] h-[auto] mt-auto bg-gradient-to-l from-[#141414] to-[#0c2025] flex flex-col justify-between select-none">
      <div className="w-full md:h-[30vh] h-auto bg-[#1a2733cc] flex flex-wrap md:flex-nowrap items-center justify-center md:justify-between px-6 md:px-16 py-6 md:py-0 gap-6 md:gap-0">
        
        {/* Logo and Info */}
        <div className="md:w-1/3 w-full flex flex-col items-start justify-center gap-3">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="NeuralShop"
              className="w-15 h-15 md:w-20 md:h-20"
            />
            <p className="text-yellow-400 text-lg md:text-xl font-semibold select-text">
              NeuralShop
            </p>
          </div>
          <p className="hidden md:block text-gray-400 text-sm md:text-base leading-relaxed max-w-[20rem]">
            NeuralShop is your all-in-one online shopping destination, offering
            top-quality products, unbeatable deals, and fast delivery—all backed
            by trusted service designed to make your life easier every day.
          </p>
          <p className="md:hidden text-gray-400 text-sm select-text">
            Fast. Easy. Reliable. NeuralShop Shopping
          </p>
        </div>

        {/* Company Links */}
        <div className="md:w-1/4 w-1/2 flex flex-col items-center md:items-start justify-center gap-3">
          <p className="text-teal-400 text-lg md:text-xl font-semibold">
            COMPANY
          </p>
          <ul className="text-gray-400 text-sm space-y-1 text-center md:text-left w-full">
            <li className="cursor-pointer hover:text-teal-400 transition-colors">
              Home
            </li>
            <li className="cursor-pointer hover:text-teal-400 transition-colors">
              About us
            </li>
            <li className="cursor-pointer hover:text-teal-400 transition-colors hidden md:block">
              Delivery
            </li>
            <li className="cursor-pointer hover:text-teal-400 transition-colors">
              Privacy Policy
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="md:w-1/4 w-1/2 flex flex-col items-center md:items-start justify-center gap-3">
          <p className="text-teal-400 text-lg md:text-xl font-semibold">
            GET IN TOUCH
          </p>
          <ul className="text-gray-400 text-sm space-y-1 text-center md:text-left w-full">
            <li>+91-9876543210</li>
            <li>contact@NeuralShop.com</li>
            <li className="hidden md:block">+1-123-456-7890</li>
            <li className="hidden md:block">admin@NeuralShop.com</li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-[1px] bg-slate-600 opacity-40"></div>

      {/* Copyright */}
      <div className="w-full h-[5vh] bg-[#1a2733cc] flex items-center justify-center text-gray-400 text-xs md:text-sm select-text">
        © 2025 NeuralShop - All Rights Reserved
      </div>
    </div>
  );
}

export default Footer;

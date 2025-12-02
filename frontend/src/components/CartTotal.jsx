import React, { useContext, useEffect, useRef } from "react";
import { shopDataContext } from "../context/ShopContext";
import Title from "./Title";
import gsap from "gsap";

function CartTotal() {
  const { currency, delivery_fee, getCartAmount } = useContext(shopDataContext);

  // --- SAME LOGIC ---
  const subtotal = getCartAmount();
  const total = subtotal === 0 ? 0 : subtotal + delivery_fee;

  const boxRef = useRef(null);

  // Smooth reveal animation
  useEffect(() => {
    if (boxRef.current) {
      gsap.from(boxRef.current, {
        opacity: 0,
        y: 30,
        scale: 0.96,
        duration: 0.7,
        ease: "power3.out",
      });
    }
  }, []);

  return (
    <div className="w-full">
      <div>
        <Title text1={"CART"} text2={"TOTAL"} />
      </div>

      <div
        ref={boxRef}
        className="
          flex flex-col gap-3 text-sm 
          bg-[#232a36]/60 backdrop-blur-xl 
          rounded-2xl shadow-xl 
          border border-cyan-400/30 
          px-4 py-4 sm:px-7 sm:py-6
          
          transition-all duration-500 
          hover:border-cyan-300/60
          hover:shadow-[0_0_30px_rgba(0,255,255,0.15)]
        "
      >
        {/* Subtotal */}
        <div className="flex justify-between items-center text-white text-base">
          <span className="opacity-90">Subtotal</span>
          <span className="font-medium text-cyan-100">
            {currency} {subtotal}.00
          </span>
        </div>

        <div className="border-b border-cyan-300/30"></div>

        {/* Shipping */}
        <div className="flex justify-between items-center text-white text-base">
          <span className="opacity-90">Shipping Fee</span>
          <span className="font-medium text-cyan-100">
            {currency} {delivery_fee}
          </span>
        </div>

        <div className="border-b border-cyan-300/30"></div>

        {/* Total */}
        <div className="flex justify-between items-center text-white font-bold text-lg">
          <span>Total</span>
          <span className="text-cyan-200">
            {currency} {total}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CartTotal;

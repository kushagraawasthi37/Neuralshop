import React, { useRef, useEffect, useContext } from "react";
import { shopDataContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

export default function Card({ id, name, image, price }) {
  const navigate = useNavigate();
  const { currency } = useContext(shopDataContext);

  const cardRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const img = imgRef.current;

    // Intro animation
    gsap.from(card, {
      opacity: 0,
      y: 40,
      scale: 0.9,
      duration: 0.8,
      ease: "power3.out",
    });

    // Soft hover scale
    const enter = () => {
      gsap.to(card, {
        scale: 1.03,
        duration: 0.4,
        ease: "power3.out",
      });

      gsap.to(img, {
        scale: 1.1,
        duration: 0.4,
        ease: "power3.out",
      });
    };

    const leave = () => {
      gsap.to(card, {
        scale: 1,
        duration: 0.4,
        ease: "power3.out",
      });

      gsap.to(img, {
        scale: 1,
        duration: 0.4,
        ease: "power3.out",
      });
    };

    card.addEventListener("mouseenter", enter);
    card.addEventListener("mouseleave", leave);

    return () => {
      card.removeEventListener("mouseenter", enter);
      card.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(`/productdetail/${id}`)}
      className="
        w-[300px] h-[420px] rounded-2xl bg-[#141821] cursor-pointer
        border border-white/10 overflow-hidden shadow-lg
        transition-all duration-500 
        hover:shadow-[0_0_45px_rgba(0,255,255,0.25)]
        hover:border-cyan-300/30
      "
    >
      <div className="w-full h-[65%] overflow-hidden">
        <img
          ref={imgRef}
          src={image}
          className="w-full h-full object-cover transition-all"
        />
      </div>

      <div className="px-4 py-4">
        <div className="text-[#c3f6fa] font-semibold text-lg truncate">
          {name}
        </div>
        <div className="text-[#f3fafa] mt-1 text-base">
          {currency}
          {price}
        </div>
      </div>
    </div>
  );
}

import React, { useContext } from "react";
import { shopDataContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";

function Card({ name, id, price, image }) {
  const navigate = useNavigate();
  const { currency } = useContext(shopDataContext);

  return (
    <div
      onClick={() => navigate(`/productdetail/${id}`)}
      className="w-[300px] sm:w-[250px] md:w-[280px] lg:w-[300px] h-[400px] bg-[#1a1f2e] rounded-2xl p-3 flex flex-col items-start justify-start cursor-pointer border border-white/10
                 backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.4)]
                 transform transition-transform duration-500 hover:scale-[1.04] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]"
    >
      <div className="w-full h-[70%] rounded-xl overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
        />
      </div>

      <div className="mt-3 flex flex-col w-full">
        <div className="text-[#c3f6fa] font-semibold text-[16px] md:text-[18px] truncate">
          {name}
        </div>
        <div className="text-[#f3fafa] text-[14px] mt-1 font-medium">
          {currency}
          {price}
        </div>
      </div>
    </div>
  );
}

export default Card;

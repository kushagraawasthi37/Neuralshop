import React from "react";
import img1 from "../assets/asset/back3.jpg";
import img2 from "../assets/asset/back1.jpg";
import img3 from "../assets/asset/back2.jpg";
import img4 from "../assets/asset/back4.jpg";

function Backgound({ heroCount }) {
  const imgs = [img1, img2, img3, img4];
  return (
    <div className="relative w-full h-full">
      <img
        src={imgs[heroCount]}
        alt=""
        className="w-full h-full object-cover brightness-[0.9] contrast-[1.1] transition-all duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f]/60 via-[#141b2e]/40 to-[#1a223a]/50"></div>
    </div>
  );
}

export default Backgound;

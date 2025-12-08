import React, { useEffect, useRef } from "react";
import gsap from "gsap";

import img1 from "../assets/asset/back1.jpg";
import img2 from "../assets/asset/back2.jpg";
import img3 from "../assets/asset/back3.jpg";
import img4 from "../assets/asset/back4.jpg";

export default function Backgound({ heroCount }) {
  const imgs = [img1, img2, img3, img4];

  const bgRef = useRef(null);

  // Cinematic fade + zoom effect
  useEffect(() => {
    const bg = bgRef.current;

    // Fade + slight zoom in
    gsap.fromTo(
      bg,
      { opacity: 0, scale: 1.1 },
      {
        opacity: 1,
        scale: 1.02,
        duration: 2,
        ease: "power3.out",
      }
    );

    // Slow breathing zoom
    gsap.to(bg, {
      scale: 1.05,
      duration: 6,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
  }, [heroCount]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Image */}
      <img
        ref={bgRef}
        key={heroCount}
        src={imgs[heroCount]}
        alt=""
        className="w-full h-full object-cover brightness-[0.9] contrast-[1.1]"
      />

      {/* Cinematic Dark Gradient Overlay */}
      <div
        className="
          absolute inset-0 
          bg-gradient-to-br from-[#05070c]/70 via-[#0e1322]/50 to-[#1a223a]/60
        "
      />

      {/* Vignette */}
      <div
        className="
          absolute inset-0
          bg-[radial-gradient(circle,transparent,rgba(0,0,0,0.45))]
          pointer-events-none
        "
      />
    </div>
  );
}

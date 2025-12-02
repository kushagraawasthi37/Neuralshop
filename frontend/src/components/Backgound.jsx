import React, { useEffect, useRef } from "react";
import gsap from "gsap";

import img1 from "../assets/asset/back3.jpg";
import img2 from "../assets/asset/back1.jpg";
import img3 from "../assets/asset/back2.jpg";
import img4 from "../assets/asset/back4.jpg";

export default function Backgound({ heroCount }) {
  const imgs = [img1, img2, img3, img4];

  const bgRef = useRef(null);
  const imgRef = useRef(null);

  // Smooth crossfade on heroCount update
  useEffect(() => {
    const bg = imgRef.current;

    gsap.fromTo(
      bg,
      { opacity: 0, scale: 1.08 },
      {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "power3.out",
      }
    );
  }, [heroCount]);

  // Parallax mouse movement
  useEffect(() => {
    const bg = bgRef.current;

    const move = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;

      gsap.to(bg, {
        x,
        y,
        duration: 1.2,
        ease: "power3.out",
      });
    };

    window.addEventListener("mousemove", move);

    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      ref={bgRef}
      className="
        relative w-full h-full overflow-hidden 
        transform-gpu will-change-transform
      "
    >
      {/* Background Image */}
      <img
        ref={imgRef}
        key={heroCount}
        src={imgs[heroCount]}
        alt=""
        className="
          w-full h-full object-cover 
          brightness-[0.9] contrast-[1.15]
          transition-all duration-700
          will-change-transform
        "
      />

      {/* Cinematic Gradient Overlay */}
      <div
        className="
          absolute inset-0 
          bg-gradient-to-br 
          from-[#05070c]/70 
          via-[#0e1322]/50 
          to-[#1a223a]/60
        "
      ></div>

      {/* Ambient Holographic Glow */}
      <div
        className="
          absolute inset-0 pointer-events-none
          bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,255,0.07),transparent_60%)]
        "
      ></div>
    </div>
  );
}

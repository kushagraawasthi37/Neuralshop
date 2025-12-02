// BestSeller.jsx
import React, { useContext, useEffect, useState, useRef } from "react";
import Title from "./Title";
import { shopDataContext } from "../context/ShopContext";
import Card3D from "./Card";
import gsap from "gsap";

function BestSeller() {
  const { products } = useContext(shopDataContext);
  const [bestSeller, setBestSeller] = useState([]);
  const gridRef = useRef(null);
  const spotlightRef = useRef(null);

  useEffect(() => {
    const filtered = (products || []).filter((p) => p.bestseller);
    setBestSeller(filtered.slice(0, 8));
  }, [products]);

  // Magnetic grid: cards move slightly based on cursor
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = () => Array.from(grid.querySelectorAll(".bs-card-wrap"));

    const handleMove = (e) => {
      const rect = grid.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Move spotlight
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      }

      cards().forEach((c) => {
        const r = c.getBoundingClientRect();
        const dx = mouseX - (r.left + r.width / 2);
        const dy = mouseY - (r.top + r.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = Math.max(0, 1 - dist / 800); // falloff
        gsap.to(c, {
          x: (dx / 20) * force,
          y: (dy / 30) * force,
          rotateX: (dy / r.height) * 2 * force,
          rotateY: -(dx / r.width) * 2 * force,
          duration: 0.6,
          ease: "power3.out",
        });
      });
    };

    const handleLeave = () => {
      cards().forEach((c) => {
        gsap.to(c, {
          x: 0,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          duration: 0.8,
          ease: "power3.out",
        });
      });
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate(-9999px,-9999px)`;
      }
    };

    grid.addEventListener("mousemove", handleMove);
    grid.addEventListener("mouseleave", handleLeave);

    return () => {
      grid.removeEventListener("mousemove", handleMove);
      grid.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <section
      ref={gridRef}
      className="relative w-full min-h-screen py-20 px-6 bg-gradient-to-br from-[#020202] via-[#051619] to-[#000d11] overflow-visible"
    >
      {/* glowing blobs (same vibe as About) */}
      <div className="pointer-events-none absolute top-12 left-10 w-72 h-72 bg-cyan-400/10 blur-[120px] rounded-full"></div>
      <div className="pointer-events-none absolute bottom-16 right-16 w-96 h-96 bg-teal-500/10 blur-[150px] rounded-full"></div>

      {/* title */}
      <div className="text-center mb-8">
        <Title text1={"BEST"} text2={"SELLER"} />
        <p className="mt-2 text-blue-100 text-sm md:text-lg max-w-2xl mx-auto">
          Tried, Tested, Loved — Discover Our All-Time Best Sellers.
        </p>
      </div>

      {/* cursor spotlight (DOM overlay) */}
      <div
        ref={spotlightRef}
        style={{
          position: "fixed",
          top: -9999,
          left: -9999,
          width: 300,
          height: 300,
          pointerEvents: "none",
          transform: "translate(-9999px,-9999px)",
          transition: "transform 0.12s linear",
          zIndex: 60,
          mixBlendMode: "screen",
        }}
        className="rounded-full bg-[radial-gradient(closest-side,rgba(0,255,255,0.10),transparent)]"
      />

      {/* grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
        {bestSeller.map((p, i) => (
          <div key={p._id || i} className="bs-card-wrap will-change-transform">
            <Card3D
              name={p.name}
              id={p._id}
              price={p.price}
              image={p.image1}
              modelUrl={p.modelUrl} // optional GLTF/GLB url if available
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default BestSeller;

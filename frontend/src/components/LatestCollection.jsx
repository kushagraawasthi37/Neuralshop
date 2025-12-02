import React, { useContext, useEffect, useState, useRef } from "react";
import Title from "./Title";
import { shopDataContext } from "../context/ShopContext";
import Card from "./Card";
import gsap from "gsap";

function LatestCollection() {
  const { products } = useContext(shopDataContext);
  const [LatestProducts, setLatestProducts] = useState([]);

  const gridRef = useRef(null);
  const spotlightRef = useRef(null);

  // Same logic
  useEffect(() => {
    if (products.length > 0) {
      setLatestProducts(products.slice(0, 8));
    }
  }, [products]);

  // Smooth card entry animation
  useEffect(() => {
    gsap.from(".latest-card", {
      opacity: 0,
      y: 40,
      scale: 0.95,
      duration: 1,
      stagger: 0.12,
      ease: "power3.out",
    });
  }, [LatestProducts]);

  // --- Magnetic grid (same as BestSeller) ---
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = () => Array.from(grid.querySelectorAll(".latest-card"));

    const handleMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Smooth spotlight movement
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          x: mouseX,
          y: mouseY,
          duration: 0.18,
          ease: "power2.out",
        });
      }

      cards().forEach((c) => {
        const r = c.getBoundingClientRect();
        const dx = mouseX - (r.left + r.width / 2);
        const dy = mouseY - (r.top + r.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = Math.max(0, 1 - dist / 800);

        gsap.to(c, {
          x: (dx / 22) * force,
          y: (dy / 28) * force,
          rotateX: (dy / r.height) * 2 * force,
          rotateY: -(dx / r.width) * 2 * force,
          duration: 0.55,
          ease: "power3.out",
          overwrite: true,
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
          duration: 0.7,
          ease: "power3.out",
        });
      });

      gsap.to(spotlightRef.current, {
        x: -500,
        y: -500,
        duration: 0.4,
      });
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
      className="
        w-full py-20 px-6 
        bg-gradient-to-br from-[#020202] via-[#051619] to-[#000d11]
        relative
      "
    >
      {/* Glow blobs */}
      <div className="pointer-events-none absolute top-10 left-10 w-72 h-72 bg-cyan-400/10 blur-[120px] rounded-full"></div>
      <div className="pointer-events-none absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 blur-[150px] rounded-full"></div>

      {/* Spotlight */}
      <div
        ref={spotlightRef}
        className="pointer-events-none fixed top-0 left-0 w-[300px] h-[300px] rounded-full
        bg-[radial-gradient(closest-side,rgba(0,255,255,0.10),transparent)] mix-blend-screen"
        style={{
          transform: "translate(-9999px,-9999px)",
          transition: "transform 0.12s linear",
          zIndex: 50,
        }}
      />

      {/* Title */}
      <div className="text-center mb-8">
        <Title text1={"LATEST"} text2={"COLLECTION"} />
        <p className="mt-2 text-blue-100 text-sm md:text-lg max-w-2xl mx-auto">
          Step Into Style — New Collection Dropping This Season!
        </p>
      </div>

      {/* GRID (same as BestSeller) */}
      <div
        className="
          max-w-7xl mx-auto 
          grid grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-3 
          xl:grid-cols-4 
          gap-12

          justify-center sm:justify-center lg:justify-start
          place-items-center sm:place-items-center md:place-items-start
        "
      >
        {LatestProducts.map((item, i) => (
          <div key={i} className="latest-card will-change-transform">
            <Card
              name={item.name}
              id={item._id}
              price={item.price}
              image={item.image1}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default LatestCollection;

import React, { useContext, useEffect, useState, useRef } from "react";
import { shopDataContext } from "../context/ShopContext";
import Title from "./Title";
import Card3D from "./Card";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(ScrollTrigger, Draggable);

function BestSeller() {
  const { products } = useContext(shopDataContext);
  const [bestSeller, setBestSeller] = useState([]);

  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const spotlightRef = useRef(null);
  const containerRef = useRef(null);

  // Duplicate for infinite scrolling
  useEffect(() => {
    const filtered = products?.filter((p) => p.bestseller) || [];
    setBestSeller([...filtered, ...filtered, ...filtered]);
  }, [products]);

  // BORDER GLOW (Same as LatestCollection but GREEN)
  useEffect(() => {
    const box = containerRef.current;

    gsap.set(box, { borderColor: "rgba(50,255,180,0.10)" }); // initial faint green

    const enter = () =>
      gsap.to(box, {
        borderColor: "#11ff88",
        duration: 0.12,
        ease: "power2.out",
      });

    const leave = () =>
      gsap.to(box, {
        borderColor: "rgba(50,255,180,0.01)",
        duration: 0.2,
        ease: "power2.out",
      });

    box.addEventListener("mouseenter", enter);
    box.addEventListener("mouseleave", leave);

    return () => {
      box.removeEventListener("mouseenter", enter);
      box.removeEventListener("mouseleave", leave);
    };
  }, []);

  // SPOTLIGHT (same behavior as LatestCollection)
  useEffect(() => {
    const box = containerRef.current;
    const spot = spotlightRef.current;

    const move = (e) => {
      const r = box.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;

      if (x >= 0 && x <= r.width && y >= 0 && y <= r.height) {
        spot.style.opacity = 1;
        spot.style.transform = `translate(${x - 250}px, ${y - 250}px)`;
      } else spot.style.opacity = 0;
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Infinite Smooth Auto Scroll (Lag Fixed)
  useEffect(() => {
    const track = trackRef.current;
    const wrapper = wrapperRef.current;
    if (!track || !wrapper) return;

    let totalWidth = 0;
    let resizeObserver;

    const calculateWidth = () => {
      gsap.set(track, { x: 0 });

      const minTrackWidth = wrapper.offsetWidth * 1.5;
      if (track.scrollWidth < minTrackWidth) {
        track.style.minWidth = `${minTrackWidth}px`;
      }

      totalWidth = track.scrollWidth / 3;
    };

    calculateWidth();
    setTimeout(() => calculateWidth(), 150);

    const loop = gsap.to(track, {
      x: () => `-${totalWidth}`,
      duration: 18,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: (x) => `${parseFloat(x) % -totalWidth}px`,
      },
    });

    wrapper.addEventListener("mouseenter", () => loop.timeScale(0.35));
    wrapper.addEventListener("mouseleave", () => loop.timeScale(1));

    resizeObserver = new ResizeObserver(() => calculateWidth());
    resizeObserver.observe(wrapper);

    return () => {
      loop.kill();
      resizeObserver.disconnect();
    };
  }, [bestSeller]);

  // Draggable Track (same as LatestCollection)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let totalWidth = track.scrollWidth / 3;

    setTimeout(() => (totalWidth = track.scrollWidth / 3), 150);

    Draggable.create(track, {
      type: "x",
      inertia: true,
      edgeResistance: 0.8,
      onDrag() {
        const x = gsap.getProperty(track, "x");
        if (x <= -totalWidth) gsap.set(track, { x: x + totalWidth });
        if (x > 0) gsap.set(track, { x: x - totalWidth });
      },
      onThrowUpdate() {
        const x = gsap.getProperty(track, "x");
        if (x <= -totalWidth) gsap.set(track, { x: x + totalWidth });
        if (x > 0) gsap.set(track, { x: x - totalWidth });
      },
    });
  }, [bestSeller]);

  return (
    <section className="relative py-12 px-4 flex justify-center">
      <div
        ref={containerRef}
        className="
          w-full max-w-[1400px] relative overflow-hidden
          border rounded-3xl 
bg-[#101B1E]          transition-all duration-500
        "
      >
        {/* SPOTLIGHT */}
        <div
          ref={spotlightRef}
          className="
            absolute w-[500px] h-[500px] rounded-full opacity-0 pointer-events-none
            bg-[radial-gradient(circle,rgba(0,255,150,0.45),rgba(0,255,150,0.15),transparent)]
            blur-[140px]
          "
          style={{ top: 0, left: 0, transition: "opacity 0.12s linear" }}
        />

        {/* Title */}
        <div className="text-center pt-10">
          <Title text1="BEST" text2="SELLER" />
          <p className="text-blue-100 mt-2 max-w-2xl mx-auto">
            Tried, Tested, Loved — Discover Our All-Time Best Sellers.
          </p>
        </div>

        {/* Horizontal Scroll */}
        <div ref={wrapperRef} className="overflow-hidden py-16 cursor-grab">
          <div
            ref={trackRef}
            className="flex gap-10 w-max min-w-[150%] select-none relative z-20"
          >
            {bestSeller.map((p, i) => (
              <div
                key={i}
                className="relative min-w-[300px] rounded-3xl overflow-hidden"
              >
                {/* Reflection */}
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.22),transparent)] opacity-40" />

                {/* Glow under card */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-10 bg-[radial-gradient(circle,rgba(0,255,150,0.25),transparent)] blur-2xl" />

                <Card3D
                  id={p._id}
                  name={p.name}
                  price={p.price}
                  image={p.image1}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`::-webkit-scrollbar { display: none }`}</style>
    </section>
  );
}

export default BestSeller;

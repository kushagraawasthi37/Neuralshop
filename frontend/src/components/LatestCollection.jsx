import React, { useContext, useEffect, useState, useRef } from "react";
import Title from "./Title";
import { shopDataContext } from "../context/ShopContext";
import Card from "./Card";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(ScrollTrigger, Draggable);

function LatestCollection() {
  const { products } = useContext(shopDataContext);
  const [items, setItems] = useState([]);

  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const spotlightRef = useRef(null);
  const containerRef = useRef(null);

  // ---------------------------------------
  // Duplicate products for infinite loop
  // ---------------------------------------
  useEffect(() => {
    const slice = (products || []).slice(0, 8);
    setItems([...slice, ...slice, ...slice]);
  }, [products]);

  // ---------------------------------------
  // Smooth border glow on hover (FIX)
  // ---------------------------------------
  useEffect(() => {
    const box = containerRef.current;

    gsap.set(box, { borderColor: "rgba(255,150,40,0.15)" });

    const enter = () =>
      gsap.to(box, {
        borderColor: "#e0953e",
        duration: 0.1,
        ease: "power2.out",
      });

    const leave = () =>
      gsap.to(box, {
        borderColor: "rgba(255,150,40,0.01)",
        duration: 0.1,
        ease: "power2.out",
      });

    box.addEventListener("mouseenter", enter);
    box.addEventListener("mouseleave", leave);

    return () => {
      box.removeEventListener("mouseenter", enter);
      box.removeEventListener("mouseleave", leave);
    };
  }, []);

  // ---------------------------------------
  // Spotlight Movement
  // ---------------------------------------
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
      } else {
        spot.style.opacity = 0;
      }
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // ---------------------------------------
  // Infinite Horizontal Auto Scroll (LAG FIXED)
  // ---------------------------------------
  useEffect(() => {
    const track = trackRef.current;
    const wrapper = wrapperRef.current;
    if (!track || !wrapper) return;

    let totalWidth = 0;
    let resizeObserver;

    const calculateWidth = () => {
      // Make sure browser has fully painted the DOM
      gsap.set(track, { x: 0 });

      // Force track to expand on small screens
      const minTrackWidth = wrapper.offsetWidth * 1.5;
      if (track.scrollWidth < minTrackWidth) {
        track.style.minWidth = `${minTrackWidth}px`;
      }

      totalWidth = track.scrollWidth / 3;
    };

    // FIRST calculation after render
    calculateWidth();

    // SECOND calculation after slight delay → FIXES LAG
    setTimeout(() => calculateWidth(), 150);

    // Auto-scroll loop
    const loop = gsap.to(track, {
      x: () => `-${totalWidth}`,
      duration: 18,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: (x) => `${parseFloat(x) % -totalWidth}px`,
      },
    });

    // Slow on hover
    wrapper.addEventListener("mouseenter", () => loop.timeScale(0.35));
    wrapper.addEventListener("mouseleave", () => loop.timeScale(1));

    // Recalculate on window resize (SOLVES SMALL SCREEN issue)
    resizeObserver = new ResizeObserver(() => {
      calculateWidth();
    });
    resizeObserver.observe(wrapper);

    return () => {
      loop.kill();
      resizeObserver.disconnect();
    };
  }, [items]);

  // ---------------------------------------
  // Draggable Track (Small Screen SAFE)
  // ---------------------------------------
  useEffect(() => {
    const track = trackRef.current;
    const wrapper = wrapperRef.current;
    if (!track || !wrapper) return;

    let totalWidth = track.scrollWidth / 3;

    setTimeout(() => {
      totalWidth = track.scrollWidth / 3;
    }, 150);

    Draggable.create(track, {
      type: "x",
      inertia: true,
      edgeResistance: 0.8,
      onDrag() {
        let x = gsap.getProperty(track, "x");
        if (x <= -totalWidth) gsap.set(track, { x: x + totalWidth });
        if (x > 0) gsap.set(track, { x: x - totalWidth });
      },
      onThrowUpdate() {
        let x = gsap.getProperty(track, "x");
        if (x <= -totalWidth) gsap.set(track, { x: x + totalWidth });
        if (x > 0) gsap.set(track, { x: x - totalWidth });
      },
    });
  }, [items]);

  return (
    <section className="relative py-12 px-4 flex justify-center">
      <div
        ref={containerRef}
        className="
          w-full max-w-[1400px] relative overflow-hidden
          border rounded-3xl 
          bg-[#111B1D]
          transition-all duration-500
        "
      >
        {/* Spotlight */}
        <div
          ref={spotlightRef}
          className="
            absolute w-[500px] h-[500px] rounded-full opacity-0 pointer-events-none
            bg-[radial-gradient(circle,rgba(255,160,50,0.5),rgba(255,120,20,0.2),transparent)]
            blur-[140px]
          "
          style={{ top: 0, left: 0, transition: "opacity 0.1s linear" }}
        />

        {/* Title */}
        <div className="text-center pt-10">
          <Title text1="LATEST" text2="COLLECTION" />
          <p className="text-orange-200 mt-2 max-w-2xl mx-auto">
            Step Into Style — New Collection Dropping This Season!
          </p>
        </div>

        {/* Scroll Track */}
        <div ref={wrapperRef} className="overflow-hidden py-16 cursor-grab">
          <div
            ref={trackRef}
            className="flex gap-10 w-max min-w-[150%] select-none"
          >
            {items.map((p, idx) => (
              <div
                key={idx}
                className="relative min-w-[300px] rounded-3xl overflow-hidden"
              >
                {/* Reflection */}
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.22),transparent)] opacity-40 pointer-events-none" />

                {/* Glow */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-10 bg-[radial-gradient(circle,rgba(255,160,40,0.25),transparent)] blur-2xl" />

                <Card
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

      <style>{`::-webkit-scrollbar { display:none }`}</style>
    </section>
  );//
}

export default LatestCollection;

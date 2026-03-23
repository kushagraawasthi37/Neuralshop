import React, { useContext, useEffect, useState, useRef } from "react";
import Title from "./Title";
import { shopDataContext } from "../context/ShopContext";
import Card from "./Card";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

function LatestCollection() {
  const { products } = useContext(shopDataContext);
  const [items, setItems] = useState([]);

  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const spotlightRef = useRef(null);

  const xRef = useRef(0);
  const totalWidthRef = useRef(0);
  const pausedRef = useRef(false);

  /* ================= DATA ================= */
  useEffect(() => {
    const slice = (products || []).slice(0, 8);
    setItems([...slice, ...slice, ...slice]);
  }, [products]);

  /* ================= BORDER GLOW ================= */
  useEffect(() => {
    const box = containerRef.current;
    if (!box) return;

    gsap.set(box, { borderColor: "rgba(255,150,40,0.15)" });

    const enter = () =>
      gsap.to(box, {
        borderColor: "#e0953e",
        duration: 0.15,
        overwrite: "auto",
      });

    const leave = () =>
      gsap.to(box, {
        borderColor: "rgba(255,150,40,0.05)",
        duration: 0.25,
        overwrite: "auto",
      });

    box.addEventListener("mouseenter", enter);
    box.addEventListener("mouseleave", leave);

    return () => {
      box.removeEventListener("mouseenter", enter);
      box.removeEventListener("mouseleave", leave);
    };
  }, []);

  /* ================= SPOTLIGHT (GPU ONLY) ================= */
  useEffect(() => {
    const box = containerRef.current;
    const spot = spotlightRef.current;
    if (!box || !spot) return;

    const setX = gsap.quickSetter(spot, "x", "px");
    const setY = gsap.quickSetter(spot, "y", "px");
    const setOpacity = gsap.quickSetter(spot, "opacity");

    const move = (e) => {
      const r = box.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;

      if (x > 0 && x < r.width && y > 0 && y < r.height) {
        setOpacity(1);
        setX(x - 250);
        setY(y - 250);
      } else {
        setOpacity(0);
      }
    };

    box.addEventListener("mousemove", move);
    box.addEventListener("mouseleave", () => setOpacity(0));

    return () => box.removeEventListener("mousemove", move);
  }, []);

  /* ================= AUTO SCROLL (RAF / TICKER) ================= */
  useEffect(() => {
    const track = trackRef.current;
    const wrapper = wrapperRef.current;
    if (!track || !wrapper || items.length === 0) return;

    xRef.current = 0;
    pausedRef.current = false;
    totalWidthRef.current = track.scrollWidth / 3;

    const tick = () => {
      if (pausedRef.current) return;

      xRef.current -= 0.45; // speed
      if (xRef.current <= -totalWidthRef.current) {
        xRef.current += totalWidthRef.current;
      }

      gsap.set(track, { x: xRef.current });
    };

    gsap.ticker.add(tick);

    const pause = () => (pausedRef.current = true);
    const resume = () => (pausedRef.current = false);

    wrapper.addEventListener("mouseenter", pause);
    wrapper.addEventListener("mouseleave", resume);

    return () => {
      gsap.ticker.remove(tick);
      wrapper.removeEventListener("mouseenter", pause);
      wrapper.removeEventListener("mouseleave", resume);
    };
  }, [items]);

  /* ================= DRAG (SYNCED) ================= */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    Draggable.create(track, {
      type: "x",
      inertia: true,
      onPress() {
        pausedRef.current = true;
      },
      onRelease() {
        pausedRef.current = false;
      },
      onDrag() {
        let x = this.x;
        const total = totalWidthRef.current;

        if (x <= -total) x += total;
        if (x > 0) x -= total;

        xRef.current = x;
        gsap.set(track, { x });
      },
      onThrowUpdate() {
        let x = this.x;
        const total = totalWidthRef.current;

        if (x <= -total) x += total;
        if (x > 0) x -= total;

        xRef.current = x;
        gsap.set(track, { x });
      },
    });
  }, [items]);

  /* ================= UI ================= */
  return (
    <section className="relative py-12 px-4 flex justify-center">
      <div
        ref={containerRef}
        className="w-full max-w-[1400px] relative overflow-hidden border rounded-3xl bg-[#111B1D]"
      >
        {/* SPOTLIGHT */}
        <div
          ref={spotlightRef}
          className="absolute w-[500px] h-[500px] rounded-full opacity-0 pointer-events-none
          bg-[radial-gradient(circle,rgba(255,160,50,0.45),rgba(255,120,20,0.2),transparent)]
          blur-[90px]"
        />

        {/* TITLE */}
        <div className="text-center pt-10">
          <Title text1="LATEST" text2="COLLECTION" />
          <p className="text-orange-200 mt-2 max-w-2xl mx-auto">
            Step Into Style — New Collection Dropping This Season!
          </p>
        </div>

        {/* SCROLLER */}
        <div ref={wrapperRef} className="overflow-hidden py-16 cursor-grab">
          <div
            ref={trackRef}
            className="flex gap-10 w-max min-w-[150%] will-change-transform select-none"
          >
            {items.map((p, idx) => (
              <div
                key={idx}
                className="relative min-w-[300px] rounded-3xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.22),transparent)] opacity-40 pointer-events-none" />
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
  );
}

export default LatestCollection;

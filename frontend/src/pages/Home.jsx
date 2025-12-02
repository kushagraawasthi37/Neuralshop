import React, { useEffect, useState, useRef } from "react";
import Nav from "../components/Nav";
import Backgound from "../components/Backgound";
import Hero from "../components/Hero";
import Product from "./Product";
import OurPolicy from "../components/OurPolicy";
import NewLetterBox from "../components/NewLetterBox";
import Footer from "../components/Footer";

import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function Home() {
  // ---------------- HERO TEXT ROTATION ----------------
  let heroData = [
    { text1: "30% OFF Limited Offer", text2: "Style that" },
    { text1: "Discover the Best of Bold Fashion", text2: "Limited Time Only!" },
    { text1: "Explore Our Best Collection ", text2: "Shop Now!" },
    { text1: "Choose your Perfect Fashion Fit", text2: "Now on Sale!" },
  ];

  let [heroCount, setHeroCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroCount((prev) => (prev === 3 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ---------------- SMOOTH SCROLL (LENIS) ----------------
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smooth: true,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  // ---------------- GSAP SCROLL ANIMATIONS ----------------
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sections = containerRef.current.querySelectorAll(".fade-section");

    sections.forEach((sec) => {
      gsap.fromTo(
        sec,
        { opacity: 0, y: 70 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sec,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }, []);

  return (
    <div className="min-h-screen" ref={containerRef}>
      <Nav />

      <div className="overflow-x-hidden relative top-[45px] md:top-[70px] bg-gradient-to-br from-[#10121a] via-[#1a1f2e] to-[#252940]">
        {/* HERO SECTION */}
        <div className="relative w-screen lg:h-screen md:h-[60vh] h-[30vh] rounded-b-8 overflow-hidden fade-section">
          <Backgound heroCount={heroCount} />

          <Hero
            heroCount={heroCount}
            setHeroCount={setHeroCount}
            heroData={heroData[heroCount]}
          />
        </div>

        {/* FADE-IN SECTIONS */}
        <div className="fade-section">
          <Product />
        </div>
        <div className="fade-section">
          <OurPolicy />
        </div>
        <div className="fade-section">
          <NewLetterBox />
        </div>
        <div className="fade-section">
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Home;

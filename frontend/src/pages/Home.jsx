import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import Nav from "../components/Nav";
import Backgound from "../components/Backgound";
import Hero from "../components/Hero";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";

/* LAZY LOAD HEAVY SECTIONS */
const Product = lazy(() => import("./Product"));
const OurPolicy = lazy(() => import("../components/OurPolicy"));
const NewLetterBox = lazy(() => import("../components/NewLetterBox"));
const Footer = lazy(() => import("../components/Footer"));

function Home() {
  const heroData = [
    { text1: "30% OFF Limited Offer", text2: "Style that" },
    { text1: "Discover the Best of Bold Fashion", text2: "Limited Time Only!" },
    { text1: "Explore Our Best Collection", text2: "Shop Now!" },
    { text1: "Choose your Perfect Fashion Fit", text2: "Now on Sale!" },
  ];

  const [heroCount, setHeroCount] = useState(0);
  const heroRef = useRef(null);
  const lenisRef = useRef(null);
  const startedRef = useRef(false);

  /* HERO TEXT ROTATION (SAFE) */
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroCount((p) => (p + 1) % heroData.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  /* HERO FADE IN (NO SCROLLTRIGGER) */
  useEffect(() => {
    gsap.from(heroRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power2.out",
    });
  }, []);

  /* START LENIS ONLY AFTER USER INTERACTION */
  useEffect(() => {
    const startLenis = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      const lenis = new Lenis({
        duration: 1,
        smooth: true,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });

      lenisRef.current = lenis;

      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };

      requestAnimationFrame(raf);
    };

    window.addEventListener("wheel", startLenis, { once: true });
    window.addEventListener("touchstart", startLenis, { once: true });

    return () => {
      window.removeEventListener("wheel", startLenis);
      window.removeEventListener("touchstart", startLenis);
      lenisRef.current?.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#10121a] via-[#1a1f2e] to-[#252940]">
      <Nav />

      {/* HERO */}
      <div
        ref={heroRef}
        className="relative top-[60px] w-screen lg:h-screen md:h-[60vh] h-[35vh]
        rounded-b-2xl overflow-hidden will-change-transform"
      >
        <Backgound heroCount={heroCount} />
        <Hero heroData={heroData[heroCount]} />
      </div>

      {/* BELOW CONTENT (LAZY) */}
      <Suspense fallback={<div className="h-[80vh]" />}>
        <Product />
        <OurPolicy />
        <NewLetterBox />
        <Footer />
      </Suspense>
    </div>
  );
}

export default Home;

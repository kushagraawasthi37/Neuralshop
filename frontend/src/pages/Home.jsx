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
  const heroData = [
    { text1: "30% OFF Limited Offer", text2: "Style that" },
    { text1: "Discover the Best of Bold Fashion", text2: "Limited Time Only!" },
    { text1: "Explore Our Best Collection ", text2: "Shop Now!" },
    { text1: "Choose your Perfect Fashion Fit", text2: "Now on Sale!" },
  ];

  const [heroCount, setHeroCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroCount((prev) => (prev === heroData.length - 1 ? 0 : prev + 1));
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

    let req = null;
    function raf(time) {
      lenis.raf(time);
      req = requestAnimationFrame(raf);
    }
    req = requestAnimationFrame(raf);

    return () => {
      if (req) cancelAnimationFrame(req);
      // lenis has no explicit destroy in v1; leaving GC to reclaim (no listeners kept)
    };
  }, []);

  // ---------------- GSAP + HERO 3D / PARALLAX / BREATHING SHADOW ----------------
  const containerRef = useRef(null);
  const heroRef = useRef(null); // root for all hero interactions
  const rafRef = useRef(null);
  const lastPos = useRef({ x: 0, y: 0, t: performance.now() });
  const vel = useRef({ x: 0, y: 0 });
  const accel = useRef(0);
  const smoothed = useRef({ tiltX: 0, tiltY: 0, scale: 1 });
  const gsapTL = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !heroRef.current) return;

    // Setup: GPU promotion styles
    const heroEl = heroRef.current;
    heroEl.style.willChange = "transform";
    heroEl.style.backfaceVisibility = "hidden";
    heroEl.style.transformStyle = "preserve-3d";
    heroEl.style.perspective = "1200px";

    // Parallax layers: any child with data-depth will be treated as a layer.
    // Ensure your Backgound/ Hero render elements with data-depth attributes,
    // e.g. <div data-depth="0.15" className="bg-layer" />
    const parallaxLayers = Array.from(
      heroEl.querySelectorAll("[data-depth]")
    ).map((el) => {
      el.style.willChange = "transform, opacity";
      el.style.backfaceVisibility = "hidden";
      return { el, depth: parseFloat(el.dataset.depth) || 0.05 };
    });

    // GSAP intro reveal (one timeline per mount)
    gsapTL.current = gsap.timeline();
    // hero intro: slide + fade + soft pop, stronger BG glow
    gsapTL.current
      .from(heroEl, {
        duration: 0.9,
        y: 20,
        autoAlpha: 0,
        ease: "power3.out",
        onStart: () => {
          // subtle initial shadow/pop
          heroEl.style.boxShadow = "0 6px 40px rgba(0,0,0,0.6)";
        },
      })
      .from(
        heroEl.querySelectorAll(".hero-content, .hero-title, .hero-cta"),
        {
          duration: 0.8,
          y: 24,
          autoAlpha: 0,
          stagger: 0.08,
          ease: "power3.out",
        },
        "-=0.6"
      );

    // Breathing ambient shadow - soft loop (use CSS var for intensity)
    const breath = gsap.to(heroEl, {
      boxShadow: "0 20px 80px rgba(0,255,255,0.03)",
      duration: 3.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      paused: false,
    });

    // Fade-in for page sections (uses ScrollTrigger)
    const sections = containerRef.current.querySelectorAll(".fade-section");
    sections.forEach((sec) => {
      gsap.fromTo(
        sec,
        { opacity: 0, y: 70 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sec,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Cursor physics - acceleration-based tilt + parallax
    const onMove = (e) => {
      const now = performance.now();
      const x =
        e.clientX || (e.touches && e.touches[0].clientX) || lastPos.current.x;
      const y =
        e.clientY || (e.touches && e.touches[0].clientY) || lastPos.current.y;
      const dt = Math.max(8, now - lastPos.current.t); // ms
      const vx = (x - lastPos.current.x) / dt; // px/ms
      const vy = (y - lastPos.current.y) / dt;
      // velocity smoothing
      vel.current.x = vel.current.x * 0.85 + vx * 0.15;
      vel.current.y = vel.current.y * 0.85 + vy * 0.15;

      // acceleration magnitude approximate
      const prevV = Math.hypot(vel.current.x, vel.current.y);
      const newV = Math.hypot(vx, vy);
      accel.current = Math.abs(newV - prevV) * 60; // scale to perceptible range

      lastPos.current = { x, y, t: now };
      // We'll pick up these values in RAF loop (to avoid heavy DOM ops per mouse event)
    };

    // Add listeners (passive where possible)
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });

    // RAF loop - apply transforms smoothly (lerp)
    const lerp = (a, b, t) => a + (b - a) * t;
    let lastTime = performance.now();

    const tick = () => {
      // target tilt based on cursor position relative to center
      const rect = heroEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const pointer = lastPos.current;
      // if pointer not set yet, keep center
      const dx = (pointer.x || cx) - cx;
      const dy = (pointer.y || cy) - cy;

      // normalized [-1,1]
      const nx = dx / (rect.width / 2);
      const ny = dy / (rect.height / 2);

      // velocity effect from vel and accel
      const vFactorX = vel.current.x * 30; // tweak multiplier for noticeable effect
      const vFactorY = vel.current.y * 30;
      const accelFactor = Math.min(1.6, accel.current); // clamp

      // target rotation degrees
      const targetTiltY = nx * 6 + vFactorX * 1.2 * accelFactor; // rotateY from cursor
      const targetTiltX = -ny * 6 + vFactorY * 1.2 * accelFactor; // rotateX (invert)

      // target scale slight pop on faster movement
      const targetScale = 1 + Math.min(0.06, Math.abs(accel.current) * 0.02);

      // lerp previous transform values
      smoothed.current.tiltX = lerp(smoothed.current.tiltX, targetTiltX, 0.12);
      smoothed.current.tiltY = lerp(smoothed.current.tiltY, targetTiltY, 0.12);
      smoothed.current.scale = lerp(smoothed.current.scale, targetScale, 0.08);

      // apply transform - use translateZ for subtle 3D depth
      heroEl.style.transform = `perspective(1200px) translate3d(0,0,0) rotateX(${smoothed.current.tiltX.toFixed(
        2
      )}deg) rotateY(${smoothed.current.tiltY.toFixed(
        2
      )}deg) scale(${smoothed.current.scale.toFixed(3)})`;

      // Parallax on layers
      parallaxLayers.forEach(({ el, depth }) => {
        const tx = -(vel.current.x * 120 * depth); // multiplier tuned for subtlety
        const ty = -(vel.current.y * 120 * depth);
        // small z translation for depth illusion
        const tz = depth * 8 * (smoothed.current.scale - 1);
        // lerp transforms per element for smoothing
        el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(
          2
        )}px, ${tz.toFixed(2)}px)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // Hover glow strengthening: add CSS var on hover (works if you add .hero-glow class)
    const onEnter = () => {
      heroEl.style.filter = "drop-shadow(0 12px 40px rgba(3, 218, 198, 0.12))";
    };
    const onLeave = () => {
      heroEl.style.filter = "";
    };
    heroEl.addEventListener("mouseenter", onEnter);
    heroEl.addEventListener("mouseleave", onLeave);

    // CLEANUP
    return () => {
      // kill RAF
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // remove listeners
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      heroEl.removeEventListener("mouseenter", onEnter);
      heroEl.removeEventListener("mouseleave", onLeave);
      // reset transforms & styles
      heroEl.style.transform = "";
      heroEl.style.willChange = "";
      heroEl.style.backfaceVisibility = "";
      // kill GSAP instances
      if (gsapTL.current) gsapTL.current.kill();
      breath.kill();
      // kill ScrollTriggers
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="min-h-screen" ref={containerRef}>
      <Nav />

      <div className="overflow-x-hidden relative top-[45px] md:top-[70px] bg-gradient-to-br from-[#10121a] via-[#1a1f2e] to-[#252940]">
        {/* HERO SECTION */}
        {/* Wrap the visual layers you'll want to parallax/tilt inside heroRef.
            Add `data-depth` attributes to any element inside Backgound or Hero you want to parallax.
            e.g. <div data-depth="0.18" className="bg-layer" />
            Also add classes like .hero-content, .hero-media inside these components for GSAP targeting. */}
        <div
          ref={heroRef}
          className="relative w-screen lg:h-screen md:h-[60vh] h-[30vh] rounded-b-8 overflow-hidden fade-section hero-root"
          aria-hidden="false"
          // small accessibility: allow keyboard focus for hover-like effect
          tabIndex={0}
        >
          {/* BACKGROUND should include layered elements with data-depth attributes */}
          <Backgound heroCount={heroCount} />

          {/* HERO content — ensure .hero-content and .hero-media inside for GSAP and parallax */}
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

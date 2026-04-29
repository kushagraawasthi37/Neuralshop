import { useEffect } from "react";

const INTERACTIVE_SELECTOR = 'a,button,input,textarea,select,[role="button"]';

export function useCursor() {
  useEffect(() => {
    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    const body = document.body;
    if (!dot || !ring || !body) return;

    let ringX = 0,
      ringY = 0;
    let mouseX = 0,
      mouseY = 0;
    let raf;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + "px";
      dot.style.top = mouseY + "px";
    };

    const onHover = (e) => {
      if (e.target.closest(INTERACTIVE_SELECTOR)) {
        body.classList.add("hovering");
      }
    };

    const onLeave = (e) => {
      if (e.target.closest(INTERACTIVE_SELECTOR)) {
        body.classList.remove("hovering");
      }
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onHover);
    window.addEventListener("mouseout", onLeave);
    window.addEventListener("focusin", onHover);
    window.addEventListener("focusout", onLeave);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onHover);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("focusin", onHover);
      window.removeEventListener("focusout", onLeave);
      cancelAnimationFrame(raf);
      body.classList.remove("hovering");
    };
  }, []);
}

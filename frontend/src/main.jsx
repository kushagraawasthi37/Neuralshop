import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import AuthContext from "./context/AuthContext.jsx";
import UserContext from "./context/UserContext.jsx";
import ShopContext from "./context/ShopContext.jsx";
import Lenis from "@studio-freight/lenis";

// Smooth Scroll Provider
function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smooth: true,
      easing: (x) => 1 - Math.pow(1 - x, 3),
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  return <>{children}</>;
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <SmoothScroll>
      <AuthContext>
        <UserContext>
          <ShopContext>
            <App />
          </ShopContext>
        </UserContext>
      </AuthContext>
    </SmoothScroll>
  </BrowserRouter>
);

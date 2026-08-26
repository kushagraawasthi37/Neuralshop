import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import App from "./App.jsx";
import Lenis from "lenis";

//smoothWheel->mouse-wheel scrolling smooth karta hai.
// lerp: 0.08 → scrolling interpolation/smoothness control karta hai. Lower value
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);


//React API that mount the React app on the root of actual html
createRoot(document.getElementById("root")).render(<App />);

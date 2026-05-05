import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import App from "./App.jsx";
import Lenis from "lenis";

const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

createRoot(document.getElementById("root")).render(<App />);

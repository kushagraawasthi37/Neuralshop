// Card3D.jsx (FINAL FIXED)
import React, {
  useRef,
  useEffect,
  useState,
  useContext,
  Suspense,
} from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { shopDataContext } from "../context/ShopContext";
import gsap from "gsap";
import { TextureLoader } from "three";
import * as THREE from "three";

// ------------------------------------------------------
// FALLBACK 3D MODEL WITH IMAGE (FULLY FIXED)
// ------------------------------------------------------

// FIXED Double-Sided Image Card
function ModelFallback({ img }) {
  const texture = useLoader(TextureLoader, img);

  const groupRef = useRef();
  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * 0.35;
  });

  return (
    <group ref={groupRef} scale={[1.4, 1.4, 1]}>
      {/* FRONT — Clean image */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[1.8, 2.2]} />
        <meshStandardMaterial map={texture} roughness={0.35} metalness={0.15} />
      </mesh>

      {/* BACK — Apple Vision Pro Style Frosted Glass */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.03]}>
        <planeGeometry args={[1.8, 2.2]} />
        <meshPhysicalMaterial
          map={texture} // same image
          transparent
          opacity={0.38} // frosted transparency
          roughness={0.94} // strong blur
          metalness={0.05}
          transmission={0.75} // glass-like translucency
          thickness={0.42} // depth refraction
          ior={1.45} // refractive index
          attenuationColor={"#8ffcff"} // soft cyan tint
          attenuationDistance={2.2}
        />
      </mesh>

      {/* Halo glow when rotating */}
      <mesh>
        <planeGeometry args={[2.3, 2.7]} />
        <meshBasicMaterial
          color={"#00eaff"}
          opacity={0.08}
          transparent
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ------------------------------------------------------
// GLTF 3D MODEL
// ------------------------------------------------------
function GLTFModel({ url }) {
  const { scene } = useGLTF(url);
  const ref = useRef();

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.6;
  });

  return <primitive ref={ref} object={scene} />;
}

// ------------------------------------------------------
// SCENE (FIXED TO ACCEPT IMAGE)
// ------------------------------------------------------
function Scene({ hovered, modelUrl, image }) {
  const group = useRef();

  useFrame((_, delta) => {
    group.current.rotation.y += delta * (hovered ? 0.9 : 0.25);
  });

  return (
    <group ref={group} rotation={[0.12, 0, 0]}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 6, 6]} intensity={0.5} />
      <pointLight position={[-5, -5, -5]} intensity={0.25} />

      <Suspense fallback={null}>
        {modelUrl ? (
          <GLTFModel url={modelUrl} />
        ) : (
          <ModelFallback img={image} /> // FIXED — Image passed
        )}
      </Suspense>
    </group>
  );
}

// ------------------------------------------------------
// MAIN CARD
// ------------------------------------------------------
export default function Card3D({ name, id, price, image, modelUrl }) {
  const navigate = useNavigate();
  const { currency } = useContext(shopDataContext);

  const wrapperRef = useRef(null);
  const shineRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  // ------------------------------------------------------
  // GSAP Glow
  // ------------------------------------------------------
  useEffect(() => {
    const el = wrapperRef.current;

    const enter = () =>
      gsap.to(el, {
        scale: 1.04,
        boxShadow: "0 0 25px rgba(0, 255, 255, 0.15)",
        duration: 0.4,
        ease: "power3.out",
      });

    const leave = () =>
      gsap.to(el, {
        scale: 1,
        boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
        duration: 0.5,
        ease: "power3.out",
      });

    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);

    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
    };
  }, []);

  // ------------------------------------------------------
  // Dynamic Shine
  // ------------------------------------------------------
  useEffect(() => {
    const card = wrapperRef.current;
    const shine = shineRef.current;

    const move = (e) => {
      const r = card.getBoundingClientRect();
      shine.style.transform = `translate(${e.clientX - r.left - 150}px, ${
        e.clientY - r.top - 150
      }px)`;
      shine.style.opacity = 0.25;
    };

    const leave = () => {
      shine.style.opacity = 0;
      shine.style.transform = `translate(-9999px,-9999px)`;
    };

    card.addEventListener("mousemove", move);
    card.addEventListener("mouseleave", leave);

    return () => {
      card.removeEventListener("mousemove", move);
      card.removeEventListener("mouseleave", leave);
    };
  }, []);

  // ------------------------------------------------------

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/productdetail/${id}`)}
      className="
        relative w-[300px] md:w-[280px] lg:w-[300px] h-[420px]
        rounded-2xl cursor-pointer overflow-hidden
        bg-[#1a1f2e] border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.4)]
        transition-all duration-300
      "
      style={{ perspective: "1200px" }}
    >
      {/* 3D Canvas */}
      <div className="w-full h-[66%]">
        <Canvas
          camera={{ position: [0, 0, 3.4], fov: 35 }}
          shadows
          dpr={[1, 2]}
        >
          <Scene hovered={hovered} modelUrl={modelUrl} image={image} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
        </Canvas>
      </div>

      {/* Shine */}
      <div
        ref={shineRef}
        className="absolute w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          top: "10%",
          left: "0%",
          background:
            "radial-gradient(circle, rgba(0,255,255,0.12), transparent 70%)",
          mixBlendMode: "screen",
          opacity: 0,
          transition: "opacity 0.25s ease, transform 0.12s ease",
        }}
      />

      {/* Text Section */}
      <div className="px-4 py-4">
        <div className="text-[#c3f6fa] font-semibold text-lg truncate">
          {name}
        </div>
        <div className="text-[#f3fafa] mt-1 text-base">
          {currency}
          {price}
        </div>
      </div>

      {/* Subtle Neon Border */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{ boxShadow: "inset 0 0 0 1px rgba(0,255,255,0.05)" }}
      />
    </div>
  );
}

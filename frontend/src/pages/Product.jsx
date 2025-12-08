import React, { useEffect, useRef } from "react";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import gsap from "gsap";

function Product() {
  const contentRef = useRef(null);

  useEffect(() => {
    // GSAP intro animation
    gsap.from(contentRef.current, {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });
  }, []);

  return (
    <div
      className="
        w-[100vw] min-h-[100vh] 
        bg-gradient-to-l from-[#141414] to-[#0c2025] 
        flex items-start justify-start flex-col 
        pt-[20px] px-2 md:px-6
      "
    >
      <div ref={contentRef} className="w-full flex flex-col  select-none">
        {/* Latest Collection Section */}
        <div className="w-full flex items-center justify-center">
          <LatestCollection />
        </div>

        {/* Best Seller Section */}
        <div className="w-full flex items-center justify-center">
          <BestSeller />
        </div>
      </div>
    </div>
  );
}

export default Product;

import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { shopDataContext } from "../context/ShopContext";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import RelatedProduct from "../components/RelatedProduct";
import Loading from "../components/Loading";
import gsap from "gsap";

function ProductDetail() {
  const { productId } = useParams();
  const {
    products,
    currency,
    addtoCart,
    productData,
    setProductData,
    size,
    setSize,
    loading,
  } = useContext(shopDataContext);

  const [image, setImage] = useState("");
  const [zoom, setZoom] = useState(false);

  const wrapperRef = useRef(null); // main rectangle
  const spotlightRef = useRef(null); // spotlight
  const targetAreaRef = useRef(null); // tracking area
  const imgRef = useRef(null);

  const sizeOrder = ["S", "M", "L", "XL", "XXL"];

  /* ------------------ Load Product ------------------ */
  useEffect(() => {
    const item = products.find((p) => p._id === productId);
    if (item) {
      setProductData(item);
      setImage(item.image1);
    }
  }, [productId, products]);

 /* ------------------ Border Glow FINAL FIX ------------------ */
useEffect(() => {
  const box = wrapperRef.current;
  if (!box) return;

  // Initial border set AFTER DOM paint
  const t = setTimeout(() => {
    gsap.set(box, { borderColor: "rgba(47,151,241,0.12)" });
  }, 10);

  const enter = () =>
    gsap.to(box, {
      borderColor: "#2f97f1",
      duration: 0.15,
      ease: "power2.out",
    });

  const leave = () =>
    gsap.to(box, {
      borderColor: "rgba(47,151,241,0.05)",
      duration: 0.15,
      ease: "power2.out",
    });

  box.addEventListener("mouseenter", enter);
  box.addEventListener("mouseleave", leave);

  return () => {
    clearTimeout(t);
    box.removeEventListener("mouseenter", enter);
    box.removeEventListener("mouseleave", leave);
  };
}, [productData]); // IMPORTANT


  /* ------------------ Spotlight FIXED (clipped & visible) ------------------ */
  /* ------------------ Spotlight FINAL FIXED ------------------ */
  useEffect(() => {
    if (!productData) return;

    const spot = spotlightRef.current;
    const area = targetAreaRef.current;
    if (!spot || !area) return;

    // delay ensures DOM is ready
    const timeout = setTimeout(() => {
      const move = (e) => {
        const rect = area.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

        spot.style.opacity = inside ? 1 : 0;
        if (inside) {
          spot.style.transform = `translate(${x - 250}px, ${y - 250}px)`;
        }
      };//

      window.addEventListener("mousemove", move);
      return () => window.removeEventListener("mousemove", move);
    }, 50);

    return () => clearTimeout(timeout);
  }, [productData]); // IMPORTANT

  if (!productData) return <Loading />;

  const sortedSizes = [...productData.sizes].sort(
    (a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b)
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-l from-[#141414] to-[#0c2025] text-white px-3 md:px-6 pt-24 pb-14 select-none">
      {/* MAIN BLUE RECTANGLE */}
      <div
        ref={wrapperRef}
        className="
          relative max-w-7xl mx-auto rounded-3xl 
          overflow-hidden  /* 🟦 spotlight clipped */
          border bg-[#111B1D]
          p-6 md:p-10 mb-16
        "
      >
        {/* SPOTLIGHT */}
        <div
          ref={spotlightRef}
          className="
            pointer-events-none absolute w-[520px] h-[520px] opacity-0 
            rounded-full blur-[160px]
            bg-[radial-gradient(circle,rgba(50,150,255,0.45),rgba(0,140,255,0.20),transparent)]
          "
          style={{
            top: 0,
            left: 0,
            zIndex: 0, // 🟦 spotlight stays behind
            transition: "opacity 0.15s linear",
          }}
        />

        {/* EVERYTHING ABOVE SPOTLIGHT */}
        <div ref={targetAreaRef} className="relative z-10">
          {/* MAIN GRID */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-10">
            {/* LEFT SIDE */}
            <div
              ref={imgRef}
              className="flex flex-col md:flex-row gap-6 items-center md:items-start"
            >
              {/* Thumbnails */}
              <div className="hidden md:flex flex-col gap-3 mt-2 h-[430px] min-w-[88px] w-[88px]">
                {[
                  productData.image1,
                  productData.image2,
                  productData.image3,
                  productData.image4,
                ]
                  .filter(Boolean)
                  .map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setImage(img)}
                      className={`
                        h-[calc(100%/4-0.75rem)] rounded-lg border cursor-pointer overflow-hidden transition-all
                        ${
                          img === image
                            ? "border-[#2f97f1] shadow-[0_0_10px_rgba(47,151,241,0.35)]"
                            : "border-[#2e3a43]"
                        }
                      `}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
              </div>

              {/* Main Image */}
              <div
                className={`relative w-full max-w-[430px] aspect-square rounded-xl border border-[#2e3a43]
                  bg-[#131a20] overflow-hidden shadow-lg transition-all duration-500
                  ${zoom ? "scale-[1.03]" : ""}
                `}
                onMouseEnter={() => setZoom(true)}
                onMouseLeave={() => setZoom(false)}
              >
                <img
                  src={image}
                  alt={productData.name}
                  className={`w-full h-full object-contain transition-transform duration-500 
                    ${zoom ? "scale-110" : ""}
                  `}
                />
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-col gap-5">
              <h1 className="text-2xl lg:text-3xl font-semibold capitalize">
                {productData.name}
              </h1>

              <div className="flex items-center gap-1 text-yellow-400">
                {[...Array(4)].map((_, i) => (
                  <FaStar key={i} />
                ))}
                <FaStarHalfAlt />
                <span className="text-white pl-1">(124 ratings)</span>
              </div>

              <p className="text-2xl font-bold">
                {currency} {productData.price}
              </p>

              <p className="text-gray-200">
                {productData.description ||
                  "Premium fabric with modern styling."}
              </p>

              {/* Sizes */}
              <div>
                <h2 className="text-lg font-semibold mb-2">Select Size</h2>
                <div className="flex flex-wrap gap-3">
                  {sortedSizes.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSize(s)}
                      className={`
                        px-4 py-2 rounded-md border font-medium transition-all
                        ${
                          s === size
                            ? "bg-[#2f97f1] text-white border-[#2f97f1]"
                            : "border-[#99b0d9] hover:bg-[#2f97f1] hover:text-white"
                        }
                      `}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={() => addtoCart(productData._id, size)}
                disabled={loading}
                className="px-10 py-3 rounded-lg font-semibold bg-gradient-to-r from-[#2f97f1] to-[#44c0f1]
                  hover:shadow-[0_0_18px_4px_rgba(47,151,241,0.35)] transition-all duration-300 mt-5 disabled:opacity-50"
              >
                {loading ? <Loading /> : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description + Related */}
      <div className="max-w-6xl mx-auto border-t border-gray-700 pt-10">
        <div className="bg-[#1f252c] px-6 py-5 rounded-md border border-gray-700 text-gray-200">
          Upgrade your style with premium-quality fabric and precise stitching.
        </div>

        <div className="mt-10">
          <RelatedProduct
            category={productData.category}
            subCategory={productData.subCategory}
            currentProductId={productData._id}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

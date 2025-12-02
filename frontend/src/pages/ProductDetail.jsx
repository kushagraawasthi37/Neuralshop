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

  const contentRef = useRef(null);
  const imgRef = useRef(null);

  const sizeOrder = ["S", "M", "L", "XL", "XXL"];

  /* ---------------- LIGHTWEIGHT GSAP INTRO ANIMATION ---------------- */
  useEffect(() => {
    const tl = gsap.timeline();

    tl.from(contentRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power2.out",
    });

    tl.from(
      imgRef.current,
      {
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        ease: "power2.out",
      },
      "-=0.5"
    );
  }, []);

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    const item = products.find((p) => p._id === productId);
    if (item) {
      setProductData(item);
      setImage(item.image1);
    }
  }, [productId, products]);

  if (!productData) return <Loading />;

  const sortedSizes = [...productData.sizes].sort(
    (a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b)
  );

  return (
    <div className="min-h-screen mt-45w-full bg-gradient-to-l from-[#141414] to-[#0c2025] text-white px-2 md:px-6 pt-24 pb-12 select-none">
      {/* MAIN GRID */}
      <div
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-10"
        ref={contentRef}
      >
        {/* LEFT: IMAGES */}
        <div
          className="flex flex-col md:flex-row gap-6 items-center md:items-start w-full max-w-[500px]"
          ref={imgRef}
        >
          {/* Vertical Thumbnails */}
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
                  className={`h-[calc(100%/4-0.75rem)] w-full rounded-lg border ${
                    img === image
                      ? "border-[#2f97f1] shadow-[0_0_10px_rgba(47,151,241,0.4)]"
                      : "border-[#2e3a43]"
                  } cursor-pointer overflow-hidden transition-all duration-300`}
                  onClick={() => setImage(img)}
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              ))}
          </div>

          {/* Main Image */}
          <div
            className={`relative w-full max-w-[430px] aspect-square rounded-xl border border-[#343d4b] bg-[#1d2329] shadow-lg overflow-hidden transition-all duration-500 ${
              zoom ? "scale-[1.02]" : ""
            }`}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
          >
            <img
              src={image}
              alt={productData.name}
              className={`w-full h-full object-contain transition-transform duration-500 ${
                zoom ? "scale-110" : ""
              }`}
            />
          </div>

          {/* Small Thumbnails */}
          <div className="flex md:hidden gap-3 mt-3 w-full max-w-[430px]">
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
                  className={`w-[calc(25%-12px)] h-16 rounded-lg border ${
                    img === image ? "border-[#2f97f1]" : "border-[#2e3a43]"
                  } cursor-pointer overflow-hidden`}
                  onClick={() => setImage(img)}
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
          </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div className="flex flex-col gap-2 md:gap-5">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold capitalize">
            {productData.name}
          </h1>

          <div className="flex items-center gap-1 text-yellow-400">
            {[...Array(4)].map((_, i) => (
              <FaStar key={i} />
            ))}
            <FaStarHalfAlt />
            <span className="text-white pl-1">(124 ratings)</span>
          </div>

          <p className="text-lg md:text-2xl font-bold">
            {currency} {productData.price}
          </p>

          <p className="text-gray-200 leading-relaxed">
            {productData.description ||
              "High-quality, breathable cotton shirt with a modern fit."}
          </p>

          {/* SIZE OPTIONS */}
          <div className="mt-3">
            <h2 className="text-lg font-semibold mb-2">Select Size</h2>
            <div className="flex flex-wrap gap-2 md:gap-4">
              {sortedSizes.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setSize(s)}
                  className={`px-[11px] py-1 md:px-[14px] md:py-2 rounded-md border font-medium transition-all duration-200 ${
                    s === size
                      ? "bg-[#2f97f1] text-white border-[#2f97f1]"
                      : "border-[#99b0d9] hover:bg-[#2f97f1] hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* ADD TO CART */}
          <button
            onClick={() => addtoCart(productData._id, size)}
            disabled={loading}
            className="px-10 py-3 rounded-lg font-semibold bg-gradient-to-r from-[#2f97f1] to-[#44c0f1] 
                       hover:shadow-[0_0_18px_4px_rgba(44,180,255,0.25)] transition-all duration-300 mt-5 disabled:opacity-50"
          >
            {loading ? <Loading /> : "Add to Cart"}
          </button>

          {/* POLICIES */}
          <div className="mt-6 flex flex-col gap-1 text-gray-300 text-sm md:text-base">
            <p>✅ 100% Original Product</p>
            <p>💵 Cash on Delivery available</p>
            <p>🔄 Easy 7-day return & exchange policy</p>
          </div>
        </div>
      </div>

      {/* DESCRIPTION + RELATED */}
      <div className="max-w-6xl mt-12 border-t border-slate-700 pt-6">
        <h2 className="text-xl md:text-2xl font-semibold mb-3">
          Product Description
        </h2>

        <div className="bg-[#1f252c] px-6 py-5 rounded-md border border-slate-600 text-gray-200">
          Upgrade your wardrobe with this stylish cotton shirt made for everyday
          comfort and modern looks.
        </div>

        <div className="mt-8">
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

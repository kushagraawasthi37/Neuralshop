import React, { useContext, useEffect, useState, useRef } from "react";
import Title from "../components/Title";
import { shopDataContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { RiDeleteBin6Line } from "react-icons/ri";
import CartTotal from "../components/CartTotal";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function Cart() {
  const { products, currency, cartItem, updateQuantity } =
    useContext(shopDataContext);

  const [cartData, setCartData] = useState([]);
  const navigate = useNavigate();

  const itemRefs = useRef([]);

  useEffect(() => {
    const temp = [];
    for (const id in cartItem) {
      for (const size in cartItem[id]) {
        if (cartItem[id][size] > 0) {
          temp.push({
            _id: id,
            size,
            quantity: cartItem[id][size],
          });
        }
      }
    }
    setCartData(temp);
  }, [cartItem]);

  // Apple-style soft fade motion
  useEffect(() => {
    gsap.from(itemRefs.current, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: itemRefs.current[0],
        start: "top 90%",
      },
    });
  }, [cartData]);

  return (
    <div className="w-full min-h-screen bg-[#0b0b0b] px-4 lg:px-16 py-28 select-none flex flex-col items-center">
      {/* Title */}
      <Title text1={"YOUR"} text2={"CART"} />

      <div className="w-full max-w-7xl mt-14 flex flex-col lg:flex-row gap-10">
        {/* LEFT — CART ITEMS */}
        <div className="w-full lg:w-[65%] flex flex-col gap-8">
          {cartData.length === 0 ? (
            <div
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.07]
            rounded-2xl p-16 text-center text-gray-300 text-xl shadow-inner shadow-black/30"
            >
              <p className="text-5xl mb-4 opacity-80">🛒</p>
              Your cart is empty
            </div>
          ) : (
            cartData.map((item, i) => {
              const p = products.find((pr) => pr._id === item._id);

              return (
                <div
                  key={i}
                  ref={(el) => (itemRefs.current[i] = el)}
                  className="
                    w-full p-6 
                    bg-[#111111] 
                    rounded-2xl 
                    border border-white/[0.09]
                    shadow-[0_0_20px_rgba(0,0,0,0.25)] 
                    backdrop-blur-xl
                    transition-all duration-300
                    hover:border-white/[0.2] 
                    hover:shadow-[0_0_40px_rgba(255,255,255,0.07)]
                    hover:-translate-y-[2px]
                    flex gap-6
                  "
                >
                  {/* IMAGE */}
                  <img
                    src={p?.image1}
                    alt={p?.name}
                    className="
                    w-28 h-28 rounded-xl object-cover 
                    shadow-[0_0_20px_rgba(0,0,0,0.4)]
                    "
                  />

                  {/* DETAILS */}
                  <div className="flex-1 flex flex-col justify-between">
                    <p className="text-lg font-semibold text-white tracking-wide">
                      {p?.name}
                    </p>

                    <div className="flex items-center gap-5 flex-wrap mt-2">
                      {/* Price */}
                      <span className="text-xl text-white font-semibold tracking-tight">
                        {currency} {p?.price}
                      </span>

                      {/* Size */}
                      <span
                        className="px-4 py-1 
                      rounded-md
                      bg-white/[0.06] 
                      border border-white/[0.12]
                      text-white/80 text-sm"
                      >
                        {item.size}
                      </span>

                      {/* Quantity */}
                      <input
                        type="number"
                        min={1}
                        defaultValue={item.quantity}
                        className="
                          w-20 px-3 py-1 rounded-lg
                          bg-[#1a1a1a] border border-white/[0.14]
                          text-white 
                          focus:ring-2 focus:ring-white/30 
                          outline-none transition-all
                        "
                        onChange={(e) =>
                          Number(e.target.value) > 0 &&
                          updateQuantity(
                            item._id,
                            item.size,
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>

                    {/* DELETE */}
                    <div className="flex items-center gap-3 mt-3">
                      <p className="text-white/60 text-sm">Remove item</p>
                      <RiDeleteBin6Line
                        className="
                          text-white/60 
                          hover:text-white 
                          hover:scale-110 
                          transition-all text-xl cursor-pointer
                        "
                        onClick={() => updateQuantity(item._id, item.size, 0)}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT — SUMMARY (APPLE STYLE CARD) */}
        {cartData.length > 0 && (
          <div className="w-full lg:w-[35%] sticky top-32">
            <div
              className="
              bg-[#111111] 
              border border-white/[0.1] 
              rounded-2xl 
              p-7 
              backdrop-blur-2xl
              shadow-[0_0_25px_rgba(255,255,255,0.05)]
            "
            >
              <CartTotal />

              <button
                onClick={() => navigate("/placeorder")}
                className="
                  w-full mt-6 py-3 rounded-xl
                  bg-gradient-to-b from-[#e0e0e0] to-[#a8a8a8]
                  text-black font-semibold text-lg tracking-wide
                  shadow-[0_4px_20px_rgba(255,255,255,0.2)]
                  hover:shadow-[0_6px_25px_rgba(255,255,255,0.25)]
                  hover:-translate-y-[2px]
                  transition-all duration-300
                "
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;

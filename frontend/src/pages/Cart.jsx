import React, { useContext, useEffect, useState, useRef } from "react";
import Title from "../components/Title";
import { shopDataContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { RiDeleteBin6Line } from "react-icons/ri";
import CartTotal from "../components/CartTotal";
import gsap from "gsap";

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

  // FIXED ANIMATION (NO SCROLLTRIGGER)
  useEffect(() => {
    if (!itemRefs.current.length) return;

    itemRefs.current.forEach((item, i) => {
      gsap.from(item, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: "power2.out",
        delay: i * 0.08,
      });
    });
  }, [cartData]);

  return (
    <div className="w-full min-h-screen bg-black px-4 lg:px-16 py-28 select-none flex flex-col items-center">
      <Title text1={"YOUR"} text2={"CART"} />

      <div className="w-full max-w-7xl mt-14 flex flex-col lg:flex-row gap-10">
        {/* LEFT — ITEMS */}
        <div className="w-full lg:w-[65%] flex flex-col gap-8">
          {cartData.length === 0 ? (
            <div className="bg-white/5 rounded-2xl p-16 border border-white/10 text-center text-gray-300 text-xl">
              <p className="text-5xl mb-4">🛒</p>
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
                    bg-[#121212] 
                    rounded-2xl 
                    border border-white/10
                    shadow-[0_0_35px_rgba(0,0,0,0.4)]
                    flex gap-6
                  "
                >
                  {/* IMAGE */}
                  <img
                    src={p?.image1}
                    className="w-28 h-28 rounded-xl object-cover"
                  />

                  {/* DETAILS */}
                  <div className="flex-1 flex flex-col justify-between">
                    <p className="text-lg font-semibold text-white">
                      {p?.name}
                    </p>

                    <div className="flex items-center gap-5 flex-wrap mt-2">
                      <span className="text-xl text-white font-semibold">
                        {currency} {p?.price}
                      </span>

                      <span className="px-4 py-1 rounded-md bg-white/10 text-white/90">
                        {item.size}
                      </span>

                      <input
                        type="number"
                        min={1}
                        defaultValue={item.quantity}
                        className="w-20 px-3 py-1 rounded-lg bg-[#1a1a1a] border border-white/15 text-white"
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

                    <div className="flex items-center gap-3 mt-3">
                      <p className="text-white/60  hover:text-white text-sm">
                        Remove item
                      </p>
                      <RiDeleteBin6Line
                        className="text-white h-5 w-5 hover:text-red-500 cursor-pointer"
                        onClick={() => updateQuantity(item._id, item.size, 0)}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT — TOTAL */}
        {cartData.length > 0 && (
          <div className="w-full lg:w-[35%] sticky top-28">
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-7 shadow-xl">
              <CartTotal />

              <button
                onClick={() => navigate("/placeorder")}
                className="
                w-full mt-6 py-3 rounded-xl
                bg-gradient-to-b from-[#e0e0e0] to-[#a8a8a8]
                text-black font-semibold text-lg
                shadow-lg hover:-translate-y-[2px] transition-all
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

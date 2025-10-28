import React, { useContext, useEffect, useState } from "react";
import Title from "../components/Title";
import { shopDataContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { RiDeleteBin6Line } from "react-icons/ri";
import CartTotal from "../components/CartTotal";

function Cart() {
  const { products, currency, cartItem, updateQuantity } =
  useContext(shopDataContext);
  const [cartData, setCartData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const tempData = [];
    for (const items in cartItem) {
      for (const item in cartItem[items]) {
        if (cartItem[items][item] > 0) {
          tempData.push({
            _id: items,
            size: item,
            quantity: cartItem[items][item],
          });
        }
      }
    }
    setCartData(tempData);
  }, [cartItem]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] py-8 px-2 sm:px-6 flex flex-col items-center">
      {/* Title */}
      <div className="w-full text-center mt-[43px] md:mt-20 mb-4 md:mb-8">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      {/* Cart Items List */}
      <div className="w-full max-w-4xl flex flex-col gap-8">
        {cartData.length === 0 ? (
          <div className="w-full text-center text-xl font-bold text-gray-300 bg-[#1e272e]/40 rounded-lg p-10 shadow my-20">
            <p className="text-center text-xl font-bold"></p> Your cart is
            empty.
            <p>Add items to your cart</p>
          </div>
        ) : (
          cartData.map((item, index) => {
            const productData = products.find(
              (product) => product._id === item._id
            );
            return (
              <div
                key={index}
                className="w-full rounded-2xl shadow-md border border-[#262e33] bg-[#23273a]/60 overflow-hidden"
              >
                <div className="flex  sm:flex-row items-center px-3 sm:px-6 py-4 gap-4 md:gap-8">
                  {/* Image */}
                  <img
                    className=" w-30 h-30  rounded-md object-cover shadow transition-transform duration-200 hover:scale-105"
                    src={productData?.image1}
                    alt={productData?.name}
                  />
                  {/* Details */}
                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    <p className="text-md  md:text-lg font-semibold text-white truncate">
                      {productData.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-5">
                      <span className="text-lg text-[#7be6eb] font-semibold">
                        {currency} {productData.price}
                      </span>
                      <span className="min-w-9 md:min-w-14 h-7 md:h-8 px-3 flex items-center justify-center bg-[#344f56]/80 rounded-md text-sm text-white border border-[#5de0fb]">
                        {item.size}
                      </span>
                      <input
                        type="number"
                        min={1}
                        defaultValue={item.quantity}
                        className="md:max-w-20 min-w-9 max-w-12 md:min-w-14 h-7 md:h-8 py-1 px-3 rounded border border-[#5de0fb] bg-[#244447]/80 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#2f97f1] transition"
                        onChange={(e) =>
                          e.target.value === "" || e.target.value === "0"
                            ? null
                            : updateQuantity(
                                item._id,
                                item.size,
                                Number(e.target.value)
                              )
                        }
                      />
                    </div>
                    {/* Delete Icon */}
                    <div className="flex gap-1 sm:gap-2 md:gap-4">
                      <p className="text-md md:text-lg  font-semibold text-white truncate ">
                        Remove item
                      </p>
                      <RiDeleteBin6Line
                        className="text-[#9ff9f9] w-4 h-7 sm:w-6 sm:h-6 md:w-8 md:h-8 cursor-pointer transition hover:text-red-400 hover:scale-110"
                        onClick={() => updateQuantity(item._id, item.size, 0)}
                      />{" "}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Total & Checkout */}
      {cartData.length !== 0 && (
        <div className="w-full mt-12 flex flex-col items-center">
          <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl bg-[#2b353d]/80 rounded-2xl p-5 sm:p-8 shadow-md border border-[#212e37]">
            {<CartTotal />}
            <button
              className={`mt-4 md:mt-6 w-full text-base sm:text-lg font-bold py-2 md:py-3 rounded-xl
        ${
          cartData.length
            ? "bg-gradient-to-r from-[#2f97f1] to-[#44c0f1] hover:from-[#237db6] hover:to-[#45badd] text-white cursor-pointer"
            : "bg-gray-600 text-gray-300 cursor-not-allowed"
        }
        transition-all duration-300 shadow-lg`}
              disabled={!cartData.length}
              onClick={() =>
                cartData.length > 0 ? navigate("/placeorder") : undefined
              }
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;

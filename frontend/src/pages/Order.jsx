import React, { useContext, useEffect, useState } from "react";
import Title from "../components/Title";
import { shopDataContext } from "../context/ShopContext";
import { authDataContext } from "../context/AuthContext";
import axios from "../context/axiosInstance.js";
import Loading from "../components/Loading.jsx";

function Order() {
  const [orderData, setOrderData] = useState([]);
  const { currency } = useContext(shopDataContext);
  const { serverUrl } = useContext(authDataContext);
  const [loading, setLoading] = useState(false);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      const result = await axios.post(
        serverUrl + "/api/order/userorder",
        {},
        { withCredentials: true }
      );

      if (result?.data?.token) {
        localStorage.setItem("authToken", result.data.token);
      }

      // console.log("Raw fetched orders:", result.data);

      if (result?.data?.orders) {
        let allOrdersItem = [];
        result?.data?.orders.forEach((order, orderIndex) => {
          // console.log(`Processing order ${orderIndex} with id ${order._id}`);
          order.items.forEach((item, itemIndex) => {
            // console.log(`Order ${orderIndex}, item ${itemIndex}:`, item);

            // Attach order-level info to each item
            item.status = order.status;
            item.payment = order.payment;
            item.paymentMethod = order.paymentMethod;
            item.date = order.date;

            allOrdersItem.push(item);
          });
        });

        // Debug the flattened list before setting state
        // console.log("Flattened all items:", allOrdersItem);

        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, []);

  return (
    <div className="w-[99vw] min-h-[100vh] p-5 pb-[150px] overflow-hidden bg-gradient-to-l from-[#141414] to-[#0c2025] flex flex-col items-center">
      {loading ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3">
          <p className="text-white text-lg">Loading your products</p>{" "}
          <Loading />
        </div>
      ) : (
        <>
          {" "}
          <div className="w-full h-[8%] text-center mt-[80px]">
            <Title text1={"MY"} text2={"ORDER"} />
          </div>
          <div className="w-full max-w-6xl flex flex-col gap-6">
            {orderData.length === 0 ? (
              <div className="w-full text-center text-lg text-gray-300 bg-[#1e272e]/40 rounded-xl p-10 shadow mt-20">
                No orders found.
              </div>
            ) : (
              orderData.map((item, index) => {
                console.log(`Rendering item ${index} image URL:`, item.image1);
                return (
                  <div
                    key={index}
                    className="w-full border-t border-b rounded-2xl"
                  >
                    <div
                      className="relative w-full h-auto flex flex-col sm:flex-row items-start gap-4 sm:gap-6
        bg-[#51808048] py-4 px-6 rounded-2xl shadow-lg transition-shadow duration-300 hover:shadow-lg hover:shadow-[#44daff66] group"
                    >
                      {/* Product Image */}
                      <img
                        src={item.image1 || "https://via.placeholder.com/130"}
                        alt={item.name}
                        className="w-[130px] h-[130px] rounded-md object-cover transition-transform duration-300 group-hover:scale-105 shadow-md"
                        onError={(e) => {
                          console.warn(
                            `Image load error for item ${item.name}:`,
                            e
                          );
                          e.target.src = "https://via.placeholder.com/130";
                        }}
                      />

                      {/* Details Section */}
                      <div className="flex flex-col flex-1 min-w-0 sm:gap-1">
                        <p className="text-[#f3f9fc] text-[16px] md:text-[25px] truncate font-semibold">
                          {item.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 md:gap-6 text-[#aaf4e7] text-[12px] md:text-[18px]">
                          <p>
                            {currency} {item.price}
                          </p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Size: {item.size}</p>
                        </div>
                        <p className="text-[#aaf4e7] text-[12px] md:text-[18px] mt-2">
                          Date:{" "}
                          <span className="text-[#e4fbff] pl-2 text-[11px] md:text-[16px]">
                            {new Date(item.date).toDateString()}
                          </span>
                        </p>
                        <p className="text-[#aaf4e7] text-[12px] md:text-[18px]">
                          Payment Method: {item.paymentMethod}
                        </p>
                      </div>

                      {/* Status and Track Button */}
                      <div className="absolute right-2 md:right-5 top-4 md:top-16 flex flex-col items-end gap-2 sm:gap-3 z-10">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:m-3 lg:h-3 rounded-full bg-green-500 animate-blink border border-green-400"></span>
                          <p className="text-[#f3f9fc] text-[10px] md:text-[17px] font-semibold">
                            {item.status}
                          </p>
                        </div>
                        <button
                          onClick={loadOrderData}
                          className="px-4 py-1.5 rounded-md bg-[#101919] text-[#f3f9fc] text-[12px] md:text-[16px] cursor-pointer active:bg-slate-500 hover:bg-[#1c4f7b] transition"
                        >
                          Track Order
                        </button>
                      </div>

                      {/* Blinking animation keyframes */}
                      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-blink {
          animation: blink 1.5s infinite;
        }
      `}</style>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Order;

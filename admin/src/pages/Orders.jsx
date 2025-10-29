import React from "react";
import Nav from "../component/Nav";
import Sidebar from "../component/Sidebar";
import { useState } from "react";
import { useContext } from "react";
import { authDataContext } from "../context/AuthContext";
import axios from "../context/axiosInstance.js";
import { useEffect } from "react";
import { SiEbox } from "react-icons/si";
import Ai from "../component/Ai.jsx";
import { toast } from "react-toastify";
import Loading from "../component/Loading.jsx";

function Orders() {
  let [orders, setOrders] = useState([]);
  let { serverUrl } = useContext(authDataContext);
  let [loading, setLoading] = useState(false);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const result = await axios.post(
        serverUrl + "/api/order/list",
        {},
        { withCredentials: true }
      );
      // Save token to localStorage
      if (result?.data?.token) {
        localStorage.setItem("authToken", result.data.token);
      }
      setOrders(result.data.orders.reverse());
    } catch (error) {
      // console.log(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Try again later";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (e, orderId) => {
    try {
      const result = await axios.post(
        serverUrl + "/api/order/status",
        { orderId, status: e.target.value },
        { withCredentials: true }
      );
      if (result.data.token) {
        await fetchAllOrders();
      }
      if (result?.data?.token) {
        localStorage.setItem("authToken", result.data.token);
      }
    } catch (error) {
      // console.log(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Login Failed";
      toast.error(errorMessage);
    }
  };
  useEffect(() => {
    fetchAllOrders();
  }, []);
  return (
    <div className="w-[99vw] min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] text-[white]">
      <Ai />
      <Nav />
      <Sidebar />
      <div className="w-full h-full flex items-center lg:justify-start justify-center">
        <div className="lg:w-[85%] md:w-[70%] h-full lg:ml-[310px] md:ml-[250px] mt-[70px] flex flex-col gap-[30px] overflow-x-hidden py-[50px] ml-[100px]">
          {loading ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3">
              <p className="text-white text-lg">Loading your orders</p>{" "}
              <Loading />
            </div>
          ) : (
            <>
              <div className="w-[400px] h-[50px] text-[28px] md:text-10 mb-5 text-white">
                All Orders List
              </div>

              {orders?.length > 0 ? (
                orders.map((order, index) => (
                  <div
                    key={index}
                    className="w-[90%] h-[40%] bg-slate-600 rounded-xl flex lg:items-center items-start justify-between flex-col lg:flex-row p-[10px] md:px-5 gap-5"
                  >
                    <SiEbox className="w-[60px] h-[60px] text-[black] p-[5px] rounded-lg bg-[white]" />

                    <div>
                      <div className="flex items-start justify-center flex-col gap-[5px] text-[16px] text-[#56dbfc]">
                        {order.items.map((item, index) => {
                          if (index === order.items.length - 1) {
                            return (
                              <p key={index}>
                                {item.name.toUpperCase()} * {item.quantity}{" "}
                                <span>{item.size}</span>
                              </p>
                            );
                          } else {
                            return (
                              <p key={index}>
                                {item.name.toUpperCase()} * {item.quantity}{" "}
                                <span>{item.size}</span>,
                              </p>
                            );
                          }
                        })}
                      </div>

                      <div className="text-[15px] text-green-100">
                        <p>
                          {order.address.firstName +
                            " " +
                            order.address.lastName}
                        </p>
                        <p>
                          {order.address.street +
                            ", " +
                            order.address.city +
                            ", " +
                            order.address.state +
                            ", " +
                            order.address.country +
                            ", " +
                            order.address.pinCode}
                        </p>
                        <p>{order.address.phone}</p>
                      </div>
                    </div>

                    <div className="text-[15px] text-green-100">
                      <p>Items : {order.items.length}</p>
                      <p>Method : {order.paymentMethod}</p>
                      <p>Payment : {order.payment ? "Done" : "Pending"}</p>
                      <p>Date : {new Date(order.date).toLocaleDateString()}</p>
                      <p className="text-5 text-[white]"> ₹ {order.amount}</p>
                    </div>

                    <select
                      value={order.status}
                      className="px-[5px] py-[10px] bg-slate-500 rounded-lg border-[1px] border-[#96eef3]"
                      onChange={(e) => statusHandler(e, order._id)}
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Packing">Packing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for delivery">Out for delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                ))
              ) : (
                <p className="text-white text-lg select-none">
                  No products available.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Orders;

import React, { useState, useContext, useEffect } from "react";
import Nav from "../component/Nav";
import Sidebar from "../component/Sidebar";
import { authDataContext } from "../context/AuthContext";
import axios from "../context/axiosInstance.js";
import Ai from "../component/Ai.jsx";
import { toast } from "react-toastify";
import Loading from "../component/Loading.jsx";

function Home() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const { serverUrl } = useContext(authDataContext);
  const [loading, setLoading] = useState(false);

  const fetchCounts = async () => {
    try {
      setLoading(true);
      const products = await axios.get(`${serverUrl}/api/product/admin/list`, {
        withCredentials: true,
      });
      setTotalProducts(products.data.product.length);

      const orders = await axios.post(
        `${serverUrl}/api/order/list`,
        {},
        {
          withCredentials: true,
        }
      );

      if (orders?.data?.token) {
        localStorage.setItem("authToken", orders.data.token);
      }

      setTotalOrders(orders.data.orders.length);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong try again later";
      toast.error(errorMessage);
      // console.error("Failed to fetch counts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#1e1e1e] to-[#0c2025] text-white relative overflow-hidden flex flex-col">
      <Nav />
      <Ai />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 mt-[70px] md:mt-0 pl-13 md:p-12 md:pl-25 flex flex-col items-center justify-center text-center overflow-y-auto">
          <h1 className="text-2xl md:text-4xl text-[#afe2f2] font-semibold mb-10 select-none">
            NeuralShop Admin Dashboard
          </h1>
          {loading ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3">
              <p className="text-white text-lg">Loading your products</p>{" "}
              <Loading />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-5xl">
              <div className="bg-[#0000003a] w-[90%] sm:w-[300px] md:w-[350px] lg:w-[400px] h-[180px] flex flex-col items-center justify-center gap-4 rounded-xl shadow-lg shadow-black/40 backdrop-blur-lg border border-[#6b6b6b] hover:border-yellow-400 hover:scale-105 transition-all duration-300">
                <p className="text-lg md:text-xl text-[#dcfafd] font-medium">
                  Total Products
                </p>
                <span className="px-6 py-3 bg-[#071418] rounded-lg border border-[#6b6b6b] text-[#8fe8f4] font-semibold text-xl">
                  {totalProducts}
                </span>
              </div>

              <div className="bg-[#0000003a] w-[90%] sm:w-[300px] md:w-[350px] lg:w-[400px] h-[180px] flex flex-col items-center justify-center gap-4 rounded-xl shadow-lg shadow-black/40 backdrop-blur-lg border border-[#6b6b6b] hover:border-yellow-400 hover:scale-105 transition-all duration-300">
                <p className="text-lg md:text-xl text-[#dcfafd] font-medium">
                  Total Orders
                </p>
                <span className="px-6 py-3 bg-[#071418] rounded-lg border border-[#6b6b6b] text-[#8fe8f4] font-semibold text-xl">
                  {totalOrders}
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Home;

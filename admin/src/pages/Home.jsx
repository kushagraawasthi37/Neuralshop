import React from "react";
import Nav from "../component/Nav";
import Sidebar from "../component/Sidebar";
import { useState } from "react";
import { useContext } from "react";
import { authDataContext } from "../context/AuthContext";
import { useEffect } from "react";
import axios from "axios";

function Home() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  const { serverUrl } = useContext(authDataContext);

  const fetchCounts = async () => {
    try {
      const products = await axios.get(
        `${serverUrl}/api/product/list`,
        {},
        { withCredentials: true }
      );
      setTotalProducts(products.data.length);

      const orders = await axios.post(
        `${serverUrl}/api/order/list`,
        {},
        { withCredentials: true }
      );
      setTotalOrders(orders.data.length);
    } catch (err) {
      console.error("Failed to fetch counts", err);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);
  return (
    <div className="w-screen h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] text-white relative overflow-hidden">
      <Nav />
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="ml-[18%] w-[82%] h-full flex flex-col items-start justify-start gap-10 py-[100px] px-10">
        <h1 className="text-[35px] text-[#afe2f2] font-semibold">
          OneCart Admin Panel
        </h1>

        <div className="flex flex-col md:flex-row gap-10">
          <div className="text-[#dcfafd] w-[350px] md:w-[400px] h-[200px] bg-[#0000003a] flex flex-col items-center justify-center gap-5 rounded-xl shadow-md shadow-black/40 backdrop-blur-lg text-xl border border-[#6b6b6b] hover:scale-[1.02] transition-all duration-300">
            Total No. of Products :
            <span className="px-6 py-3 bg-[#071418] rounded-lg flex items-center justify-center border border-[#6b6b6b] text-[#8fe8f4] font-semibold">
              {totalProducts}
            </span>
          </div>

          <div className="text-[#dcfafd] w-[350px] md:w-[400px] h-[200px] bg-[#0000003a] flex flex-col items-center justify-center gap-5 rounded-xl shadow-md shadow-black/40 backdrop-blur-lg text-xl border border-[#6b6b6b] hover:scale-[1.02] transition-all duration-300">
            Total No. of Orders :
            <span className="px-6 py-3 bg-[#071418] rounded-lg flex items-center justify-center border border-[#6b6b6b] text-[#8fe8f4] font-semibold">
              {totalOrders}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

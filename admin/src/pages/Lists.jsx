import React, { useContext, useEffect, useState } from "react";
import Nav from "../component/Nav";
import Sidebar from "../component/Sidebar";
import { authDataContext } from "../context/AuthContext";
import { toast } from "react-toastify";

import axios from "../context/axiosInstance.js";
import Ai from "../component/Ai.jsx";

function Lists() {
  let [list, setList] = useState([]);
  let { serverUrl } = useContext(authDataContext);

  const fetchList = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/product/admin/list`, {
        withCredentials: true,
      });
      setList(result.data.product);
      if (result?.data?.token) {
        localStorage.setItem("authToken", result.data.token);
      }
      // console.log(result.data.product);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong try again later";
      toast.error(errorMessage);
      // console.log(error);
    }
  };

  const removeList = async (id) => {
    try {
      let result = await axios.post(
        `${serverUrl}/api/product/remove/${id}`,
        {},
        { withCredentials: true }
      );
      if (result.data.token) {
        fetchList();
      } else {
        // console.log("Failed to remove Product");
      }
      if (result?.data?.token) {
        localStorage.setItem("authToken", result.data.token);
      }

      toast.success(response?.data?.message);
    } catch (error) {
      // console.log(error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong try again later";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="w-screen min-h-screen bg-gradient-to-l from-[#10121a] via-[#1a1f2e] to-[#252940] text-white">
      <Nav />
      <Ai />
      <div className="flex">
        <Sidebar />

        <main className="flex-grow mt-[70px] py-[50px] px-5.5 md:px-10  ml-10 lg:px-16 lg:ml-[320px] md:ml-[230px] overflow-x-hidden flex flex-col md:gap-6 gap-3">
          <h2 className="text-center text-2xl md:text-4xl font-semibold  md:mb-6 select-none truncate">
            All Listed Products
          </h2>

          {list?.length > 0 ? (
            list.map((item, index) => (
              <article
                key={index}
                className="w-full max-w-6xl min-w-0 h-[90px] md:h-[120px] bg-white/5 rounded-2xl p-1 md:p-2 flex items-center gap-4 md:gap-10 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src={item.image1}
                  alt={item.name}
                  className="w-[30%] md:w-[140px] h-full rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex flex-col justify-center flex-grow gap-1 min-w-0 overflow-hidden">
                  <h3 className="text-lg md:text-xl text-yellow-300 font-semibold truncate select-text">
                    {item.name}
                  </h3>
                  <p className="text-md md:text-lg text-[#b6ecf3] truncate select-text">
                    {item.category}
                  </p>
                  <p className="text-md md:text-lg text-[#b6ecf3] truncate select-text">
                    ₹{item.price}
                  </p>
                </div>
                <div className="flex items-center justify-center w-[50px] md:w-[70px] flex-shrink-0">
                  <button
                    onClick={() => removeList(item._id)}
                    className="w-10 h-8 rounded-md bg-red-600 text-white text-lg font-bold flex items-center justify-center hover:bg-red-500 focus:outline-none transition-colors duration-300"
                    aria-label={`Remove ${item.name}`}
                  >
                    &times;
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="text-white text-lg select-none">
              No products available.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

export default Lists;

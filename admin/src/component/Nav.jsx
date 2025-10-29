import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import axios from "../context/axiosInstance.js";
import { authDataContext } from "../context/AuthContext.jsx";
import { adminDataContext } from "../context/AdminContext";
import { toast } from "react-toastify";

function Nav() {
  const userUrl = import.meta.env.VITE_USER_URL;
  let navigate = useNavigate();
  const { serverUrl } = useContext(authDataContext);
  const { getCurrentAdmin } = useContext(adminDataContext);

  const logOut = async () => {
    try {
      const respose = await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });

      // console.log(respose.data);
      // console.log(respose.data);
      localStorage.removeItem("authToken");
      toast.success("LogOut Successfully");
      await getCurrentAdmin();
      navigate("/login");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login Failed";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-screen h-13 z-100 md:h-[70px] bg-gradient-to-r from-[#10121a] via-[#1a1f2e] to-[#252940]  fixed top-0 flex items-center justify-between px-[30px] shadow-md shadow-black select-none transition-colors duration-500 ease-in-out">
      <div
        className="w-[30%]  flex items-center justify-start gap-1  md:gap-2.5 cursor-pointer "
        onClick={() => navigate("/")}
      >
        <img src={logo} alt="" className="w-[45px] md:w-17" />
        <h1
          className="text-5 font-bold md:text-[20px] font-sans select-none"
          style={{
            background: "linear-gradient(90deg, #ffd43b, #ffea7f)", // warm yellow gradient
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          NeuralShop
        </h1>
      </div>

      <div className="flex gap-3">
        <a
          className="text-[12px] md:text-4 bg-red-500 hover:bg-red-600 active:bg-red-700 text-[#10121a] font-semibold py-2 px-2 md:py-2.5 md:px-4 rounded-lg md:rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer select-none"
          href={userUrl}
          target="_blank"
        >
          User Mode
        </a>
        <button
          className="text-[12px] md:text-4 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-[#10121a] font-semibold py-2 px-4 md:py-2.5 md:px-6 rounded-lg md:rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer select-none"
          onClick={logOut}
        >
          LogOut
        </button>
      </div>
    </div>
  );
}

export default Nav;

// import React, { useContext } from 'react'
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import axios from "axios";
import { useContext } from "react";
import { authDataContext } from "../context/authContext";
import { adminDataContext } from "../context/AdminContext";
// import { toast } from 'react-toastify'

function Nav() {
  let navigate = useNavigate();
  const { serverUrl } = useContext(authDataContext);
  const { getCurrentAdmin } = useContext(adminDataContext);

  const logOut = () => {
    try {
      const respose = axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      console.log(respose.data);
      getCurrentAdmin();
      navigate("/login");
    } catch (error) {
      console.log("Admin logout error", error);
    }
  };

  return (
    <div className="w-screen h-13 z-100 md:h-[70px] bg-gradient-to-r from-[#10121a] via-[#1a1f2e] to-[#252940]  fixed top-0 flex items-center justify-between px-[30px] shadow-md shadow-black select-none transition-colors duration-500 ease-in-out">
      <div
        className="w-[30%]  flex items-center justify-start gap-1  md:gap-2.5 cursor-pointer "
        onClick={() => navigate("/")}
      >
        <img src={logo} alt="" className="w-8 md:w-[30px]" />
        <h1 className="text-5 md:text-[20px] text-white font-sans font-bold ">
          NeuralShop
        </h1>
      </div>
      <button
        className="text-[12px] md:text-4 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-[#10121a] font-semibold py-2 px-4 md:py-2.5 md:px-6 rounded-lg md:rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer select-none"
        onClick={logOut}
      >
        LogOut
      </button>
    </div>
  );
}

export default Nav;

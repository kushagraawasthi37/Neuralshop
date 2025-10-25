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
    <div className="w-full h-13 md:h-[70px] bg-[#dcdbdbf8] z-10 fixed top-0 flex  items-center justify-between px-3 md:px-[30px] overflow-x-hidden shadow-md shadow-black ">
      <div
        className="w-[30%]  flex items-center justify-start gap-1  md:gap-2.5 cursor-pointer "
        onClick={() => navigate("/")}
      >
        <img src={logo} alt="" className="w-8 md:w-[30px]" />
        <h1 className="text-5 md:text-[20px] text-[black] font-sans font-bold ">
          NeuralShop
        </h1>
      </div>
      <button
        className="text-[15px] hover:border-2 hover:scale-95 active:95 hover:bg-black border-[#89daea] cursor-pointer bg-[#000000ca] py-2 px-3 md:py-2.5 md:px-5 rounded-2xl text-white "
        onClick={logOut}
      >
        LogOut
      </button>
    </div>
  );
}

export default Nav;

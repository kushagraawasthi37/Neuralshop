import React, { useContext, useState } from "react";
import logo from "../assets/asset/logo.png";
import { IoSearchCircleOutline } from "react-icons/io5";
import { FaCircleUser } from "react-icons/fa6";
import { MdOutlineShoppingCart } from "react-icons/md";
import { userDataContext } from "../context/UserContext";
import { IoSearchCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { HiOutlineCollection } from "react-icons/hi";
import { MdContacts } from "react-icons/md";
import axios from "axios";
import { authDataContext } from "../context/authContext";

function Nav() {
  let navigate = useNavigate();
  let [showProfile, setShowProfile] = useState(false);
  let [showSearch, setShowSearch] = useState(false);
  let { serverUrl } = useContext(authDataContext);
  let { getCurrentUser } = useContext(userDataContext);

  const { userData } = useContext(userDataContext);
  const logout = async () => {
    try {
      const respose = await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });

      console.log(respose.data);
      getCurrentUser();
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-screen  h-[45px]  md:h-[70px] bg-[#cbe4e4ec] z-10 fixed top-0 flex  items-center justify-between px-[30px] shadow-md shadow-black ">
      <div className="w-[20%] lg:w-[30%] mr-4 flex items-center justify-start   gap-2.5">
        <img
          src={logo}
          alt=""
          className="w-[30px] hover:cursor-pointer"
          onClick={() => navigate("/")}
        />
        <h1 className="text-5 md:text-[20px] text-[black] font-sans ">
          NeuralShop
        </h1>
      </div>
      <div className="w-[50%] lg:w-[40%] hidden md:flex">
        <ul className="flex items-center justify-center gap-[19px] text-[white] ">
          <li className="text-[15px] hover:bg-slate-500 cursor-pointer bg-[#000000c9] py-2.5 px-5 rounded-2xl">
            HOME
          </li>
          <li className="text-[15px] hover:bg-slate-500 cursor-pointer bg-[#000000c9] py-2.5 px-5 rounded-2xl">
            COLLECTIONS
          </li>
          <li className="text-[15px] hover:bg-slate-500 cursor-pointer bg-[#000000c9] py-2.5 px-5 rounded-2xl">
            ABOUT
          </li>
          <li className="text-[15px] hover:bg-slate-500 cursor-pointer bg-[#000000c9] py-2.5 px-5 rounded-2xl">
            CONTACT
          </li>
        </ul>
      </div>
      <div className="w-[30%] flex items-center justify-end gap-1.5">
        {/* Search icon */}
        {!showSearch && (
          <IoSearchCircleOutline
            onClick={() => setShowSearch((prev) => !prev)}
            className="h-8.5 w-8.5 md:w-[38px] md:h-[38px] text-[#000000]  cursor-pointer"
          />
        )}
        {showSearch && (
          <IoSearchCircleSharp
            onClick={() => setShowSearch((prev) => !prev)}
            className="transition-all duration-300 ease w-8.5 h-8.5 md:w-[38px]  md:h-[38px] text-[#000000]  cursor-pointer"
          />
        )}

        {/* UserProfile */}
        {!userData && (
          <FaCircleUser
            onClick={() => setShowProfile((prev) => !prev)}
            className="w-7 h-7 md:w-[29px] md:h-[29px] text-[#000000]  cursor-pointer"
          />
        )}
        {userData && (
          <div
            onClick={() => setShowProfile((prev) => !prev)}
            className="h-6.5 w-6.5 md:w-[30px] md:h-[30px] bg-[#080808] text-[white] rounded-full flex items-center justify-center cursor-pointer"
          >
            {userData?.user?.name?.slice(0, 1)}
          </div>
        )}

        {/* Cart */}
        <MdOutlineShoppingCart className="h-6 w-6 md:w-[30px] md:h-[30px] text-[#000000]  cursor-pointer hidden md:block" />
        <p className="absolute w-[18px] h-[18px] items-center  justify-center bg-black px-[5px] py-[2px] text-white  rounded-full text-[9px] top-2.5 right-[23px] hidden md:block"></p>
      </div>

      {/* SearchBox */}
      {showSearch && (
        <div className=" w-full  h-[65px] md:h-20 bg-[#d8f6f9dd] absolute top-full left-0 right-0 flex items-center justify-center ">
          <input
            type="text"
            className="lg:w-[50%] ease w-[80%] h-[70%] bg-[#54958f] rounded-[30px] px-[50px] placeholder:text-white text-[white] text-4 md:md:text-4"
            placeholder="Search Here"
          />
        </div>
      )}

      {/* Jab profile icon par click kroge to toggle hoga */}
      {showProfile && (
        <div className="absolute w-30 h-45 md:w-[220px] md:h-[150px] bg-[#151414d7] top-[110%] right-[4%] border-[1px] border-[#aaa9a9] rounded-2.5 z-10">
          <ul className="w-full h-full flex items-start justify-around flex-col text-[17px] py-2.5 text-[white] ">
            {/* User nahi hai to login show hoga */}
            {!userData && (
              <li
                onClick={() => {
                  navigate("/login");
                  setShowProfile(false);
                }}
                className="w-full hover:bg-[#2f2f2f]  px-[15px] py-2.5 cursor-pointer"
              >
                Login
              </li>
            )}

            {/* User hai to logout show hoga */}
            {userData && (
              <li
                onClick={() => {
                  logout();
                  setShowProfile(false);
                }}
                className="w-full hover:bg-[#2f2f2f]  px-[15px] py-2.5 cursor-pointer"
              >
                LogOut
              </li>
            )}
            <li className="w-full hover:bg-[#2f2f2f]  px-[15px] py-2.5 cursor-pointer">
              Orders
            </li>
            <li className="w-full hover:bg-[#2f2f2f]  px-[15px] py-2.5 cursor-pointer">
              About
            </li>
          </ul>
        </div>
      )}

      <div
        className="w-full h-[55px] md:h-[90px] flex items-center justify-between px-5 text-[12px]
         fixed bottom-0 left-0 bg-[#191818]   md:hidden"
      >
        <button className="text-[white] flex items-center justify-center flex-col gap-0.5">
          <IoMdHome className="w-[25px] h-[25px]  md:w-7 md:h-7 text-[white] md:hidden" />{" "}
          Home
        </button>
        <button className="text-[white] flex items-center justify-center flex-col gap-[2px]">
          <HiOutlineCollection className="w-[25px] h-[25px] md:w-7 md:h-7 text-[white] md:hidden" />{" "}
          Collections
        </button>
        <button className="text-[white] flex items-center justify-center flex-col gap-[2px] ">
          <MdContacts className="w-[25px] h-[25px] md:w-7 md:h-7 text-[white] md:hidden" />
          Contact
        </button>
        <button className="text-[white] flex items-center justify-center flex-col gap-[2px]">
          <MdOutlineShoppingCart className="w-[25px] h-[25px] md:w-7 md:h-7 text-[white] md:hidden" />{" "}
          Cart
        </button>
        <p className="absolute w-3 h-3 md:w-[18px] md:h-[18px] flex items-center justify-center bg-white px-[5px] py-0.5 text-black font-semibold  rounded-full text-[9px] top-[5px] right-[17px] md:top-2 md:right-[18px]"></p>
      </div>
    </div>
  );
}

export default Nav;

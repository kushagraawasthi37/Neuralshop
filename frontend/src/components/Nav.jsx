import React, { useContext, useState } from "react";
import logo from "../assets/asset/logo.png";
import { IoSearchCircleOutline, IoSearchCircleSharp } from "react-icons/io5";
import { FaCircleUser } from "react-icons/fa6";
import { MdOutlineShoppingCart, MdViewAgenda } from "react-icons/md";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { HiOutlineCollection } from "react-icons/hi";
import { MdContacts } from "react-icons/md";
import axios from "../context/axiosInstance.js";
import { authDataContext } from "../context/authContext";
import { shopDataContext } from "../context/ShopContext";

function Nav() {
  let navigate = useNavigate();
  let [showProfile, setShowProfile] = useState(false);
  let { search, setSearch, showSearch, setShowSearch, getCartCount } =
    useContext(shopDataContext);
  let { serverUrl } = useContext(authDataContext);
  let { getCurrentUser } = useContext(userDataContext);

  const { userData } = useContext(userDataContext);
  const logout = async () => {
    try {
      const respose = await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      console.log(respose.data);
      localStorage.removeItem("authToken");

      await getCurrentUser();
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-screen h-[45px] z-100 md:h-[70px] bg-gradient-to-r from-[#10121a] via-[#1a1f2e] to-[#252940]  fixed top-0 flex items-center justify-between px-[30px] shadow-md shadow-[#150822] select-none transition-colors duration-500 ease-in-out">
      <div className="mr-14 w-[20%]  lg:w-[30%] lg:mr-4 flex items-center justify-start gap-2.5">
        <img
          src={logo}
          alt=""
          className="w-[30px] cursor-pointer transition-transform duration-300 hover:scale-110"
          onClick={() => navigate("/")}
        />
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
      <div className="w-[50%]  lg:w-[40%] hidden md:flex items-center ">
        <ul className="flex items-center justify-center gap-3 lg:gap-[19px] text-yellow-400">
          <li
            onClick={() => navigate("/")}
            className=" text-3 lg:text-[15px] bg-white/10 hover:bg-yellow-500/50 cursor-pointer py-1 lg:py-2.5 px-3 lg:px-5 rounded-xl lg:rounded-2xl transition-colors duration-300"
          >
            HOME
          </li>
          <li
            onClick={() => navigate("/collection")}
            className="text-3 lg:text-[15px] bg-white/10 hover:bg-yellow-500/50 cursor-pointer py-1 lg:py-2.5 px-3 lg:px-5 rounded-xl lg:rounded-2xl transition-colors duration-300"
          >
            COLLECTIONS
          </li>
          <li
            onClick={() => navigate("/about")}
            className="text-3 lg:text-[15px] bg-white/10 hover:bg-yellow-500/50 cursor-pointer py-1 lg:py-2.5 px-3 lg:px-5 rounded-xl lg:rounded-2xl transition-colors duration-300"
          >
            ABOUT
          </li>
          <li
            onClick={() => navigate("/contact")}
            className="text-3 lg:text-[15px] bg-white/10 hover:bg-yellow-500/50 cursor-pointer py-1 lg:py-2.5 px-3 lg:px-5 rounded-xl lg:rounded-2xl transition-colors duration-300"
          >
            CONTACT
          </li>
        </ul>
      </div>
      <div className="w-[30%] flex items-center justify-end gap-1.5">
        {/* Search icon */}
        {!showSearch && (
          <IoSearchCircleOutline
            onClick={() => {
              setShowSearch((prev) => !prev);
              navigate("/collection");
            }}
            className="h-8.5 w-8.5 md:w-[38px] md:h-[38px] text-white cursor-pointer hover:text-yellow-300 transition-colors duration-300"
          />
        )}
        {showSearch && (
          <IoSearchCircleSharp
            onClick={() => setShowSearch((prev) => !prev)}
            className="transition-all duration-300 ease w-8.5 h-8.5 md:w-[38px] md:h-[38px] text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors duration-300"
          />
        )}

        {/* UserProfile */}
        {!userData && (
          <FaCircleUser
            onClick={() => setShowProfile((prev) => !prev)}
            className="w-7 h-7 md:w-[29px] md:h-[29px] text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors duration-300"
          />
        )}
        {userData && (
          <div
            onClick={() => setShowProfile((prev) => !prev)}
            className="h-6.5 w-6.5 md:w-[30px] md:h-[30px] bg-yellow-500 text-[#10121a] rounded-full flex items-center justify-center cursor-pointer hover:bg-yellow-400 transition-colors duration-300 select-none font-semibold"
          >
            {userData?.user?.name?.slice(0, 1)}
          </div>
        )}

        {/* Cart */}
        <MdOutlineShoppingCart
          onClick={() => navigate("/cart")}
          className="h-6 w-6 md:w-[30px] md:h-[30px] text-white cursor-pointer hover:text-yellow-300 transition-colors duration-300 hidden md:block"
        />
        <p className="absolute w-[14px] h-[14px] flex items-center justify-center bg-white text-black  rounded-full text-[11px] text-center font-bold select-none top-[15px] right-[27px] hidden md:block">
          {getCartCount()}
        </p>
      </div>

      {/* SearchBox */}
      {showSearch && (
        <div className="w-full h-[50px] md:h-20 bg-[#1a1f2e] absolute top-full left-0 right-0 flex items-center justify-center transition-colors duration-300">
          <input
            type="text"
            className="lg:w-[50%] ease w-[80%] h-[70%] bg-[#252940] rounded-2xl md:rounded-[30px] px-[50px] placeholder-yellow-300 text-white text-4 md:text-4 focus:outline-yellow-400"
            placeholder="Search Here"
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            value={search}
          />
        </div>
      )}

      {/* Profile dropdown */}
      {showProfile && (
        <div className="absolute w-30 h-45 md:w-[220px] md:h-[150px] bg-[#151414d7] top-[110%] right-[4%] border-[1px] border-yellow-400 rounded-2.5 z-10 transition-colors duration-300">
          <ul className="w-full h-full flex items-start justify-around flex-col text-2 md:text-[17px] py-2.5 text-white hover:text-yellow-400">
            {/* User nahi hai to login show hoga */}
            {!userData && (
              <li
                onClick={() => {
                  navigate("/login");
                  setShowProfile(false);
                }}
                className="w-full hover:bg-yellow-600  px-[15px] py-2.5 cursor-pointer transition-colors duration-300 rounded"
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
                className="w-full hover:bg-yellow-600 px-[15px] py-2.5 cursor-pointer transition-colors duration-300 rounded"
              >
                LogOut
              </li>
            )}
            <li className="w-full hover:bg-yellow-600 px-[15px] py-2.5 cursor-pointer transition-colors duration-300 rounded">
              Orders
            </li>
            <li
              onClick={() => navigate("/about")}
              className="w-full hover:bg-yellow-600 px-[15px] py-2.5 cursor-pointer transition-colors duration-300 rounded"
            >
              About
            </li>
          </ul>
        </div>
      )}

      {/* Mobile bottom nav (unchanged) */}
      <div className="w-full h-[45px]  md:h-[90px] flex items-center justify-between px-5 text-[12px] fixed -bottom-0.5 left-0 bg-gradient-to-r from-[#10121a] via-[#1a1f2e] to-[#252940] md:hidden">
        <button
          onClick={() => navigate("/")}
          className="text-white flex items-center justify-center flex-col gap-0.5 hover:text-yellow-300 transition-colors duration-300"
        >
          <IoMdHome className="w-[22px] h-[22px] md:w-7 md:h-7 hover:text-yellow-400 md:hidden" />{" "}
          Home
        </button>
        <button
          onClick={() => navigate("/collection")}
          className="text-white flex items-center justify-center flex-col gap-[2px] hover:text-yellow-300 transition-colors duration-300"
        >
          <HiOutlineCollection className="w-[22px] h-[22px] md:w-7 md:h-7 hover:text-yellow-400 md:hidden" />{" "}
          Collections
        </button>
        <button
          onClick={() => navigate("/contact")}
          className="text-white flex items-center justify-center flex-col gap-[2px] hover:text-yellow-300 transition-colors duration-300"
        >
          <MdContacts className="w-[22px] h-[22px] md:w-7 md:h-7 hover:text-yellow-400 md:hidden" />
          Contact
        </button>
        <button
          onClick={() => navigate("/cart")}
          className="text-white flex items-center justify-center flex-col gap-[2px] hover:text-yellow-300 transition-colors duration-300"
        >
          <MdOutlineShoppingCart className="w-[22px] h-[22px] md:w-7 md:h-7 hover:text-yellow-400 md:hidden" />{" "}
          Cart
        </button>
        <p className="absolute h-2.5 w-2.5 md:w-[18px] md:h-[18px] flex items-center justify-center bg-white px-[5px] py-0.5 text-[#10121a] rounded-full text-[10px] font-bold top-0 right-4.5 md:top-2  md:right-[18px]">
          {getCartCount()}
        </p>
      </div>
    </div>
  );
}

export default Nav;

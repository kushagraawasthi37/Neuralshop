import React, { useContext, useEffect, useState } from "react";
import logo from "../assets/asset/logo.png";
import { IoSearchCircleOutline, IoSearchCircleSharp } from "react-icons/io5";
import { FaCircleUser } from "react-icons/fa6";
import { MdOutlineShoppingCart } from "react-icons/md";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { HiOutlineCollection } from "react-icons/hi";
import { MdContacts } from "react-icons/md";
import axios from "../context/axiosInstance.js";
import { authDataContext } from "../context/AuthContext";
import { shopDataContext } from "../context/ShopContext";
import { toast } from "react-toastify";

function Nav() {
  let navigate = useNavigate();
  let adminURL = import.meta.env.VITE_ADMIN_URL;

  let { search, setSearch, showSearch, setShowSearch, getCartCount } =
    useContext(shopDataContext);

  let { serverUrl } = useContext(authDataContext);
  let { userData, getCurrentUser } = useContext(userDataContext);

  const [showProfile, setShowProfile] = useState(false);

  // Remove search text when closed
  useEffect(() => {
    if (!showSearch) setSearch("");
  }, [showSearch]);

  const logout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      toast.success("Logged out");
      localStorage.removeItem("authToken");
      await getCurrentUser();
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <nav
      className="
        w-full h-[70px] fixed top-0 left-0 z-50
        px-6 md:px-14
        flex items-center justify-between
        bg-[#031013]
        border-b border-[#0dd6d6]/40
        shadow-[0_0_18px_rgba(0,255,255,0.12)]
        select-none
      "
    >
      {/* LOGO */}
      <div className="flex items-center gap-3">
        <img
          src={logo}
          className="
            w-[45px] h-[45px] cursor-pointer
            rounded-xl shadow-[0_0_18px_rgba(0,255,255,0.25)]
            hover:scale-105 transition
          "
          onClick={() => navigate("/")}
        />
        <h1
          className="
            text-xl font-semibold tracking-wide
            bg-gradient-to-r from-cyan-300 to-teal-300
            bg-clip-text text-transparent
          "
        >
          NeuralShop
        </h1>
      </div>

      {/* DESKTOP NAVIGATION */}
      <ul className="hidden md:flex items-center gap-6 text-white/80 font-medium">
        {[
          { name: "HOME", path: "/" },
          { name: "COLLECTIONS", path: "/collection" },
          { name: "ABOUT", path: "/about" },
          { name: "CONTACT", path: "/contact" },
        ].map((item, idx) => (
          <li
            key={idx}
            onClick={() => navigate(item.path)}
            className="
              px-5 py-2 rounded-xl cursor-pointer
              bg-[#072125]
              border border-[#0dd6d6]/30
              shadow-[0_0_12px_rgba(0,255,255,0.12)]
              hover:bg-[#093035]
              hover:border-[#00f5f5]/60
              hover:text-[#00f5f5]
              transition-all
            "
          >
            {item.name}
          </li>
        ))}
      </ul>

      {/* RIGHT ICONS */}
      <div className="flex items-center gap-4 text-white">
        {/* Search icon */}
        {!showSearch ? (
          <IoSearchCircleOutline
            onClick={() => {
              navigate("/collection");
              setShowSearch(true);
            }}
            className="w-9 h-9 cursor-pointer hover:text-[#00f5f5] transition"
          />
        ) : (
          <IoSearchCircleSharp
            onClick={() => setShowSearch(false)}
            className="w-9 h-9 cursor-pointer text-[#00f5f5] transition"
          />
        )}

        {/* User icon */}
        {!userData ? (
          <FaCircleUser
            className="w-8 h-8 cursor-pointer hover:text-[#00f5f5] transition"
            onClick={() => setShowProfile(!showProfile)}
          />
        ) : (
          <div
            onClick={() => setShowProfile(!showProfile)}
            className="
              w-9 h-9 rounded-full bg-cyan-300 text-black
              flex items-center justify-center cursor-pointer
              shadow-[0_0_15px_rgba(0,255,255,0.4)]
              font-semibold
            "
          >
            {userData?.user?.name?.charAt(0)}
          </div>
        )}

        {/* Cart */}
        <div
          onClick={() => navigate("/cart")}
          className="relative cursor-pointer"
        >
          <MdOutlineShoppingCart className="w-8 h-8 hover:text-[#00f5f5] transition" />
          <span
            className="
              absolute -top-1 -right-2 w-5 h-5 rounded-full bg-[#00eaea]
              text-black flex items-center justify-center text-xs font-bold
              shadow-[0_0_10px_rgba(0,255,255,0.4)]
            "
          >
            {getCartCount()}
          </span>
        </div>
      </div>

      {/* SEARCH BAR UNDER NAV */}
      {showSearch && (
        <div
          className="
          absolute top-full left-0 w-full h-[55px]
          bg-[#031013]
          border-b border-[#0dd6d6]/40
          shadow-[0_0_12px_rgba(0,255,255,0.1)]
          flex items-center justify-center
        "
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Here..."
            className="
              w-[80%] md:w-[55%] h-[70%]
              rounded-xl
              bg-[#072125]
              border border-[#0dd6d6]/30
              px-5 text-white
              placeholder-cyan-200/40
              focus:outline-none focus:ring-2 focus:ring-[#00eaea]/40
            "
          />
        </div>
      )}

      {/* DROPDOWN PROFILE */}
      {showProfile && (
        <div
          className="
            absolute top-[105%] right-6 w-56
            bg-[#031013]
            border border-[#0dd6d6]/40
            rounded-2xl p-4 text-white/80
            shadow-[0_0_18px_rgba(0,255,255,0.18)]
            flex flex-col gap-4
          "
        >
          {!userData && (
            <p
              className="hover:text-[#00f5f5] cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Login
            </p>
          )}

          {userData && (
            <p className="hover:text-red-400 cursor-pointer" onClick={logout}>
              Logout
            </p>
          )}

          <p
            onClick={() => navigate("/order")}
            className="hover:text-[#00f5f5] cursor-pointer"
          >
            Orders
          </p>

          <p
            onClick={() => navigate("/about")}
            className="hover:text-[#00f5f5] cursor-pointer"
          >
            About
          </p>

          <a
            className="hover:text-[#00f5f5] cursor-pointer"
            href={adminURL}
            target="_blank"
          >
            Admin Mode
          </a>
        </div>
      )}

      {/* MOBILE NAV */}
      <div
        className="
        md:hidden w-full h-[55px] fixed bottom-0 left-0
        bg-[#031013]
        border-t border-[#0dd6d6]/40
        flex items-center justify-between px-6 text-white/80
      "
      >
        <button
          onClick={() => navigate("/")}
          className="flex flex-col items-center hover:text-[#00f5f5]"
        >
          <IoMdHome className="w-6 h-6" /> Home
        </button>

        <button
          onClick={() => navigate("/collection")}
          className="flex flex-col items-center hover:text-[#00f5f5]"
        >
          <HiOutlineCollection className="w-6 h-6" /> Collections
        </button>

        <button
          onClick={() => navigate("/contact")}
          className="flex flex-col items-center hover:text-[#00f5f5]"
        >
          <MdContacts className="w-6 h-6" /> Contact
        </button>

        <button
          onClick={() => navigate("/cart")}
          className="flex flex-col items-center hover:text-[#00f5f5] relative"
        >
          <MdOutlineShoppingCart className="w-6 h-6" />
          <span
            className="
            absolute -top-1 right-0 bg-[#00eaea] text-black 
            w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
          "
          >
            {getCartCount()}
          </span>
        </button>
      </div>
    </nav>
  );
}

export default Nav;

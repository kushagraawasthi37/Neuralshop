// Nav.jsx
import React, { useContext, useEffect, useState, useRef } from "react";
import logo from "../assets/asset/logo.png";
import { IoSearchCircleOutline, IoSearchCircleSharp } from "react-icons/io5";
import { FaCircleUser } from "react-icons/fa6";
import { MdOutlineShoppingCart } from "react-icons/md";
import { userDataContext } from "../context/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { HiOutlineCollection } from "react-icons/hi";
import { MdContacts } from "react-icons/md";
import axios from "../context/axiosInstance.js";
import { authDataContext } from "../context/AuthContext";
import { shopDataContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

/**
 * Safe magnetic hook: attach to an element to get a subtle follow/tilt effect.
 * Use inside components (not inside loops as a hook call).
 */
const useMagnetic = () => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = null;

    const handleMove = (e) => {
      // compute relative offset
      const rect = el.getBoundingClientRect();
      const offsetX = e.clientX - (rect.left + rect.width / 2);
      const offsetY = e.clientY - (rect.top + rect.height / 2);

      // apply a lightweight transform using requestAnimationFrame
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const tx = offsetX * 0.12;
        const ty = offsetY * 0.1;
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.03)`;
      });
    };

    const reset = () => {
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = `translate3d(0,0,0) scale(1)`;
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", reset);
    el.addEventListener("touchmove", handleMove, { passive: true });
    el.addEventListener("touchend", reset);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", reset);
      el.removeEventListener("touchmove", handleMove);
      el.removeEventListener("touchend", reset);
    };
  }, []);

  return ref;
};

/**
 * MagneticNavItem: each nav item encapsulates the magnetic hook + motion.
 * Keeps hook usage stable (one hook call per component).
 */
function MagneticNavItem({ item, active, onClick }) {
  const ref = useMagnetic();

  return (
    <motion.li
      ref={ref}
      onClick={onClick}
      whileHover={{ scale: 1.06 }}
      className={`relative w-28 lg:w-32 h-12 flex items-center justify-center rounded-2xl cursor-pointer text-white/90 font-semibold
        bg-[#072125]/80 backdrop-blur-xl border border-cyan-300/20
        shadow-[0_0_10px_rgba(0,255,255,0.08)]
        hover:bg-[#093035] hover:border-cyan-400/40 hover:text-cyan-300 transition-all duration-300
      `}
      role="button"
      aria-current={active ? "page" : undefined}
      title={item.name}
    >
      <span className="pointer-events-none select-none">{item.name}</span>

      {active && (
        <motion.div
          layoutId="activeNav"
          className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-20 h-[4px] rounded-full bg-cyan-400 shadow-[0_0_12px_cyan]"
        />
      )}
    </motion.li>
  );
}

function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminURL = import.meta.env.VITE_ADMIN_URL;

  // global states
  const { search, setSearch, showSearch, setShowSearch, getCartCount } =
    useContext(shopDataContext);

  const { serverUrl } = useContext(authDataContext);
  const { userData, getCurrentUser } = useContext(userDataContext);

  const [showProfile, setShowProfile] = useState(false);

  // NOTE: removed scroll-hide behavior — navbar is fixed and always visible
  // If you ever want hide-on-scroll, implement a separate effect (careful with UX).

  // reset search on close
  useEffect(() => {
    if (!showSearch) setSearch("");
  }, [showSearch, setSearch]);

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

  const navItems = [
    { name: "HOME", path: "/" },
    { name: "COLLECTIONS", path: "/collection" },
    { name: "ABOUT", path: "/about" },
    { name: "CONTACT", path: "/contact" },
  ];

  return (
    <>
      {/* ------------------------------
          ULTRA PREMIUM NAVBAR - FIXED
          ------------------------------ */}
      <motion.nav
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="
          fixed top-0 left-0 w-full h-[80px] z-[9999]
          flex items-center  justify-between px-6  md:px-14
          bg-[#021315]/80 backdrop-blur-2xl
          border-b border-cyan-400/20
          shadow-[0_10px_30px_rgba(0,0,0,0.6)]
        "
      >
        {/* LOGO */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
          aria-label="Go to home"
        >
          <img
            src={logo}
            alt="NeuralShop logo"
            className="w-[40px] h-[40px]
             sm:w-[46px] sm:h-[46px] rounded-xl
              shadow-[0_0_18px_rgba(0,255,255,0.20)]
              group-hover:scale-105 transition-transform duration-300
            "
          />
          <h1
            className="
             text-lg sm:text-2xl font-semibold tracking-wide
              bg-gradient-to-r from-cyan-300 to-teal-300
              bg-clip-text text-transparent
            "
          >
            NeuralShop
          </h1>
        </div>

        {/* DESKTOP NAV ITEMS */}
        <div className="hidden md:flex items-center gap-5 relative">
          <ul className="flex items-center gap-5">
            {navItems.map((item, idx) => {
              const active = location.pathname === item.path;
              return (
                <MagneticNavItem
                  key={idx}
                  item={item}
                  active={active}
                  onClick={() => navigate(item.path)}
                />
              );
            })}
          </ul>
        </div>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-2 sm:gap-4 text-white relative">
          {/* SEARCH ICON */}
          {showSearch ? (
            <IoSearchCircleSharp
              className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300 cursor-pointer hover:scale-110 transition"
              onClick={() => setShowSearch(false)}
              title="Close search"
              aria-label="Close search"
            />
          ) : (
            <IoSearchCircleOutline
              className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer hover:text-cyan-300 hover:scale-110 transition"
              onClick={() => {
                navigate("/collection");
                setShowSearch(true);
              }}
              title="Open search"
              aria-label="Open search"
            />
          )}

          {/* USER ICON / AVATAR */}
          {!userData ? (
            <FaCircleUser
              className="w-6 h-6 sm:w-9 sm:h-9 cursor-pointer hover:text-cyan-300 hover:scale-110 transition"
              onClick={() => setShowProfile(!showProfile)}
              title="Profile"
            />
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowProfile(!showProfile)}
              className="
              w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-cyan-300 text-black
                flex items-center justify-center font-bold shadow-lg cursor-pointer
                border border-cyan-400/20
              "
              aria-haspopup="true"
              aria-expanded={showProfile}
              title="Account"
            >
              {userData?.user?.name?.charAt(0) ?? "U"}
            </motion.button>
          )}

          {/* CART */}
          <div
            className="relative cursor-pointer"
            onClick={() => navigate("/cart")}
            title="Cart"
            aria-label="Cart"
          >
            <MdOutlineShoppingCart className="w-7 h-7 sm:w-9 sm:h-9 hover:text-cyan-300 transition-all" />
            <span
              className="
                absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-3 h-3 sm:w-5 sm:h-5 rounded-full
                bg-cyan-300 text-black text-xs flex items-center justify-center font-bold
                shadow-[0_0_8px_cyan]
              "
            >
              {getCartCount()}
            </span>
          </div>
        </div>

        {/* SEARCH BAR SLIDE DOWN - anchored to navbar bottom */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={
            showSearch ? { height: 58, opacity: 1 } : { height: 0, opacity: 0 }
          }
          transition={{ duration: 0.35 }}
          className="absolute top-full left-0 w-full overflow-hidden bg-[#021315]/95 backdrop-blur-2xl border-b border-cyan-400/20"
          style={{ zIndex: 9998 }}
        >
          {showSearch && (
            <div className="flex items-center justify-center h-[58px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="
                  w-[85%] md:w-[55%] h-[70%] rounded-xl px-6 text-white
                  bg-[#062024] border border-cyan-300/20 focus:ring-2 focus:ring-cyan-300/30 outline-none
                  placeholder-cyan-200/40
                "
                aria-label="Search products"
              />
            </div>
          )}
        </motion.div>

        {/* PROFILE DROPDOWN */}
        {showProfile && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="
              absolute top-[105%] right-6 w-60
              bg-[#021315]/95 backdrop-blur-2xl
              border border-cyan-400/20 rounded-xl p-4
              shadow-[0_8px_24px_rgba(0,0,0,0.6)]
              text-white flex flex-col gap-3
            "
            role="menu"
          >
            {!userData && (
              <button
                className="text-left cursor-pointer hover:text-cyan-300"
                onClick={() => {
                  setShowProfile(false);
                  navigate("/login");
                }}
              >
                Login
              </button>
            )}
            {userData && (
              <button
                className="text-left cursor-pointer hover:text-red-400"
                onClick={logout}
              >
                Logout
              </button>
            )}
            <button
              className="text-left cursor-pointer hover:text-cyan-300"
              onClick={() => {
                setShowProfile(false);
                navigate("/order");
              }}
            >
              Orders
            </button>
            <button
              className="text-left cursor-pointer hover:text-cyan-300"
              onClick={() => {
                setShowProfile(false);
                navigate("/about");
              }}
            >
              About
            </button>
            <a
              href={adminURL}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer hover:text-cyan-300"
            >
              Admin Mode
            </a>
          </motion.div>
        )}
      </motion.nav>

      {/* ------------------------------
          MOBILE BOTTOM NAV (visible on small)
          ------------------------------ */}
      <div
        className="
          md:hidden fixed -bottom-3 left-0 w-full h-[64px] z-[9999]
          bg-[#021315]/95 backdrop-blur-2xl border-t border-cyan-400/20
          flex items-center justify-between px-6 text-white
        "
      >
        <button
          onClick={() => navigate("/")}
          className="flex flex-col items-center text-xs hover:text-cyan-300"
        >
          <IoMdHome className="w-6 h-6" /> Home
        </button>

        <button
          onClick={() => navigate("/collection")}
          className="flex flex-col items-center text-xs hover:text-cyan-300"
        >
          <HiOutlineCollection className="w-6 h-6" /> Collections
        </button>

        <button
          onClick={() => navigate("/contact")}
          className="flex flex-col items-center text-xs hover:text-cyan-300"
        >
          <MdContacts className="w-6 h-6" /> Contact
        </button>

        <button
          onClick={() => navigate("/cart")}
          className="flex flex-col items-center text-xs hover:text-cyan-300 relative"
        >
          <MdOutlineShoppingCart className="w-8 h-8" />
          Cart
          <span className="absolute -top-1 right-0 w-4 h-4 bg-cyan-300 text-black text-[10px] rounded-full flex justify-center items-center font-bold">
            {getCartCount()}
          </span>
        </button>
      </div>
    </>
  );
}

export default Nav;

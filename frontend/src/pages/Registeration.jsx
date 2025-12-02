import React, { useContext, useEffect, useState, useRef } from "react";
import Logo from "../assets/asset/logo.png";
import { useNavigate } from "react-router-dom";
import google from "../assets/asset/google.png";
import { IoEyeOutline, IoEye } from "react-icons/io5";
import { authDataContext } from "../context/AuthContext";
import axios from "../context/axiosInstance.js";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import { userDataContext } from "../context/UserContext";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import gsap from "gsap";

function Registeration() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const { serverUrl } = useContext(authDataContext);
  const { getCurrentUser } = useContext(userDataContext);

  // animation refs
  const cardRef = useRef(null);

  // GSAP smooth intro animation
  useEffect(() => {
    gsap.from(cardRef.current, {
      y: 40,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
    });
  }, []);

  // 3D tilt interaction
  useEffect(() => {
    const card = cardRef.current;

    const handleMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const accelX = (x / rect.width) * 20;
      const accelY = (y / rect.height) * 20;

      gsap.to(card, {
        rotateY: accelX,
        rotateX: -accelY,
        transformPerspective: 900,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const resetTilt = () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.6,
        ease: "power3.out",
      });
    };

    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseleave", resetTilt);

    return () => {
      card.removeEventListener("mousemove", handleMove);
      card.removeEventListener("mouseleave", resetTilt);
    };
  }, []);

  // Signup Logic
  const handleSignup = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);

      const response = await axios.post(
        `${serverUrl}/api/auth/registeration`,
        { name, email, password },
        { withCredentials: true }
      );

      if (response?.data?.token) {
        localStorage.setItem("authToken", response.data.token);
      }

      await getCurrentUser();
      navigate("/");
      toast.success("User Registration Successful");

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(
        error.response?.data?.message || error.message || "Signup Failed"
      );
    }
  };

  const googleSignup = async () => {
    try {
      const response = await signInWithPopup(auth, provider);
      const user = response.user;

      const result = await axios.post(
        `${serverUrl}/api/auth/googlelogin`,
        { email: user.email, name: user.displayName },
        { withCredentials: true }
      );

      if (result?.data?.token) {
        localStorage.setItem("authToken", result.data.token);
      }

      await getCurrentUser();
      navigate("/");
      toast.success("User Registration Successful");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Google Authentication Failed"
      );
    }
  };

  return (
    <div className="w-screen h-screen bg-linear-to-l from-[#141414] to-[#0c2025] text-white flex flex-col items-center justify-center">
      {/* Header */}
      <div className="w-full h-[100px] flex flex-col items-center justify-center gap-2">
        <span className="flex items-center justify-center text-[2rem] font-bold text-[#5796E3] gap-2">
          Join NeuralShop
          <img
            className="w-12 cursor-pointer"
            src={Logo}
            alt="logo"
            onClick={() => navigate("/")}
          />
        </span>
        <span className="text-white/50 text-[14px]">
          Sign Up to Shop Smarter Today
        </span>
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        className="max-w-[600px] w-[90%] h-[500px] bg-[#ffffff10] border border-[#ffffff18]
        rounded-xl shadow-breathe backdrop-blur-xl flex items-center justify-center
        transition-all duration-300 will-change-transform"
      >
        <form
          onSubmit={handleSignup}
          className="w-[90%] h-[90%] flex flex-col items-center justify-start gap-5"
        >
          {/* Google Signup */}
          <div
            onClick={googleSignup}
            className="w-[90%] h-[50px] bg-[#5796e3d6] rounded-lg flex items-center justify-center gap-3 cursor-pointer hover:bg-[#2f7eded6] hover:scale-[0.97] transition-all duration-200"
          >
            <img src={google} className="w-5" /> Continue with Google
          </div>

          <div className="flex w-full items-center justify-center gap-3 text-white/50">
            <div className="w-[40%] h-px bg-white/20"></div> OR{" "}
            <div className="w-[40%] h-px bg-white/20"></div>
          </div>

          {/* Inputs */}
          <div className="w-[90%] flex flex-col items-center gap-4 relative">
            <input
              type="text"
              placeholder="UserName"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-[50px] border-2 border-white/20 rounded-lg bg-transparent placeholder-white/70 px-5 font-semibold shadow-breathe focus:border-[#5796E3] transition-all duration-300"
            />

            <input
              type="text"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[50px] border-2 border-white/20 rounded-lg bg-transparent placeholder-white/70 px-5 font-semibold shadow-breathe focus:border-[#5796E3] transition-all duration-300"
            />

            <div className="relative w-full">
              <input
                type={show ? "text" : "password"}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[50px] border-2 border-white/20 rounded-lg bg-transparent placeholder-white/70 px-5 font-semibold shadow-breathe focus:border-[#5796E3] transition-all duration-300"
              />

              {show ? (
                <IoEye
                  className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShow(false)}
                />
              ) : (
                <IoEyeOutline
                  className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShow(true)}
                />
              )}
            </div>

            {/* Submit */}
            <button className="w-full h-[50px] bg-[#5796e3d7] rounded-lg text-[17px] font-semibold hover:scale-[0.97] hover:bg-[#2f7eded6] transition-all duration-200 mt-2">
              {loading ? <Loading /> : "Create Account"}
            </button>

            <p className="flex gap-2 text-white/50 text-[15px]">
              Already have an account?
              <span
                className="text-[#5796E3] cursor-pointer font-semibold"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Registeration;

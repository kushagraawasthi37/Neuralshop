import React, { useContext, useState } from "react";
import Logo from "../assets/asset/logo.png";
import { useNavigate } from "react-router-dom";
import google from "../assets/asset/google.png";
import { IoEyeOutline } from "react-icons/io5";
import { IoEye } from "react-icons/io5";
import { authDataContext } from "../context/authContext";
import axios from "../context/axiosInstance.js";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import { userDataContext } from "../context/UserContext";
import { toast } from "react-toastify";
import Loading from "../components/Loading";

function Registeration() {
  let navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [show, setShow] = useState(false);
  const { serverUrl } = useContext(authDataContext);
  const { getCurrentUser } = useContext(userDataContext);

  const handleSignup = async (e) => {
    try {
      console.log("form submitted");
      e.preventDefault();

      const response = await axios.post(
        `${serverUrl}/api/auth/registeration`,
        {
          name,
          email,
          password,
        },
        { withCredentials: true }
      );
      console.log(response.data);
      console.log(response.data.token);

      // Save token to localStorage
      if (response?.data?.token) {
        localStorage.setItem("authToken", response.data.token);
      }

      await getCurrentUser();
      navigate("/");
      toast.success("User Registration Successful");
      setLoading(false);

      // console.log(response.data.message);
    } catch (error) {
      console.log(error);
      const errorMessage =
        error.response?.data?.message || error.message || "signup Failed";
      toast.error(errorMessage);
    }
  };

  const googleSignup = async () => {
    try {
      const response = await signInWithPopup(auth, provider);
      const user = response.user;
      const name = user.displayName;
      const email = user.email;

      const result = await axios.post(
        `${serverUrl}/api/auth/googlelogin`,
        { email, name },
        {
          withCredentials: true,
        }
      );
      console.log(result.data);
      console.log(result.data.token);
      // Save token to localStorage
      if (result?.data?.token) {
        localStorage.setItem("authToken", result.data.token);
      }

      await getCurrentUser();
      navigate("/");
      toast.success("User Registration Successful");

      console.log(result.data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Google Authentication Failed";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-screen h-screen bg-linear-to-l from-[#141414] to-[#0c2025] text-[white] flex flex-col items-center justify-center">
      {/* Top of register page */}
      <div className="w-full h-[100px] flex items-center justify-center flex-col gap-1 md:gap-2.5">
        <span className="flex items-center justify-center text-[1.5rem] md:text-[2.2rem] font-bold text-[#5796E3] gap-2">
          Join NeuralShop
          <img
            className="w-6 md:w-10 hover:cursor-pointer"
            src={Logo}
            alt=""
            onClick={() => {
              navigate("/");
            }}
          />
        </span>
        <span className="text-[12px] md:text-[16px] text-white/50 ">
          Sign Up to Shop Smarter Today
        </span>
      </div>

      {/* Register Page Card */}
      <div className="max-w-[600px] w-[90%] h-[500px] bg-[#00000025] border border-[#96969635] backdrop:blur-2xl rounded-lg shadow-lg flex items-center justify-center ">
        <form
          onSubmit={handleSignup}
          action=""
          className="w-[90%] h-[90%] flex flex-col items-center justify-start gap-5"
        >
          <div
            onClick={googleSignup}
            className="w-[90%] h-[50px] bg-[#5796e3d6] rounded-lg flex items-center justify-center gap-2.5 py-5 cursor-pointer hover:bg-[#2f7eded6] hover:scale-95 transition-all duration-200 ease-in-out"
          >
            <img src={google} alt="" className="w-5" /> Continue with Google
          </div>
          <div className="w-full h-5 flex items-center justify-center gap-2.5">
            <div className="w-[40%] h-px bg-[#96969635]"></div> OR{" "}
            <div className="w-[40%] h-px bg-[#96969635]"></div>
          </div>
          <div className="w-[90%] h-[400px] flex flex-col items-center justify-center gap-[15px]  relative">
            <input
              type="text"
              className="w-full h-[50px] border-2 border-[#96969635] backdrop:blur-sm rounded-lg shadow-lg bg-transparent placeholder-[#ffffffc7] px-5 font-semibold"
              placeholder="UserName"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <input
              type="text"
              className="w-full h-[50px] border-2 border-[#96969635] backdrop:blur-sm rounded-lg shadow-lg bg-transparent placeholder-[#ffffffc7] px-5 font-semibold"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <input
              type={show ? "text" : "password"}
              className="w-full h-[50px] border-2 border-[#96969635] backdrop:blur-sm rounded-lg shadow-lg bg-transparent placeholder-[#ffffffc7] px-5 font-semibold"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            {/* Agar show nhi kiya hai to ye icon */}
            {!show && (
              <IoEyeOutline
                className="w-5 h-5 cursor-pointer absolute right-[5%]"
                onClick={() => {
                  setShow((prev) => !prev);
                }}
              />
            )}
            {/* Agar show kiya hai to ye icon */}

            {show && (
              <IoEye
                className="w-5 h-5 cursor-pointer absolute right-[5%]"
                onClick={() => {
                  setShow((prev) => !prev);
                }}
              />
            )}
            <button className=" w-full h-[50px] bg-[#5796e3d7] rounded-lg flex items-center justify-center mt-5 text-[17px] font-semibold hover:scale-95 hover:bg-[#2f7eded6] hover:cursor-pointer transition-all duration-200 ease-in-out">
              {loading ? <Loading /> : "Create Account"}
            </button>
            <p className="flex gap-2.5 text-white/50">
              You have any account?{" "}
              <span
                className="text-[rgba(85,85,246,0.81)] text-[17px] font-semibold cursor-pointer"
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

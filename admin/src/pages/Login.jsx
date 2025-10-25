import React, { useContext, useState } from "react";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { IoEyeOutline } from "react-icons/io5";
import { IoEye } from "react-icons/io5";
import axios from "axios";
import { authDataContext } from "../context/authContext";
import { adminDataContext } from "../context/AdminContext";

function Login() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { serverUrl } = useContext(authDataContext);
  const { adminData, setAdminData, getCurrentAdmin } =
    useContext(adminDataContext);

  const loginHandler = async (e) => {
    try {
      e.preventDefault();
      console.log(serverUrl);

      const response = await axios.post(
        `${serverUrl}/api/auth/adminlogin`,
        { email, password },
        {
          withCredentials: true,
        }
      );
      getCurrentAdmin();
      navigate("/");

      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-screen h-screen bg-linear-to-l from-[#141414] to-[#0c2025] text-[white] flex flex-col items-center justify-center">
      {/* Top of register page */}
      <div className="w-full h-[100px] flex items-center justify-center flex-col gap-1 md:gap-1.5">
        <span className="flex items-center justify-center text-[2rem] md:text-[2.5rem] font-bold text-[#5796E3] gap-2">
          Login
          <img
            className="w-6 md:w-10 hover:cursor-pointer"
            src={Logo}
            alt=""
            onClick={() => {
              navigate("/");
            }}
          />
        </span>
        <span className="text-[17px] md:text-[17px] text-white/50 ">
          Sign in to manage. Lead your marketplace
        </span>
      </div>

      {/* Register Page Card */}
      <div className="max-w-[600px] w-[90%] h-[500px] bg-[#00000025] border border-[#96969635] backdrop:blur-2xl rounded-lg shadow-lg flex items-center justify-center ">
        <form
          onSubmit={loginHandler}
          className="w-[90%] h-[90%] flex flex-col items-center justify-start gap-5"
        >
          <div className="w-[90%] h-[400px] flex flex-col items-center justify-center gap-[15px]  relative">
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
                className="w-5 h-5 cursor-pointer absolute bottom-[56%] right-[4%]"
                onClick={() => {
                  setShow((prev) => !prev);
                }}
              />
            )}
            {/* Agar show kiya hai to ye icon */}

            {show && (
              <IoEye
                className="w-5 h-5 cursor-pointer absolute bottom-[56%] right-[4%]"
                onClick={() => {
                  setShow((prev) => !prev);
                }}
              />
            )}
            <button className=" w-full h-[50px] bg-[#6060f5] rounded-lg flex items-center justify-center mt-5 md:text-[17px] font-semibold active:scale-95 hover:bg-[#000075] hover:cursor-pointer">
              Login
            </button>
            <p className="text-4 md:text-5 flex gap-2.5 text-white/50">
              Don't have an Admin Account?{" "}
              <span
                className="text-[rgba(85,85,246,0.81)] text-[17px] font-semibold cursor-pointer "
                onClick={() => navigate("/signup")}
              >
                Register
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

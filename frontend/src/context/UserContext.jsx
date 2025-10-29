import React, { createContext, useContext, useState, useEffect } from "react";
import { authDataContext } from "./AuthContext.jsx";
import axios from "../context/axiosInstance.js";
import { toast } from "react-toastify";

export const userDataContext = createContext();

const UserContext = (props) => {
  const children = props.children;
  const [userData, setUserData] = useState(undefined); // undefined means loading state

  const { serverUrl } = useContext(authDataContext);

  const getCurrentUser = async () => {
    try {
      let response = await axios.post(
        `${serverUrl}/api/user/getcurrentuser`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response?.data?.token) {
        localStorage.setItem("authToken", response?.data?.token);
      }

      // console.log(response.data);
      setUserData(response.data);
    } catch (error) {
      setUserData(null);
      localStorage.removeItem("authToken");

      // const errorMessage =
      //   error.response?.data?.message || error.message || "Login Failed";
      // toast.error(errorMessage);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      // No token — user logged out
      setUserData(null);
    } else {
      // Token found — verify user session
      getCurrentUser();
    }
  }, []);

  const logout = () => {
    setUserData(null);
    localStorage.removeItem("authToken");
  };

  let value = {
    userData,
    setUserData,
    getCurrentUser,
    logout,
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;

import React, { createContext, useContext, useState, useEffect } from "react";
import { authDataContext } from "./authContext";
import axios from "../context/axiosInstance.js";

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

      console.log(response.data);
      setUserData(response.data);
    } catch (error) {
      setUserData(null);
      localStorage.removeItem("authToken");
      console.log(error);
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

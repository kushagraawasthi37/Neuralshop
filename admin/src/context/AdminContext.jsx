import React, { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import { authDataContext } from "./AuthContext.jsx";
import axios from "./axiosInstance.js";
import { toast } from "react-toastify";

export const adminDataContext = createContext();

const AdminContext = (props) => {
  const { children } = props;
  const { serverUrl } = useContext(authDataContext);
  const [adminData, setAdminData] = useState(undefined);

  const getCurrentAdmin = async () => {
    try {
      // console.log(localStorage.getItem("authToken"));
      const response = await axios.post(
        `${serverUrl}/api/user/getcurrentadmin`,
        {},
        { withCredentials: true }
      );

      // console.log(response);
      // console.log(response?.data?.admin);

      if (response?.data?.admin) {
        setAdminData(response.data.admin);
      } else {
        // No admin info means unauthenticated
        setAdminData(null);
      }
    } catch (error) {
      // const errorMessage =
      //   error.response?.data?.message || error.message || "Login Failed";
      // toast.error(errorMessage);
      setAdminData(null);
      localStorage.removeItem("authToken");
      // console.log("can not fetch current admin something went wrong", error);
    }
  };
  useEffect(() => {
    getCurrentAdmin();
  }, []);

  const value = {
    adminData,
    setAdminData,
    getCurrentAdmin,
  };

  return (
    <>
      <adminDataContext.Provider value={value}>
        {children}
      </adminDataContext.Provider>
    </>
  );
};

export default AdminContext;

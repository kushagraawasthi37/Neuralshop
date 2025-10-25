import React, { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import { authDataContext } from "./authContext";
import axios from "axios";

export const adminDataContext = createContext();

const AdminContext = (props) => {
  const { children } = props;
  const { serverUrl } = useContext(authDataContext);
  const [adminData, setAdminData] = useState({});

  const getCurrentAdmin = async () => {
    try {
      const respose = await axios.post(
        `${serverUrl}/api/user/getcurrentadmin`,
        {},
        { withCredentials: true }
      );
      console.log(respose.data);
      setAdminData(respose.data);
    } catch (error) {
      console.log("can not fetch current admin something went wrong", error);
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

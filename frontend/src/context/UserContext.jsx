import React, { createContext } from "react";
import { useContext } from "react";
import { useState } from "react";
import { authDataContext } from "./authContext";
import axios from "axios";
import { useEffect } from "react";
export const userDataContext = createContext();

const UserContext = (props) => {
  const children = props.children;
  const [userData, setUserData] = useState({});

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
      console.log(error);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  let value = {
    userData,
    setUserData,
    getCurrentUser,
  };

  return (
    <userDataContext.Provider value={value}>
      {" "}
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;

import React from "react";
import { createContext } from "react";

export const authDataContext = createContext();

const AuthContext = (props) => {
  let serverUrl = "http://localhost:8000";
  const children = props.children;
  let value = {
    serverUrl,
  };
  return (
    <div>
      <authDataContext.Provider value={value}>
        {children}
      </authDataContext.Provider>
    </div>
  );
};

export default AuthContext;

import React, { createContext } from "react";

export const authDataContext = createContext();
const AuthContext = (props) => {
  let { children } = props;
  let serverUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
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

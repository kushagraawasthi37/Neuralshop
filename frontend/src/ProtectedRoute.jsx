import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { userDataContext } from "./context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { userData } = useContext(userDataContext);
  const location = useLocation();

  // Read token from localStorage
  const token = localStorage.getItem("authToken");

  // Show nothing (or a spinner) while userData is loading
  if (userData === undefined) {
    return null; // or return <LoadingSpinner />
  }

  // If no userData AND no token, redirect to login
  if ((!userData || Object.keys(userData).length === 0) && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated (via userData or token), show children
  return children;
};

export default ProtectedRoute;

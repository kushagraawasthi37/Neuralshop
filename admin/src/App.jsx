import React, { useContext, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Orders from "./pages/Orders";
import Lists from "./pages/Lists";
import Add from "./pages/Add";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Registeration from "./pages/Registeration";
import { adminDataContext } from "./context/AdminContext";
import { ToastContainer, toast } from "react-toastify";
import NotFound from "./pages/NotFound";


const ProtectedRoute = ({ children }) => {
  const { adminData } = useContext(adminDataContext);
  const token = localStorage.getItem("authToken");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      adminData !== undefined && // wait for loading to finish
      (!adminData ||
        Object.keys(adminData).length === 0 ||
        adminData.message) &&
      !token
    ) {
      navigate("/login", { state: { from: location }, replace: true });
    }
  }, [adminData, token, navigate, location]);

  if (adminData === undefined) return null; // or loading spinner

  // Prevent rendering children if navigating away
  if (
    (!adminData || Object.keys(adminData).length === 0 || adminData.message) &&
    !token
  ) {
    return null;
  }

  return children;
};

const App = () => {
  const { adminData } = useContext(adminDataContext);

  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Registeration />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <Add />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lists"
          element={
            <ProtectedRoute>
              <Lists />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
        {/* Optionally add a catch-all route for 404 or redirect */}
      </Routes>
    </>
  );
};

export default App;

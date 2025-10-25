import React from "react";
import { Route, Routes } from "react-router-dom";
import Orders from "./pages/Orders";
import Lists from "./pages/Lists";
import Add from "./pages/Add";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Registeration from "./pages/Registeration";
import { useContext } from "react";
import { adminDataContext } from "./context/AdminContext";

const App = () => {
  let { adminData } = useContext(adminDataContext);
  return (
    <>
      {!adminData ? (
        <Login />
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Registeration />} />
          <Route path="/add" element={<Add />} />
          <Route path="/login" element={<Login />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      )}
    </>
  );
};

export default App;

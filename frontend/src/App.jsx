import React from "react";
import { Route, Routes } from "react-router-dom";
import Registeration from "./pages/Registeration";
import Home from "./pages/Home";
import Login from "./pages/Login";
const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Registeration />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
};

export default App;

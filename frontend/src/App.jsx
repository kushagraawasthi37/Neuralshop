import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import Registeration from "./pages/Registeration";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Nav from "./components/Nav";
import { userDataContext } from "./context/UserContext";
const App = () => {
  let { userData } = useContext(userDataContext);
  return (
    <>
      {userData && <Nav />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Registeration />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
};

export default App;

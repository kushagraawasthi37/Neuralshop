import React, { useContext } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Registeration from "./pages/Registeration";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Nav from "./components/Nav";
import { userDataContext } from "./context/UserContext";
import Collections from "./pages/Collections";
import About from "./pages/About";
import Product from "./pages/Product";
import Contact from "./pages/Contact";
const App = () => {
  let { userData } = useContext(userDataContext);
  let location = useLocation();
  return (
    <>
      {userData && <Nav />}

      <Routes>
        <Route
          path="/signup"
          element={
            userData ? (
              <Navigate to={location.state?.from || "/"} />
            ) : (
              <Registeration />
            )
          }
        />
        <Route
          path="/login"
          element={
            userData ? <Navigate to={location.state?.from || "/"} /> : <Login />
          }
        />

        <Route
          path="/"
          element={
            userData ? (
              <Home />
            ) : (
              <Navigate to="/login" state={{ from: location.pathname }} />
            )
          }
        />

        <Route
          path="/about"
          element={
            userData ? (
              <About />
            ) : (
              <Navigate to="/login" state={{ from: location.pathname }} />
            )
          }
        />

        <Route
          path="/collection"
          element={
            userData ? (
              <Collections />
            ) : (
              <Navigate to="/login" state={{ from: location.pathname }} />
            )
          }
        />

        <Route
          path="/product"
          element={
            userData ? (
              <Product />
            ) : (
              <Navigate to="/login" state={{ from: location.pathname }} />
            )
          }
        />

        <Route
          path="/contact"
          element={
            userData ? (
              <Contact />
            ) : (
              <Navigate to="/login" state={{ from: location.pathname }} />
            )
          }
        />
      </Routes>
    </>
  );
};

export default App;

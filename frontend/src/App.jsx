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
import ProtectedRoute from "./ProtectedRoute";
import ProductDetail from "./pages/ProductDetail"
import Cart from "./pages/Cart";

const App = () => {
  const { userData } = useContext(userDataContext);
  const location = useLocation();

  // Show Nav if userData is present and valid (logged in)
  const isLoggedIn = userData && Object.keys(userData).length > 0;

  return (
    <>
      {isLoggedIn && <Nav />} {/* Render Nav once for logged-in users */}
      <Routes>
        <Route path="/signup" element={<Registeration />} />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to={location.state?.from || "/"} replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Protected routes without Nav wrapping */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collection"
          element={
            <ProtectedRoute>
              <Collections />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product"
          element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/productdetail/:productId"
          element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart/>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;

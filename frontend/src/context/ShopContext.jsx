import React, { createContext, useContext, useEffect, useState } from "react";
import { authDataContext } from "./AuthContext";
import axios from "../context/axiosInstance.js";
import { userDataContext } from "./UserContext";
import { toast } from "react-toastify";

export const shopDataContext = createContext();
function ShopContext({ children }) {
  const [size, setSize] = useState("");
  const [productData, setProductData] = useState(null);
  let [products, setProducts] = useState([]);
  let [search, setSearch] = useState("");
  let { userData } = useContext(userDataContext);
  let [showSearch, setShowSearch] = useState(false);
  let { serverUrl } = useContext(authDataContext);
  let [cartItem, setCartItem] = useState({});
  let [loading, setLoading] = useState(false);

  let currency = "₹";
  let delivery_fee = 40;

  const getProducts = async () => {
    try {
      let result = await axios.get(serverUrl + "/api/product/list");
      console.log(result.data);
      setProducts(result.data.product);
      if (result?.data?.token) {
        localStorage.setItem("authToken", result.data.token);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Get Product failed";
      toast.error(errorMessage);
    }
  };

  const addtoCart = async (itemId, size) => {
    if (!size) {
      // console.log("Select Product Size");
      toast.error("Select size");
      return;
    }

    let cartData = structuredClone(cartItem); // Clone the product

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    setCartItem(cartData);

    if (userData) {
      setLoading(true);
      try {
        let result = await axios.post(
          serverUrl + "/api/cart/add",
          { itemId, size },
          { withCredentials: true }
        );
        if (result?.data?.token) {
          localStorage.setItem("authToken", result.data.token);
        }
        toast.success("Product Added");
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Add to cart failed";
        toast.error(errorMessage);
      }
    }
  };

  const getUserCart = async () => {
    try {
      const result = await axios.post(
        serverUrl + "/api/cart/get",
        {},
        { withCredentials: true }
      );

      if (result?.data?.token) {
        localStorage.setItem("authToken", result.data.token);
      }

      setCartItem(result?.data?.cartData);
    } catch (error) {
      console.log(error);
    }
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItem);

    cartData[itemId][size] = quantity;
    setCartItem(cartData);

    if (userData) {
      try {
        const result = await axios.post(
          serverUrl + "/api/cart/update",
          { itemId, size, quantity },
          { withCredentials: true }
        );
        if (result?.data?.token) {
          localStorage.setItem("authToken", result.data.token);
        }
        toast.success("Cart Updated ")
      } catch (error) {
        console.log(error);

      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItem) {
      for (const item in cartItem[items]) {
        try {
          if (cartItem[items][item] > 0) {
            totalCount += cartItem[items][item];
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItem) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItem[items]) {
        try {
          if (cartItem[items][item] > 0) {
            totalAmount += itemInfo.price * cartItem[items][item];
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    return totalAmount;
  };

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    getUserCart();
  }, []);

  let value = {
    size,
    setSize,
    productData,
    setProductData,
    products,
    currency,
    delivery_fee,
    getProducts,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItem,
    addtoCart,
    getCartCount,
    setCartItem,
    updateQuantity,
    getCartAmount,
    loading,
  };
  return (
    <div>
      <shopDataContext.Provider value={value}>
        {children}
      </shopDataContext.Provider>
    </div>
  );
}

export default ShopContext;

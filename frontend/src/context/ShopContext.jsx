import React, {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authDataContext } from "./authContext";
import axios from "axios";

export const shopDataContext = createContext();
const ShopContext = ({ children }) => {
  let [products, setProducts] = useState([]);
  let { serverUrl } = useContext(authDataContext);
  let currency = "$";
  let delivery_fee = 40;

  const getProducts = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/product/list`, {
        withCredentials: true,
      });
      // console.log("done");
      // console.log(response.data);
      setProducts(response.data);
      // console.log(products);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const value = {
    products,
    currency,
    delivery_fee,
    getProducts,
  };

  return (
    <div>
      <shopDataContext.Provider value={value}>
        {children}
      </shopDataContext.Provider>
    </div>
  );
};

export default ShopContext;

import React, { useContext, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import razorpay from "../assets/asset/Razorpay.jpg";
import { shopDataContext } from "../context/ShopContext";
import { authDataContext } from "../context/authContext";
import axios from "../context/axiosInstance.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../components/Loading";

function PlaceOrder() {
  let [method, setMethod] = useState("cod");
  let navigate = useNavigate();
  const { cartItem, setCartItem, getCartAmount, delivery_fee, products } =
    useContext(shopDataContext);
  let { serverUrl } = useContext(authDataContext);
  let [loading, setLoading] = useState(false);

  let [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Order Payment",
      description: "Order Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log(response);
        const { data } = await axios.post(
          serverUrl + "/api/order/verifyrazorpay",
          response,
          { withCredentials: true }
        );
        if (data) {
          navigate("/order");
          setCartItem({});
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const onSubmitHandler = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      let orderItems = [];
      for (const items in cartItem) {
        for (const item in cartItem[items]) {
          if (cartItem[items][item] > 0) {
            const itemInfo = structuredClone(
              products.find((product) => product._id === items)
            );
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItem[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }
      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      };
      switch (method) {
        case "cod": {
          const result = await axios.post(
            serverUrl + "/api/order/placeorder",
            orderData,
            { withCredentials: true }
          );
          // console.log(result.data);
          if (result.data) {
            setCartItem({});
            toast.success("Order Placed");
            navigate("/order");
            setLoading(false);
          } else {
            // console.log(result.data.message);
            toast.error("Order Placed Error");
            setLoading(false);
          }
          if (result?.data?.token) {
            localStorage.setItem("authToken", result.data.token);
          }

          break;
        }
        case "razorpay": {
          const resultRazorpay = await axios.post(
            serverUrl + "/api/order/razorpay",
            orderData,
            { withCredentials: true }
          );
          if (resultRazorpay.data) {
            initPay(resultRazorpay.data);
            toast.success("Order Placed");
            setLoading(false);
          }

          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-[100vw] min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] flex items-center justify-center flex-col md:flex-row gap-[50px]  relative">
      <div className="lg:w-[50%] w-[100%] h-[100%] flex items-center justify-center text-white lg:mt-[0px] mt-[90px] ">
        <form
          action=""
          onSubmit={onSubmitHandler}
          className="lg:w-[70%]  w-[95%] lg:h-[70%] h-[100%]"
        >
          <div
            className="px-3 sm:px-0
          sm:py-2.5"
          >
            <Title text1={"DELIVERY"} text2={"INFORMATION"} />
          </div>
          <div className="w-full h-12 sm:h-[65px] flex items-center justify-between px-[10px]">
            <input
              type="text"
              placeholder="First name"
              className="w-[48%] h-10 sm:h-[50px] rounded-md bg-slate-700 placeholder:text-[white] text-[18px] px-[20px] shadow-sm shadow-[#343434]"
              required
              onChange={onChangeHandler}
              name="firstName"
              value={formData.firstName}
            />

            <input
              type="text"
              placeholder="Last name"
              className="w-[48%] h-10 sm:h-[50px] rounded-md shadow-sm shadow-[#343434] bg-slate-700 placeholder:text-[white] text-[18px] px-[20px]"
              required
              onChange={onChangeHandler}
              name="lastName"
              value={formData.lastName}
            />
          </div>

          <div className="w-[100%] h-12  sm:h-[65px] flex items-center justify-between px-[10px]">
            <input
              type="email"
              placeholder="Email address"
              className="w-[100%] h-10 sm:h-[50px] rounded-md shadow-sm shadow-[#343434] bg-slate-700 placeholder:text-[white] text-[18px] px-[20px]"
              required
              onChange={onChangeHandler}
              name="email"
              value={formData.email}
            />
          </div>
          <div className="w-[100%] h-12  sm:h-[65px] flex items-center justify-between px-[10px]">
            <input
              type="text"
              placeholder="Street"
              className="w-[100%] h-10 sm:h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]"
              required
              onChange={onChangeHandler}
              name="street"
              value={formData.street}
            />
          </div>
          <div className="w-[100%] h-12  sm:h-[65px] flex items-center justify-between px-[10px]">
            <input
              type="text"
              placeholder="City"
              className="w-[48%] h-10 sm:h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]"
              required
              onChange={onChangeHandler}
              name="city"
              value={formData.city}
            />
            <input
              type="text"
              placeholder="State"
              className="w-[48%] h-10 sm:h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]"
              required
              onChange={onChangeHandler}
              name="state"
              value={formData.state}
            />
          </div>
          <div className="w-[100%] h-12  sm:h-[65px] flex items-center justify-between px-[10px]">
            <input
              type="text"
              placeholder="Pincode"
              className="w-[48%] h-10 sm:h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]"
              required
              onChange={onChangeHandler}
              name="pinCode"
              value={formData.pinCode}
            />
            <input
              type="text"
              placeholder="Country"
              className="w-[48%] h-10 sm:h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]"
              required
              onChange={onChangeHandler}
              name="country"
              value={formData.country}
            />
          </div>
          <div className="w-[100%] h-12  sm:h-[65px] flex items-center justify-between px-[10px]">
            <input
              type="text"
              placeholder="Phone"
              className="w-[100%] h-10 sm:h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]"
              required
              onChange={onChangeHandler}
              name="phone"
              value={formData.phone}
            />
          </div>
          <div>
            <button
              type="submit"
              className=" text-[18px] px-6 sm:px-10  py-2 sm:py-3 rounded-2xl
             font-bold
             flex items-center justify-center gap-[20px]
      text-white select-none
      bg-gradient-to-r from-[#3bcee8]/80 via-[#2f97f1]/80 to-[#44c0f1]/80
      border border-[#40f2f7]/60
      shadow-xl
      transition-all duration-300
      absolute md:right-[1%] right-[30%] sm:right-[35%] bottom-[14.5%] sm:bottom-[10%] sm:ml-[30px] sm:mt-[20px]
      hover:scale-105 hover:shadow-[0_4px_30px_3px_rgba(44,245,229,0.16)]
      hover:border-[#78f8d9]
      hover:cursor-pointer
      focus:outline-none focus:ring-4 focus:ring-[#2f97f1]/40
      active:scale-95
      disabled:opacity-60
"
            >
              {loading ? <Loading /> : "PLACE ORDER"}
            </button>
          </div>
        </form>
      </div>
      <div className="lg:w-[50%] w-[100%] min-h-[100%] flex items-center justify-center gap-[30px] ">
        <div className="lg:w-[70%] w-[90%] lg:h-[70%] h-[100%]  flex items-center justify-center gap-1 sm:gap-[10px] flex-col">
          <CartTotal />
          <div className="py-1 sm:py-[10px]">
            <Title text1={"PAYMENT"} text2={"METHOD"} />
          </div>
          <div className="w-[100%] h-[30vh] lg:h-[100px] flex items-start sm:mt-[15px] lg:mt-0 justify-center  gap-[41px] sm:gap-[50px]">
            <button
              onClick={() => setMethod("razorpay")}
              className={`w-[150px] hover:cursor-pointer h-[50px] rounded-sm  ${
                method === "razorpay"
                  ? "   border-[5px] border-blue-900 rounded-sm "
                  : "shadow-[0_0_30px_3px_rgba(61,171,235,0.20)]  rounded-sm hover:border-blue-400 active:scale-105 hover:shadow-lg"
              }`}
            >
              {" "}
              <img
                src={razorpay}
                className="w-[100%] h-[100%] object-fill rounded-sm "
                alt=""
              />
            </button>
            <button
              onClick={() => setMethod("cod")}
              className={`w-[200px] hover:cursor-pointer h-[50px] bg-gradient-to-t from-[#95b3f8] to-[white] text-[14px] px-[20px] rounded-sm text-[#332f6f] font-bold ${
                method === "cod"
                  ? "border-[5px] border-blue-900 rounded-sm"
                  : "shadow-[0_0_30px_3px_rgba(61,171,235,0.20)]  rounded-sm hover:border-blue-400 active:scale-105 hover:shadow-lg"
              }`}
            >
              CASH ON DELIVERY{" "}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaceOrder;

//   py-[10px] px-[50px] rounded-2xl text-white  absolute lg:right-[20%] bottom-[10%] right-[35%] border-[1px] border-[#80808049] ml-[30px] mt-[20px]

import React, { useContext, useState } from "react";
import Nav from "../component/Nav";
import Sidebar from "../component/Sidebar";
import upload from "../assets/upload image.jpg";
import { authDataContext } from "../context/AuthContext";
import axios from "../context/axiosInstance.js";
import { toast } from "react-toastify";
import Loading from "../component/Loading.jsx";
import Ai from "../component/Ai.jsx";

function Add() {
  let [image1, setImage1] = useState(false);
  let [image2, setImage2] = useState(false);
  let [image3, setImage3] = useState(false);
  let [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Men");
  const [price, setPrice] = useState("");
  const [subCategory, setSubCategory] = useState("TopWear");
  const [bestseller, setBestSeller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  let { serverUrl } = useContext(authDataContext);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("date", Date.now());
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("image1", image1);
      formData.append("image2", image2);
      formData.append("image3", image3);
      formData.append("image4", image4);

      let response = await axios.post(
        `${serverUrl}/api/product/addproduct`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (response?.data?.token) {
        localStorage.setItem("authToken", response.data.token);
      }
      toast.success("Product added Successfully");

      // console.log(response.data.product);

      if (response.data) {
        setName("");
        setDescription("");
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrice("");
        setBestSeller(false);
        setCategory("Men");
        setSubCategory("TopWear");
        setSizes([]);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Try again later";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] text-white overflow-hidden flex flex-col">
      <Nav />
      <Ai />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main
          style={{
            overflowY: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          className="grow mt-[70px] py-2 md:py-6 px-19  md:px-10 lg:px-53 overflow-y-auto "
        >
          <form
            onSubmit={handleAddProduct}
            className="max-w-4xl mx-auto flex flex-col gap-6 md:gap-12"
          >
            <h1 className="text-2xl md:text-4xl font-semibold text-yellow-400 select-none">
              Add Product Page
            </h1>

            {/* Upload Images */}
            <section>
              <h2 className="text-lg md:text-2xl font-semibold mb-4 select-none">
                Upload Images
              </h2>
              <div className="flex flex-wrap gap-6">
                {[image1, image2, image3, image4].map((img, idx) => (
                  <label
                    key={idx}
                    htmlFor={`image${idx + 1}`}
                    className="w-[50px] h-[50px] md:w-[100px] md:h-[100px] cursor-pointer border-2 border-transparent rounded-lg shadow-lg hover:border-yellow-400 transition"
                  >
                    <img
                      src={!img ? upload : URL.createObjectURL(img)}
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-full rounded-lg object-cover"
                    />
                    <input
                      type="file"
                      id={`image${idx + 1}`}
                      hidden
                      required
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          switch (idx) {
                            case 0:
                              setImage1(file);
                              break;
                            case 1:
                              setImage2(file);
                              break;
                            case 2:
                              setImage3(file);
                              break;
                            case 3:
                              setImage4(file);
                              break;
                            default:
                              break;
                          }
                        }
                      }}
                    />
                  </label>
                ))}
              </div>
            </section>

            {/* Product Details */}
            <section className="flex flex-col gap-8">
              <div className="flex flex-col gap-2 w-full max-w-3xl">
                <label
                  htmlFor="productName"
                  className=" text-lg md:text-xl font-semibold select-none"
                >
                  Product Name
                </label>
                <input
                  id="productName"
                  type="text"
                  placeholder="Type here"
                  className="w-full h-12 rounded-lg bg-[#1a2733] border-2 border-transparent focus:border-yellow-400 text-white px-5  transition"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  required
                />
              </div>

              <div className="flex flex-col gap-2 w-full max-w-3xl">
                <label
                  htmlFor="productDescription"
                  className="text-lg md:text-xl  font-semibold select-none"
                >
                  Product Description
                </label>
                <textarea
                  id="productDescription"
                  placeholder="Type here"
                  className="w-full h-24 rounded-lg bg-[#1a2733] border-2 border-transparent focus:border-yellow-400 text-white px-5 py-3  resize-none transition"
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                  required
                />
              </div>

              <div className="flex flex-wrap gap-8 max-w-3xl">
                <div className="flex flex-col gap-2 w-full sm:w-1/3">
                  <label className="text-lg md:text-xl  font-semibold select-none">
                    Product Category
                  </label>
                  <select
                    className="w-full h-12 rounded-lg bg-[#1a2733] border-2 border-transparent focus:border-yellow-400 text-white px-4 cursor-pointer transition"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option>Men</option>
                    <option>Women</option>
                    <option>Kids</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-1/3">
                  <label className="text-lg md:text-xl  font-semibold select-none">
                    Sub-Category
                  </label>
                  <select
                    className="w-full h-12 rounded-lg bg-[#1a2733] border-2 border-transparent focus:border-yellow-400 text-white px-4 cursor-pointer transition"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                  >
                    <option>TopWear</option>
                    <option>BottomWear</option>
                    <option>WinterWear</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-3xl">
                <label
                  htmlFor="productPrice"
                  className="text-lg md:text-xl  font-semibold select-none"
                >
                  Product Price
                </label>
                <input
                  id="productPrice"
                  type="number"
                  placeholder="₹ 2000"
                  className="w-full h-12 rounded-lg bg-[#1a2733] border-2 border-transparent focus:border-yellow-400 text-white px-5  transition"
                  onChange={(e) => setPrice(e.target.value)}
                  value={price}
                  required
                />
              </div>

              <div className="max-w-3xl">
                <p className="text-lg md:text-xl  font-semibold mb-3 select-none">
                  Product Size
                </p>
                <div className="flex flex-wrap gap-4">
                  {["S", "M", "L", "XL", "XXL"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`px-4 py-2 rounded-lg cursor-pointer bg-[#1a2733] border-2 transition-colors duration-300 select-none ${
                        sizes.includes(size)
                          ? "bg-yellow-400 border-yellow-400 text-black"
                          : "border-transparent text-white hover:border-yellow-400"
                      }`}
                      onClick={() =>
                        setSizes((prev) =>
                          prev.includes(size)
                            ? prev.filter((s) => s !== size)
                            : [...prev, size]
                        )
                      }
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 max-w-3xl">
                <input
                  type="checkbox"
                  id="bestseller"
                  className="w-6 h-6 cursor-pointer rounded border-2 border-yellow-400 text-yellow-400"
                  checked={bestseller}
                  onChange={() => setBestSeller((prev) => !prev)}
                />
                <label
                  htmlFor="bestseller"
                  className="text-lg md:text-xl  font-semibold select-none"
                >
                  Add to BestSeller
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-30 md:w-40  py-3 rounded-xl bg-yellow-400 text-black font-semibold hover:bg-yellow-500 active:bg-yellow-600 transition duration-200 select-none ${
                  loading && "opacity-70 cursor-not-allowed"
                }`}
              >
                {loading ? <Loading /> : "Add Product"}
              </button>
            </section>
          </form>
        </main>
      </div>
    </div>
  );
}

export default Add;

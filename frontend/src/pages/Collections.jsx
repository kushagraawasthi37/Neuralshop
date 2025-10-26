import React, { useContext, useEffect, useState } from "react";
import { FaChevronRight, FaChevronDown } from "react-icons/fa";
import Title from "../components/Title";
import { shopDataContext } from "../context/ShopContext";
import Card from "../components/Card";

function Collections() {
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const { products, search, showSearch } = useContext(shopDataContext);
  const [filterProduct, setFilterProduct] = useState([]);
  const [category, setCaterory] = useState([]);
  const [subCategory, setSubCaterory] = useState([]);
  const [sortType, SetSortType] = useState("relavent");

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCaterory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCaterory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCaterory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCaterory((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilter = () => {
    let productCopy = products.slice();
    if (showSearch && search) {
      productCopy = productCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category.length > 0) {
      productCopy = productCopy.filter((item) =>
        category.includes(item.category)
      );
    }
    if (subCategory.length > 0) {
      productCopy = productCopy.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }
    setFilterProduct(productCopy);
  };

  const sortProducts = () => {
    let fbCopy = filterProduct.slice();
    switch (sortType) {
      case "low-high":
        setFilterProduct(fbCopy.sort((a, b) => a.price - b.price));
        break;
      case "high-low":
        setFilterProduct(fbCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => sortProducts(), [sortType]);
  useEffect(() => setFilterProduct(products), [products]);
  useEffect(() => applyFilter(), [category, subCategory, search, showSearch]);

  return (
    <div className="relative w-[99vw] min-h-[100vh] overflow-x-hidden bg-gradient-to-br from-[#10121a] via-[#1a1f2e] to-[#252940] text-white flex flex-col md:flex-row justify-start pt-[45px] md:pt-[70px] pb-[120px] transition-all duration-700 ease-in-out animate-fadeIn">
      {/* Filter Section */}
      <div
        className={`md:w-[28vw] lg:w-[20vw] w-full md:min-h-[100vh] ${
          showFilter ? "h-auto" : "h-[6vh]"
        } p-3.5 md:p-5 border-r border-white/10 text-white/90 bg-white/5 backdrop-blur-lg shadow-[0_8px_25px_rgba(0,0,0,0.4)] rounded-lg transition-all duration-700 ease-in-out lg:fixed`}
      >
        <p
          className="text-md md:text-2xl font-semibold flex gap-2 items-center cursor-pointer hover:text-yellow-300 transition-all duration-200"
          onClick={() => setShowFilter((prev) => !prev)}
        >
          FILTERS
          {!showFilter && (
            <FaChevronRight className="text-md md:hidden transition-transform duration-500" />
          )}
          {showFilter && (
            <FaChevronDown className="text-[18px] md:hidden transition-transform duration-500 rotate-180" />
          )}
        </p>

        {/* Categories */}
        <div
          className={`border border-white/10 pl-5 py-4 mt-6 rounded-xl bg-white/5 backdrop-blur-md transition-all duration-700 ease-in-out ${
            showFilter
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-5 md:opacity-100 md:translate-y-0"
          }`}
        >
          <p className="text-[18px] font-medium text-yellow-300 mb-3 tracking-wide">
            CATEGORIES
          </p>
          <div className="flex flex-col gap-3">
            {["Men", "Women", "Kids"].map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-3 cursor-pointer group transition-all"
              >
                <input
                  type="checkbox"
                  value={cat}
                  className="accent-yellow-400 group-hover:scale-110 transition-transform"
                  onChange={toggleCategory}
                />
                <span className="group-hover:text-yellow-300 transition-all duration-300">
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Sub-Categories */}
        <div
          className={`border border-white/10 pl-5 py-4 mt-6 rounded-xl bg-white/5 backdrop-blur-md transition-all duration-700 ease-in-out ${
            showFilter
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-5 md:opacity-100 md:translate-y-0"
          }`}
        >
          <p className="text-[18px] font-medium text-yellow-300 mb-3 tracking-wide">
            SUB-CATEGORIES
          </p>
          <div className="flex flex-col gap-3">
            {["TopWear", "BottomWear", "WinterWear"].map((sub) => (
              <label
                key={sub}
                className="flex items-center gap-3 cursor-pointer group transition-all"
              >
                <input
                  type="checkbox"
                  value={sub}
                  className="accent-yellow-400 group-hover:scale-110 transition-transform"
                  onChange={toggleSubCategory}
                />
                <span className="group-hover:text-yellow-300 transition-all duration-300">
                  {sub}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Collection Section */}
      <div className="lg:pl-[22%] w-full px-4 md:px-10 transition-all duration-700 ease-in-out">
        {/* Title & Sort */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />

          {/* Sort By Section (Expands like filter) */}
          <div className="w-full md:w-auto mt-2 md:mt-0 p-2 md:p-3 border border-white/20 rounded-xl backdrop-blur-md bg-white/10 transition-all duration-500 ease-in-out hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <button
              onClick={() => setShowSort((prev) => !prev)}
              className="w-full flex justify-between items-center px-4 md:py-2 bg-transparent text-white rounded-xl hover:text-yellow-300 transition-all duration-300"
            >
              {sortType === "relavent"
                ? "Sort By: Relevant"
                : sortType === "low-high"
                ? "Sort By: Low to High"
                : "Sort By: High to Low"}
              <FaChevronDown
                className={`ml-2 transition-transform duration-300 ${
                  showSort ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {/* Dropdown options in flow */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                showSort ? "max-h-60 mt-2" : "max-h-0"
              }`}
            >
              {["relavent", "low-high", "high-low"].map((type) => (
                <div
                  key={type}
                  onClick={() => {
                    SetSortType(type);
                    setShowSort(false);
                  }}
                  className="px-4 py-2 cursor-pointer text-white hover:bg-yellow-500/20 rounded transition-all duration-300"
                >
                  {type === "relavent"
                    ? "Sort By: Relevant"
                    : type === "low-high"
                    ? "Sort By: Low to High"
                    : "Sort By: High to Low"}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 transition-all duration-700 ease-in-out">
          {filterProduct.map((item, index) => (
            <div
              key={index}
              className="transform transition-transform duration-500 hover:scale-[1.04] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-2xl"
            >
              <Card
                id={item._id}
                name={item.name}
                price={item.price}
                image={item.image1}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Collections;

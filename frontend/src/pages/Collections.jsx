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
    <div className="relative w-full min-h-screen bg-gradient-to-br from-[#0d0f15] via-[#141823] to-[#1c2030] text-white flex md:flex-row flex-col pt-[65px] md:pt-[90px] pb-20 overflow-hidden transition-all duration-700">
      {/* FILTER PANEL */}
      <div
        className={`mt-16 md:w-[24vw] lg:w-[19vw] w-full md:min-h-screen ${
          showFilter ? "h-auto" : "h-[6vh] sm:h-[8vh]"
        } px-6 py-4 md:py-8 border-r border-white/10 bg-white/5 
        backdrop-blur-xl shadow-[0_8px_25px_rgba(0,0,0,0.45)] rounded-lg 
        transition-all duration-700 ease-in-out md:fixed`}
      >
        {/* FILTER HEADER */}
        <p
          className="text-md md:text-2xl font-semibold flex gap-2 items-center cursor-pointer hover:text-yellow-300 transition-all"
          onClick={() => setShowFilter((prev) => !prev)}
        >
          FILTERS
          {!showFilter && <FaChevronRight className="md:hidden" />}
          {showFilter && <FaChevronDown className="md:hidden rotate-180" />}
        </p>

        {/* CATEGORY BLOCK */}
        <div
          className={`border border-white/10 pl-5 py-4 mt-6 rounded-xl bg-white/5 backdrop-blur-md transition-all duration-700 ${
            showFilter ? "opacity-100" : "opacity-0 md:opacity-100"
          }`}
        >
          <p className="text-[18px] font-medium text-yellow-300 mb-3">
            CATEGORIES
          </p>

          <div className="flex flex-col gap-3">
            {["Men", "Women", "Kids"].map((cat) => (
              <label key={cat} className="flex gap-3 cursor-pointer group">
                <input
                  value={cat}
                  type="checkbox"
                  className="accent-yellow-400 group-hover:scale-110 transition-transform"
                  onChange={toggleCategory}
                />
                <span className="group-hover:text-yellow-300 transition-all">
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* SUB CATEGORY BLOCK */}
        <div
          className={`border border-white/10 pl-5 py-4 mt-6 rounded-xl bg-white/5 backdrop-blur-md transition-all duration-700 ${
            showFilter ? "opacity-100" : "opacity-0 md:opacity-100"
          }`}
        >
          <p className="text-[18px] font-medium text-yellow-300 mb-3">
            SUB-CATEGORIES
          </p>

          <div className="flex flex-col gap-3">
            {["TopWear", "BottomWear", "WinterWear"].map((sub) => (
              <label key={sub} className="flex gap-3 cursor-pointer group">
                <input
                  value={sub}
                  type="checkbox"
                  onChange={toggleSubCategory}
                  className="accent-yellow-400 group-hover:scale-110 transition-transform"
                />
                <span className="group-hover:text-yellow-300 transition-all">
                  {sub}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* COLLECTIONS SECTION */}
      <div className="md:ml-[25vw] lg:ml-[22vw] w-full px-6 md:px-12 transition-all duration-700">
        {/* TITLE + SORT */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />

          {/* SORT BLOCK */}
          <div className="w-full md:w-auto sm:p-3 border border-white/20 rounded-xl backdrop-blur-md bg-white/10 hover:bg-white/20 transition-all">
            <button
              onClick={() => setShowSort(!showSort)}
              className="w-full flex justify-between items-center px-4 py-2 text-white hover:text-yellow-300 transition-all"
            >
              {sortType === "relavent"
                ? "Sort By: Relevant"
                : sortType === "low-high"
                ? "Sort By: Low to High"
                : "Sort By: High to Low"}
              <FaChevronDown
                className={`ml-2 transition-transform ${
                  showSort ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* DROPDOWN OPTIONS */}
            <div
              className={`overflow-hidden transition-all duration-500 ${
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
                  className="px-4 py-2 cursor-pointer hover:bg-yellow-500/20 rounded transition-all"
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

        {/* PRODUCT GRID */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {filterProduct.map((item, index) => (
            <div
              key={index}
              className="transition-transform duration-500 hover:scale-[1.04] hover:shadow-[0_0_18px_rgba(255,255,255,0.12)] rounded-2xl"
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

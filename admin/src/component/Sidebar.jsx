import React from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaRegListAlt } from "react-icons/fa";
import { SiTicktick } from "react-icons/si";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  let navigate = useNavigate();
  return (
    <div className="w-[18%] min-h-screen bg-[#0e1a1f]   py-[60px] fixed left-0 top-0 ">
      <div className="flex flex-col gap-4 pt-10 pl-[20%] text-[15px]">
        <div
          className="flex items-center justify-center md:justify-start gap-3 border border-gray-200 border-r-0 px-3 py-2 cursor-pointer hover:bg-[#2c7b89]"
          onClick={() => navigate("/add")}
        >
          <IoIosAddCircleOutline className="w-5 h-5" />
          <p className="hidden md:block">Add Items</p>
        </div>
        <div
          className="flex items-center justify-center md:justify-start gap-3 border border-gray-200 border-r-0 px-3 py-2 cursor-pointer hover:bg-[#2c7b89]"
          onClick={() => navigate("/lists")}
        >
          <FaRegListAlt className="w-5 h-5" />
          <p className="hidden md:block">List Items</p>
        </div>
        <div
          className="flex items-center justify-center md:justify-start gap-3 border border-gray-200 border-r-0 px-3 py-2 cursor-pointer hover:bg-[#2c7b89]"
          onClick={() => navigate("/orders")}
        >
          <SiTicktick className="w-5 h-5" />
          <p className="hidden md:block">View Orders</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

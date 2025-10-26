import React from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaRegListAlt } from "react-icons/fa";
import { SiTicktick } from "react-icons/si";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  let navigate = useNavigate();
  return (
    <div className="fixed md:top-5 left-0 h-full w-14 lg:w-[18%] bg-gradient-to-b from-[#10121a] via-[#1a1f2e] to-[#252940] py-[60px] text-white transition-width duration-300 ease-in-out z-20">
      <div className="flex flex-col gap-4 pl-3 lg:pl-[20%]">
        <div
          className="flex items-center gap-3 px-3 py-2 rounded-l-full cursor-pointer transition-colors duration-300 hover:bg-teal-600"
          onClick={() => navigate("/add")}
          title="Add Items"
        >
          <IoIosAddCircleOutline className="w-6 h-6 md:w-5 md:h-5" />
          <p className="hidden lg:block font-medium text-sm select-none">
            Add Items
          </p>
        </div>

        <div
          className="flex items-center gap-3 px-3 py-2 rounded-l-full cursor-pointer transition-colors duration-300 hover:bg-teal-600"
          onClick={() => navigate("/lists")}
          title="List Items"
        >
          <FaRegListAlt className="w-6 h-6 md:w-5 md:h-5" />
          <p className="hidden lg:block font-medium text-sm select-none">
            List Items
          </p>
        </div>

        <div
          className="flex items-center gap-3 px-3 py-2 rounded-l-full cursor-pointer transition-colors duration-300 hover:bg-teal-600"
          onClick={() => navigate("/orders")}
          title="View Orders"
        >
          <SiTicktick className="w-6 h-6 md:w-5 md:h-5" />
          <p className="hidden lg:block font-medium text-sm select-none">
            View Orders
          </p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

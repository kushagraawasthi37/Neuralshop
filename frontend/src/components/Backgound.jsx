import React from "react";
import img1 from "../assets/asset/back3.jpg";
import img2 from "../assets/asset/back1.jpg";
import img3 from "../assets/asset/back2.jpg";
import img4 from "../assets/asset/back4.jpg";

function Backgound({ heroCount }) {
  if (heroCount === 0) {
    return (
      <img
        src={img1}
        alt=""
        className="w-full h-full  float-left overflow-auto  object-cover"
      />
    );
  } else if (heroCount === 1) {
    return (
      <img
        src={img2}
        alt=""
        className="w-full h-full float-left overflow-auto  object-cover"
      />
    );
  } else if (heroCount === 2) {
    return (
      <img
        src={img3}
        alt=""
        className="w-full  h-full float-left overflow-auto  object-cover"
      />
    );
  } else if (heroCount === 3) {
    return (
      <img
        src={img4}
        alt=""
        className="w-full h-full float-left overflow-auto  object-cover"
      />
    );
  }
}

export default Backgound;

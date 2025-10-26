import React, { useContext, useEffect, useState } from "react";
import Title from "./Title";
import { shopDataContext } from "../context/ShopContext";
import Card from "./Card";

function LatestCollection() {
  let { products } = useContext(shopDataContext);
  let [LatestProducts, setLatestProduct] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      setLatestProduct(products.slice(0, 8));
      console.log("Latest products:", products);
    }
  }, [products]);

  return (
    <div>
      <div className="h-[8%] w-full text-center md:mt-[50px]  ">
        <Title text1={"LATEST"} text2={"COLLECTIONS"} />
        <p className="w-full m-auto text-[13px] md:text-[20px] px-2.5 text-blue-100 ">
          Step Into Style - New Collection Dropping This Season!
        </p>
      </div>
      <div className="w-full h-[50%] mt-[30px] flex items-center justify-center flex-wrap gap-[50px]">
        {LatestProducts.map((item, index) => {
          return (
            <Card
              key={index}
              name={item.name}
              image={item.image1}
              id={item._id}
              price={item.price}
            />
          );
        })}
      </div>
    </div>
  );
}

export default LatestCollection;

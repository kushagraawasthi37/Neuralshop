import React, { useContext, useEffect, useState } from "react";
import { shopDataContext } from "../context/ShopContext";
import Title from "./Title";
import Card from "./Card";

function RelatedProduct({ category, subCategory, currentProductId }) {
  let { products } = useContext(shopDataContext);
  let [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      let filtered = products
        .filter((p) => p.category === category)
        .filter((p) => p.subCategory === subCategory)
        .filter((p) => p._id !== currentProductId);

      setRelated(filtered.slice(0, 4));
    }
  }, [products, category, subCategory, currentProductId]);

  return (
    <div className="my-16 md:my-20 px-6 md:px-16">
      <div className="text-left mb-6">
        <Title text1={"RELATED"} text2={"PRODUCTS"} />
      </div>

      <div
        className="
          w-full flex flex-wrap gap-10 justify-center md:justify-start
        "
      >
        {related.map((item, index) => (
          <Card
            key={index}
            id={item._id}
            name={item.name}
            price={item.price}
            image={item.image1}
          />
        ))}
      </div>
    </div>
  );
}

export default RelatedProduct;

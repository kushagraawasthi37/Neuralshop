import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="bg-white/5 p-4 rounded-xl cursor-pointer hover:scale-105 transition"
    >
      <img
        src={product.images?.[0]}
        className="h-40 w-full object-cover rounded"
      />
      <h2 className="text-white mt-2">{product.name}</h2>
      <p className="text-blue-400">₹{product.price}</p>
    </div>
  );
};

export default ProductCard;

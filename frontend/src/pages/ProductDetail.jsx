import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProductStore } from "../../stores/productStore.js";
import { useCartStore } from "../../stores/cartStore.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useUiStore } from "../../stores/uiStore.js";
import { ROUTES } from "../../constants/routes.js";
import { MESSAGES } from "../../constants/messages.js";
import Button from "../../components/ui/atoms/Button.jsx";
import Input from "../../components/ui/atoms/Input.jsx";
import Select from "../../components/ui/atoms/Select.jsx";
import Card from "../../components/ui/molecules/Card.jsx";
import Spinner from "../../components/ui/atoms/Spinner.jsx";
import { formatPrice } from "../../utils/formatters.js";

/**
 * ProductDetail page component - Displays detailed product information
 */
const ProductDetail = () => {
  const { productId } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useUiStore();
  const queryClient = useQueryClient();

  const { fetchProductById, fetchProductReviews } = useProductStore();
  const { addToCart } = useCartStore();

  // Local state
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // Fetch product data
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductById(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch product reviews
  const { data: reviews } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: () => fetchProductReviews(productId),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  useEffect(() => {
    if (error) {
      showError(MESSAGES.ERROR.FETCH_PRODUCT);
    }
  }, [error, showError]);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (cartData) => addToCart(cartData),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      showSuccess("Product added to cart successfully");
    },
    onError: () => {
      showError(MESSAGES.ERROR.ADD_TO_CART);
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      showError("Please sign in to add items to your cart");
      return;
    }

    if (product.sizes?.length > 0 && !selectedSize) {
      showError("Please select a size");
      return;
    }

    if (product.colors?.length > 0 && !selectedColor) {
      showError("Please select a color");
      return;
    }

    addToCartMutation.mutate({
      productId: product.id,
      quantity,
      size: selectedSize,
      color: selectedColor,
    });
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.stock) return;
    setQuantity(newQuantity);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <Button as={Link} to={ROUTES.PRODUCTS}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const images = product.images || ["/images/placeholder-product.jpg"];
  const isOutOfStock = product.stock === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-center object-cover"
              onError={(e) => {
                e.target.src = "/images/placeholder-product.jpg";
              }}
            />
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-w-1 aspect-h-1 bg-gray-200 rounded-md overflow-hidden border-2 ${
                    selectedImage === index
                      ? "border-primary-500"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-center object-cover"
                    onError={(e) => {
                      e.target.src = "/images/placeholder-product.jpg";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <div className="flex items-center space-x-4 mb-4">
              {product.rating && (
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating} ({product.reviewCount || 0} reviews)
                  </span>
                </div>
              )}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.inStock
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-primary-600">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {Math.round(
                  ((product.originalPrice - product.price) /
                    product.originalPrice) *
                    100,
                )}
                % OFF
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Variants */}
          <div className="space-y-4">
            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <Select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  placeholder="Select size"
                >
                  {product.sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex space-x-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color
                          ? "border-primary-500"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <Input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) =>
                    handleQuantityChange(parseInt(e.target.value) || 1)
                  }
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
                <span className="text-sm text-gray-600">
                  {product.stock} available
                </span>
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="space-y-3">
            <Button
              onClick={handleAddToCart}
              className="w-full"
              size="lg"
              disabled={isOutOfStock || addToCartMutation.isPending}
            >
              {addToCartMutation.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Adding to Cart...
                </>
              ) : isOutOfStock ? (
                "Out of Stock"
              ) : (
                "Add to Cart"
              )}
            </Button>

            <Button
              as={Link}
              to={ROUTES.CART}
              variant="outline"
              className="w-full"
            >
              View Cart
            </Button>
          </div>

          {/* Additional Info */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">SKU:</span>
                <span className="ml-2 text-gray-600">
                  {product.sku || "N/A"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Category:</span>
                <span className="ml-2 text-gray-600">
                  {product.category?.name || "N/A"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Brand:</span>
                <span className="ml-2 text-gray-600">
                  {product.brand || "N/A"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Vendor:</span>
                <span className="ml-2 text-gray-600">
                  {product.vendor?.name || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t border-gray-200 pt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Customer Reviews
        </h2>

        {reviews?.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {review.user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">
                        {review.user?.name || "Anonymous"}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

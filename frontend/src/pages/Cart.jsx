import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "../../stores/cartStore.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useUiStore } from "../../stores/uiStore.js";
import { ROUTES } from "../../constants/routes.js";
import { MESSAGES } from "../../constants/messages.js";
import Button from "../../components/ui/atoms/Button.jsx";
import Input from "../../components/ui/atoms/Input.jsx";
import Card from "../../components/ui/molecules/Card.jsx";
import Spinner from "../../components/ui/atoms/Spinner.jsx";
import { formatPrice } from "../../utils/formatters.js";

/**
 * Cart page component - Displays shopping cart with item management
 */
const Cart = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useUiStore();
  const queryClient = useQueryClient();

  const { fetchCart, updateCartItem, removeCartItem, clearCart } =
    useCartStore();

  // Fetch cart data
  const {
    data: cart,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: fetchCart,
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
  });

  useEffect(() => {
    if (error) {
      showError(MESSAGES.ERROR.FETCH_CART);
    }
  }, [error, showError]);

  // Update item quantity mutation
  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => updateCartItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      showSuccess("Cart updated successfully");
    },
    onError: () => {
      showError(MESSAGES.ERROR.UPDATE_CART);
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      showSuccess("Item removed from cart");
    },
    onError: () => {
      showError(MESSAGES.ERROR.REMOVE_ITEM);
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      showSuccess("Cart cleared successfully");
    },
    onError: () => {
      showError(MESSAGES.ERROR.CLEAR_CART);
    },
  });

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    updateItemMutation.mutate({
      itemId,
      quantity: newQuantity,
    });
  };

  const handleRemoveItem = (itemId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this item from your cart?",
      )
    ) {
      removeItemMutation.mutate(itemId);
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      clearCartMutation.mutate();
    }
  };

  const cartItems = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const tax = cart?.tax || 0;
  const shipping = cart?.shipping || 0;
  const total = cart?.total || 0;

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Shopping Cart
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to view your cart.
          </p>
          <Button as={Link} to={ROUTES.LOGIN}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">
          {cartItems.length > 0
            ? `${cartItems.length} item${cartItems.length > 1 ? "s" : ""} in your cart`
            : "Your cart is empty"}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Your cart is empty
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Start shopping to add items to your cart.
          </p>
          <div className="mt-6">
            <Button as={Link} to={ROUTES.PRODUCTS}>
              Continue Shopping
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-md overflow-hidden">
                      <img
                        src={
                          item.product?.images?.[0] ||
                          "/images/placeholder-product.jpg"
                        }
                        alt={item.product?.name}
                        className="w-full h-full object-center object-cover"
                        onError={(e) => {
                          e.target.src = "/images/placeholder-product.jpg";
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">
                        <Link
                          to={`${ROUTES.PRODUCTS}/${item.product?.id}`}
                          className="hover:text-primary-600"
                        >
                          {item.product?.name}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.size && `Size: ${item.size}`}
                        {item.color && ` • Color: ${item.color}`}
                      </p>
                      <p className="text-sm font-medium text-primary-600 mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Quantity and Actions */}
                    <div className="flex items-center space-x-4">
                      {/* Quantity */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          disabled={
                            item.quantity <= 1 || updateItemMutation.isPending
                          }
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          max={item.product?.stock || 99}
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-16 text-center"
                          disabled={updateItemMutation.isPending}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          disabled={
                            item.quantity >= (item.product?.stock || 99) ||
                            updateItemMutation.isPending
                          }
                        >
                          +
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removeItemMutation.isPending}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Item Total:</span>
                      <span className="font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Clear Cart Button */}
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={handleClearCart}
                disabled={clearCartMutation.isPending}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900">{formatPrice(tax)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-gray-900">{formatPrice(shipping)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-primary-600">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  as={Link}
                  to={ROUTES.CHECKOUT}
                  className="w-full"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>

                <Button
                  as={Link}
                  to={ROUTES.PRODUCTS}
                  variant="outline"
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>

              {/* Promo Code Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter promo code"
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm">
                    Apply
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useOrderStore } from "../../stores/orderStore.js";
import { useUiStore } from "../../stores/uiStore.js";
import { ROUTES } from "../../constants/routes.js";
import { MESSAGES } from "../../constants/messages.js";
import Button from "../../components/ui/atoms/Button.jsx";
import Card from "../../components/ui/molecules/Card.jsx";
import Spinner from "../../components/ui/atoms/Spinner.jsx";
import { formatPrice } from "../../utils/formatters.js";

/**
 * OrderConfirmation page component - Displays order confirmation details
 */
const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { fetchOrderById } = useOrderStore();
  const { showError } = useUiStore();

  // Fetch order data
  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderById(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (error) {
      showError(MESSAGES.ERROR.FETCH_ORDER);
    }
  }, [error, showError]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The order you're looking for doesn't exist.
          </p>
          <Button as={Link} to={ROUTES.HOME}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const orderItems = order.items || [];
  const shippingAddress = order.shippingAddress || {};
  const paymentMethod = order.paymentMethod || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-lg text-gray-600">
          Thank you for your order. We've sent you a confirmation email.
        </p>
      </div>

      {/* Order Details */}
      <Card className="p-6 mb-6">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Order #{order.id}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : order.status === "processing"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
          {orderItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
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
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900">
                  {item.product?.name}
                </h4>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity}
                  {item.size && ` • Size: ${item.size}`}
                  {item.color && ` • Color: ${item.color}`}
                </p>
                <p className="text-sm text-gray-600">
                  Vendor: {item.product?.vendor?.name || "N/A"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatPrice(item.price)} each
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="border-t border-gray-200 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">
                {formatPrice(order.subtotal || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-900">
                {formatPrice(order.shipping || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="text-gray-900">
                {formatPrice(order.tax || 0)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-medium border-t border-gray-200 pt-2">
              <span className="text-gray-900">Total:</span>
              <span className="text-primary-600">
                {formatPrice(order.total || 0)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Shipping & Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Shipping Address */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Shipping Address
          </h3>
          <div className="text-gray-600 space-y-1">
            <p className="font-medium text-gray-900">
              {shippingAddress.firstName} {shippingAddress.lastName}
            </p>
            <p>{shippingAddress.address}</p>
            <p>
              {shippingAddress.city}, {shippingAddress.state}{" "}
              {shippingAddress.zipCode}
            </p>
            <p>{shippingAddress.country}</p>
            <p>{shippingAddress.email}</p>
            <p>{shippingAddress.phone}</p>
          </div>
        </Card>

        {/* Payment Method */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Payment Method
          </h3>
          <div className="text-gray-600 space-y-1">
            <p className="font-medium text-gray-900">
              {paymentMethod.nameOnCard}
            </p>
            <p>**** **** **** {paymentMethod.cardNumber?.slice(-4)}</p>
            <p>Expires {paymentMethod.expiryDate}</p>
          </div>
        </Card>
      </div>

      {/* Order Tracking */}
      {order.trackingNumber && (
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Order Tracking
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tracking Number:</p>
              <p className="font-medium text-gray-900">
                {order.trackingNumber}
              </p>
            </div>
            <Button variant="outline" size="sm">
              Track Package
            </Button>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button as={Link} to={ROUTES.PRODUCTS}>
          Continue Shopping
        </Button>
        <Button as={Link} to={ROUTES.ORDERS} variant="outline">
          View All Orders
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            // TODO: Implement print invoice
            window.print();
          }}
        >
          Print Invoice
        </Button>
      </div>

      {/* Help Section */}
      <div className="mt-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help?</h3>
        <p className="text-gray-600 mb-4">
          If you have any questions about your order, please contact our
          customer support.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button as={Link} to={ROUTES.CONTACT} variant="outline">
            Contact Support
          </Button>
          <Button as={Link} to={ROUTES.HELP} variant="outline">
            Help Center
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

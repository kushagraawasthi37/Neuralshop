import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth.js";
import { useOrderStore } from "../../stores/orderStore.js";
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
 * Orders page component - Displays user's order history
 */
const Orders = () => {
  const { user } = useAuth();
  const { fetchUserOrders } = useOrderStore();
  const { showError } = useUiStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch user orders
  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-orders", user?.id, searchTerm, statusFilter, sortBy],
    queryFn: () =>
      fetchUserOrders({
        search: searchTerm,
        status: statusFilter,
        sort: sortBy,
      }),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  useEffect(() => {
    if (error) {
      showError(MESSAGES.ERROR.FETCH_ORDERS);
    }
  }, [error, showError]);

  const orders = ordersData?.orders || [];
  const totalCount = ordersData?.totalCount || 0;

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the query
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Orders</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to view your orders.
          </p>
          <Button as={Link} to={ROUTES.LOGIN}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">
          {totalCount > 0
            ? `You have ${totalCount} order${totalCount > 1 ? "s" : ""}`
            : "You haven't placed any orders yet"}
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <form onSubmit={handleSearch} className="md:col-span-2">
            <Input
              type="text"
              placeholder="Search orders by ID or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Select>

          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="total_high">Highest Total</option>
            <option value="total_low">Lowest Total</option>
          </Select>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Orders List */}
      {!isLoading && orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.id}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      {order.status?.charAt(0).toUpperCase() +
                        order.status?.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
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
                  <p className="text-lg font-semibold text-primary-600">
                    {formatPrice(order.total || 0)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.items?.length || 0} item
                    {(order.items?.length || 0) > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="mb-4">
                <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                  {order.items?.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
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
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        +{order.items.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {order.trackingNumber && (
                    <span>Tracking: {order.trackingNumber}</span>
                  )}
                </div>
                <div className="flex space-x-3">
                  <Button
                    as={Link}
                    to={`${ROUTES.ORDER_CONFIRMATION}/${order.id}`}
                    variant="outline"
                    size="sm"
                  >
                    View Details
                  </Button>
                  {order.status === "delivered" && (
                    <Button variant="outline" size="sm">
                      Write Review
                    </Button>
                  )}
                  {["confirmed", "processing"].includes(order.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && orders.length === 0 && (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No orders found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter
              ? "Try adjusting your search or filter criteria."
              : "You haven't placed any orders yet. Start shopping to see your orders here."}
          </p>
          <div className="mt-6">
            <Button as={Link} to={ROUTES.PRODUCTS}>
              Start Shopping
            </Button>
          </div>
        </div>
      )}

      {/* Load More (if pagination is needed) */}
      {orders.length > 0 && orders.length < totalCount && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => {
              // TODO: Implement pagination
              console.log("Load more orders");
            }}
          >
            Load More Orders
          </Button>
        </div>
      )}
    </div>
  );
};

export default Orders;

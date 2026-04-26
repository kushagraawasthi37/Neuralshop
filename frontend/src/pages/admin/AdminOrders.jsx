import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth.js";
import { useAdminStore } from "../../stores/adminStore.js";
import { useUiStore } from "../../stores/uiStore.js";
import { ROUTES } from "../../constants/routes.js";
import { MESSAGES } from "../../constants/messages.js";
import Button from "../../components/ui/atoms/Button.jsx";
import Input from "../../components/ui/atoms/Input.jsx";
import Select from "../../components/ui/atoms/Select.jsx";
import Card from "../../components/ui/molecules/Card.jsx";
import Modal from "../../components/ui/molecules/Modal.jsx";
import Spinner from "../../components/ui/atoms/Spinner.jsx";
import { formatPrice } from "../../utils/formatters.js";

/**
 * AdminOrders page component - Order management for admins
 */
const AdminOrders = () => {
  const { user } = useAuth();
  const { fetchAdminOrders, updateOrderStatus } = useAdminStore();
  const { showSuccess, showError } = useUiStore();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["admin-orders", searchTerm, statusFilter, dateFilter],
    queryFn: () =>
      fetchAdminOrders({
        search: searchTerm,
        status: statusFilter,
        date: dateFilter,
      }),
    enabled: !!user?.isAdmin,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      showSuccess("Order status updated successfully");
      setIsModalOpen(false);
      setSelectedOrder(null);
    },
    onError: () => {
      showError(MESSAGES.ERROR.UPDATE_ORDER);
    },
  });

  useEffect(() => {
    if (!user?.isAdmin) {
      showError("Access denied. Admin privileges required.");
    }
  }, [user, showError]);

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

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = (newStatus) => {
    if (selectedOrder) {
      updateStatusMutation.mutate({
        orderId: selectedOrder.id,
        status: newStatus,
      });
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <Button as={Link} to={ROUTES.HOME}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">
            Manage customer orders ({totalCount} total)
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="text"
            placeholder="Search orders by ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

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

          <Select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setDateFilter("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items?.length || 0} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.user?.name || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user?.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(order.total || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {order.status?.charAt(0).toUpperCase() +
                          order.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOrderModal(order)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement print invoice
                            console.log("Print invoice for order", order.id);
                          }}
                        >
                          Print
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
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
              Orders will appear here once customers start placing them.
            </p>
          </div>
        )}
      </Card>

      {/* Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`Order #${selectedOrder?.id}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Order #{selectedOrder.id}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Placed on{" "}
                    {new Date(selectedOrder.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}
                  >
                    {selectedOrder.status?.charAt(0).toUpperCase() +
                      selectedOrder.status?.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Customer Information
              </h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="font-medium text-gray-900">
                  {selectedOrder.user?.name || "Unknown Customer"}
                </p>
                <p className="text-gray-600">
                  {selectedOrder.user?.email || "N/A"}
                </p>
                {selectedOrder.shippingAddress && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>
                      {selectedOrder.shippingAddress.city},{" "}
                      {selectedOrder.shippingAddress.state}{" "}
                      {selectedOrder.shippingAddress.zipCode}
                    </p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Order Items
              </h4>
              <div className="space-y-3">
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          item.product?.images?.[0] ||
                          "/images/placeholder-product.jpg"
                        }
                        alt={item.product?.name}
                        className="w-12 h-12 object-center object-cover rounded-md"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.product?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                          {item.size && ` • Size: ${item.size}`}
                          {item.color && ` • Color: ${item.color}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">
                    {formatPrice(selectedOrder.subtotal || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-gray-900">
                    {formatPrice(selectedOrder.shipping || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900">
                    {formatPrice(selectedOrder.tax || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-medium border-t border-gray-200 pt-2">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-primary-600">
                    {formatPrice(selectedOrder.total || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Update Order Status
              </h4>
              <div className="flex space-x-2">
                {["confirmed", "processing", "shipped", "delivered"].map(
                  (status) => (
                    <Button
                      key={status}
                      variant={
                        selectedOrder.status === status ? "primary" : "outline"
                      }
                      size="sm"
                      onClick={() => handleStatusUpdate(status)}
                      disabled={updateStatusMutation.isPending}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ),
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button
                onClick={() => {
                  // TODO: Implement print invoice
                  console.log("Print invoice for order", selectedOrder.id);
                }}
              >
                Print Invoice
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrders;

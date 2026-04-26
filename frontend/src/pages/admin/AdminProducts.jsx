import React, { useState, useEffect } from "react";
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
 * AdminProducts page component - Product management for admins
 */
const AdminProducts = () => {
  const { user } = useAuth();
  const { fetchAdminProducts, createProduct, updateProduct, deleteProduct } =
    useAdminStore();
  const { showSuccess, showError } = useUiStore();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    images: [],
    isActive: true,
  });

  // Fetch products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["admin-products", searchTerm, categoryFilter, statusFilter],
    queryFn: () =>
      fetchAdminProducts({
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
      }),
    enabled: !!user?.isAdmin,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchAdminProducts().then(() => []), // TODO: Implement fetchCategories
    enabled: !!user?.isAdmin,
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      showSuccess("Product created successfully");
      closeModal();
    },
    onError: () => {
      showError(MESSAGES.ERROR.CREATE_PRODUCT);
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      showSuccess("Product updated successfully");
      closeModal();
    },
    onError: () => {
      showError(MESSAGES.ERROR.UPDATE_PRODUCT);
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      showSuccess("Product deleted successfully");
    },
    onError: () => {
      showError(MESSAGES.ERROR.DELETE_PRODUCT);
    },
  });

  useEffect(() => {
    if (!user?.isAdmin) {
      showError("Access denied. Admin privileges required.");
    }
  }, [user, showError]);

  const products = productsData?.products || [];
  const totalCount = productsData?.totalCount || 0;

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock || "",
        categoryId: product.categoryId || "",
        images: product.images || [],
        isActive: product.isActive !== false,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        categoryId: "",
        images: [],
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      categoryId: "",
      images: [],
      isActive: true,
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const formData = {
      ...productForm,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock),
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createProductMutation.mutate(formData);
    }
  };

  const handleDeleteProduct = (productId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone.",
      )
    ) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleFormChange = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
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
          <h1 className="text-3xl font-bold text-gray-900">
            Product Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your store's products ({totalCount} total)
          </p>
        </div>
        <Button onClick={() => openModal()}>Add New Product</Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("");
              setStatusFilter("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-center object-cover"
                            src={
                              product.images?.[0] ||
                              "/images/placeholder-product.jpg"
                            }
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = "/images/placeholder-product.jpg";
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {product.sku || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.stock}
                      </div>
                      {product.stock <= 5 && (
                        <div className="text-xs text-red-600">Low stock</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.isActive
                            ? product.stock > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.isActive
                          ? product.stock > 0
                            ? "Active"
                            : "Out of Stock"
                          : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openModal(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={deleteProductMutation.isPending}
                        >
                          Delete
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-5v2m0 0v2m0-2h2m-2 0h-2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No products found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first product.
            </p>
            <div className="mt-6">
              <Button onClick={() => openModal()}>Add New Product</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? "Edit Product" : "Add New Product"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <Input
                type="text"
                value={productForm.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                rows={4}
                value={productForm.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={productForm.price}
                onChange={(e) => handleFormChange("price", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock *
              </label>
              <Input
                type="number"
                min="0"
                value={productForm.stock}
                onChange={(e) => handleFormChange("stock", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select
                value={productForm.categoryId}
                onChange={(e) => handleFormChange("categoryId", e.target.value)}
              >
                <option value="">Select Category</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={productForm.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  handleFormChange("isActive", e.target.value === "active")
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createProductMutation.isPending ||
                updateProductMutation.isPending
              }
            >
              {createProductMutation.isPending ||
              updateProductMutation.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {editingProduct ? "Updating..." : "Creating..."}
                </>
              ) : editingProduct ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProducts;

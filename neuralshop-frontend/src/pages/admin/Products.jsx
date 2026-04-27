import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import ProductForm from "../../components/features/admin/ProductForm";
import { productService } from "../../services/api/productService";

const AdminProducts = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);
  const [stockUpdates, setStockUpdates] = useState({});
  const queryClient = useQueryClient();

  // Fetch admin products
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-products"],
    queryFn: productService.getAdminProducts,
  });

  const products = data?.product || [];

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: (productId) => productService.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      toast.success("Product deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete product");
    },
  });

  // Update stock mutation
  const updateStockMutation = useMutation({
    mutationFn: ({ productId, size, stockChange }) =>
      productService.updateStock(productId, { size, stockChange }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      toast.success("Stock updated successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update stock");
    },
  });

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductCreated = () => {
    queryClient.invalidateQueries(["admin-products"]);
    setShowForm(false);
    setEditingProduct(null);
    toast.success("Product created successfully!");
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(productId);
    }
  };

  const handleUpdateStock = (product) => {
    setSelectedProductForStock(product);
    // Initialize stock updates with current values
    const initialUpdates = {};
    product.sizes?.forEach((size) => {
      initialUpdates[size.size] = size.stock || 0;
    });
    setStockUpdates(initialUpdates);
    setShowStockModal(true);
  };

  const handleStockChange = (size, value) => {
    setStockUpdates((prev) => ({
      ...prev,
      [size]: parseInt(value) || 0,
    }));
  };

  const handleSaveStock = () => {
    if (!selectedProductForStock) return;

    // Calculate stock changes
    const updates = [];
    selectedProductForStock.sizes?.forEach((size) => {
      const currentStock = size.stock || 0;
      const newStock = stockUpdates[size.size] || 0;
      const change = newStock - currentStock;
      if (change !== 0) {
        updates.push({
          productId: selectedProductForStock._id,
          size: size.size,
          stockChange: change,
        });
      }
    });

    // Update each size
    const promises = updates.map((update) =>
      updateStockMutation.mutateAsync(update),
    );

    Promise.all(promises)
      .then(() => {
        setShowStockModal(false);
        setSelectedProductForStock(null);
        setStockUpdates({});
        toast.success("Stock updated successfully!");
      })
      .catch((error) => {
        toast.error("Failed to update stock");
      });
  };

  const getCurrentStock = (productId, size) => {
    const product = products.find((p) => p._id === productId);
    const sizeData = product?.sizes?.find((s) => s.size === size);
    return sizeData?.stock || 0;
  };

  const getTotalStock = (product) => {
    return (
      product.sizes?.reduce((total, size) => total + (size.stock || 0), 0) || 0
    );
  };

  const categories = ["ELECTRONICS", "CLOTHING", "BOOKS", "HOME", "SPORTS"];

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-8 text-center">
            <p className="text-red-400">
              Failed to load products. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-slate-900/95 p-8 shadow-2xl ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">
              Admin dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-white">
              Product Management
            </h1>
            <p className="mt-2 max-w-2xl text-slate-400">
              Add products, upload assets, and keep your catalog up to date in
              one polished workflow.
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingProduct(null);
            }}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            {showForm ? "Hide Form" : "Add New Product"}
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="mb-8 rounded-3xl bg-slate-900/95 p-8 shadow-2xl ring-1 ring-white/10">
            <ProductForm
              onSuccess={handleProductCreated}
              editingProduct={editingProduct}
              onCancel={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
            />
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-slate-900/95 p-6 shadow-2xl ring-1 ring-white/10 sm:flex-row sm:items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="rounded-3xl bg-slate-900/95 shadow-2xl ring-1 ring-white/10 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-semibold text-white">
              Products ({filteredProducts.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <p className="mt-4 text-slate-400">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              {searchTerm || selectedCategory
                ? "No products match your filters."
                : "No products found. Create your first product!"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.images?.[0]}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-semibold text-white">
                              {product.name}
                            </p>
                            <p className="text-sm text-slate-400 line-clamp-1">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        ${product.price}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-300">
                            Total: {getTotalStock(product)}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {product.sizes?.map((size) => (
                              <span
                                key={size.size}
                                className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400"
                              >
                                {size.size}: {size.stock || 0}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            product.bestseller
                              ? "bg-green-500/15 text-green-400"
                              : "bg-slate-500/15 text-slate-400"
                          }`}
                        >
                          {product.bestseller ? "Bestseller" : "Regular"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleUpdateStock(product)}
                            className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-500 transition"
                          >
                            Stock
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            disabled={deleteMutation.isPending}
                            className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500 transition disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stock Update Modal */}
        {showStockModal && selectedProductForStock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="mx-4 w-full max-w-md rounded-3xl bg-slate-900/95 p-6 shadow-2xl ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">
                Update Stock - {selectedProductForStock.name}
              </h3>

              <div className="space-y-4">
                {selectedProductForStock.sizes?.map((size) => (
                  <div key={size.size} className="flex items-center gap-4">
                    <label className="w-16 text-sm text-slate-300">
                      Size {size.size}:
                    </label>
                    <input
                      type="number"
                      value={stockUpdates[size.size] || 0}
                      onChange={(e) =>
                        handleStockChange(size.size, e.target.value)
                      }
                      className="flex-1 rounded-2xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      min="0"
                    />
                    <span className="text-xs text-slate-400">
                      Current: {size.stock || 0}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSaveStock}
                  disabled={updateStockMutation.isPending}
                  className="flex-1 rounded-2xl bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {updateStockMutation.isPending
                    ? "Updating..."
                    : "Update Stock"}
                </button>
                <button
                  onClick={() => {
                    setShowStockModal(false);
                    setSelectedProductForStock(null);
                    setStockUpdates({});
                  }}
                  className="flex-1 rounded-2xl bg-slate-700 px-4 py-2 text-white transition hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;

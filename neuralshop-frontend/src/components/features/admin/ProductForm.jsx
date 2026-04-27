import { useState } from "react";
import { productService } from "../../../services/api/productService";
import { useAuthStore } from "../../../stores/authStore";

const ProductForm = ({ onSuccess, editingProduct, onCancel }) => {
  const { token } = useAuthStore();
  const [formData, setFormData] = useState({
    name: editingProduct?.name || "",
    description: editingProduct?.description || "",
    price: editingProduct?.price || "",
    category: editingProduct?.category || "",
    subCategory: editingProduct?.subCategory || "",
    sizes: editingProduct?.sizes || [],
    bestseller: editingProduct?.bestseller || false,
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = ["ELECTRONICS", "CLOTHING", "BOOKS", "HOME", "SPORTS"];
  const subCategories = {
    ELECTRONICS: ["MOBILE", "LAPTOP", "HEADPHONES"],
    CLOTHING: ["SHIRTS", "PANTS", "SHOES"],
    BOOKS: ["FICTION", "NON_FICTION", "EDUCATIONAL"],
    HOME: ["FURNITURE", "DECOR", "KITCHEN"],
    SPORTS: ["FITNESS", "OUTDOOR", "TEAM_SPORTS"],
  };
  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSizeChange = (size) => {
    setFormData((prev) => {
      const sizeExists = prev.sizes.some((s) => s.size === size);
      return {
        ...prev,
        sizes: sizeExists
          ? prev.sizes.filter((s) => s.size !== size)
          : [...prev.sizes, { size, stock: 0 }],
      };
    });
  };

  const handleStockChange = (size, stock) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) =>
        s.size === size ? { ...s, stock: parseInt(stock) || 0 } : s,
      ),
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 4) {
      setError("Maximum 4 images allowed");
      return;
    }
    setImages(files);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Admin authentication required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "sizes") {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Only add images if new ones are selected (for updates)
      if (images.length > 0) {
        images.forEach((image, index) => {
          submitData.append(`image${index + 1}`, image);
        });
      }

      let response;
      if (editingProduct) {
        response = await productService.updateProduct(
          editingProduct._id,
          submitData,
        );
      } else {
        response = await productService.addProduct(submitData);
      }

      onSuccess && onSuccess(response.data.product);
      // Reset form only for new products
      if (!editingProduct) {
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "",
          subCategory: "",
          sizes: [],
          bestseller: false,
        });
        setImages([]);
      }
    } catch (err) {
      console.error("Product operation error:", err);
      setError(
        err.response?.data?.message ||
          `Failed to ${editingProduct ? "update" : "create"} product`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-slate-950/95 p-8 shadow-2xl ring-1 ring-white/10">
      <div className="mb-8">
        <span className="inline-flex rounded-full bg-indigo-500/15 px-3 py-1 text-sm font-semibold uppercase tracking-[0.28em] text-indigo-300">
          {editingProduct ? "Edit product" : "New product"}
        </span>
        <h2 className="mt-4 text-3xl font-semibold text-white">
          {editingProduct ? "Edit Product" : "Add New Product"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {editingProduct
            ? "Update product details, images, and inventory information."
            : "Fill in the product details, choose the category, and upload up to 4 images to launch your product live."}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-300">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-300">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-300">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Describe the product benefits and features"
            required
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-300">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              required
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-300">
              Sub Category
            </label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              required
              disabled={!formData.category}
            >
              <option value="" disabled>
                Select Sub Category
              </option>
              {formData.category &&
                subCategories[formData.category]?.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-300">
            Sizes & Stock
          </label>
          <div className="flex flex-wrap gap-3">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeChange(size)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  formData.sizes.some((s) => s.size === size)
                    ? "border-indigo-500 bg-indigo-500/15 text-indigo-200"
                    : "border-slate-700 bg-slate-900/80 text-slate-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {formData.sizes.length > 0 && (
            <div className="mt-4 space-y-3 rounded-2xl bg-slate-900/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Stock per size
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {formData.sizes.map((sizeObj) => (
                  <div key={sizeObj.size} className="flex items-center gap-3">
                    <span className="min-w-fit rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-300">
                      {sizeObj.size}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={sizeObj.stock}
                      onChange={(e) =>
                        handleStockChange(sizeObj.size, e.target.value)
                      }
                      placeholder="Stock qty"
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-300">
            Product Images (Max 4)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            required={!editingProduct}
          />
          {images.length > 0 && (
            <div className="mt-2 text-sm text-slate-400">
              {images.length} image(s) selected
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:flex-row sm:items-center">
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-300">
            <input
              type="checkbox"
              name="bestseller"
              checked={formData.bestseller}
              onChange={handleInputChange}
              className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
            />
            Mark as Bestseller
          </label>
          <span className="text-sm text-slate-400">
            This highlights the product in featured sections.
          </span>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-2xl bg-indigo-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? editingProduct
                ? "Updating Product..."
                : "Creating Product..."
              : editingProduct
                ? "Update Product"
                : "Create Product"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-2xl border border-slate-700 bg-slate-800 px-6 py-3 text-base font-semibold text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

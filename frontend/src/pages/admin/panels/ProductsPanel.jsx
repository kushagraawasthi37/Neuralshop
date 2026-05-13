import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminProductsApi, adminInventoryApi } from "../../../api/admin";
import { fmt } from "../adminUtils";

const CATEGORIES = [
  "Watches",
  "Apparel",
  "Bags",
  "Footwear",
  "Accessories",
  "Jewellery",
  "Clothing",
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

const emptyProduct = () => ({
  name: "",
  category: "",
  subCategory: "",
  price: "",
  description: "",
  bestseller: false,
  sizes: SIZE_OPTIONS.map((s) => ({ size: s, stock: "" })),
  image1: null,
  image2: null,
  image3: null,
  image4: null,
});

export default function ProductsPanel({ showToast }) {
  const qc = useQueryClient();
  const [productModal, setProductModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [newProduct, setNewProduct] = useState(emptyProduct);

  // Fetch all products (backend ignores filter params — we filter client-side)
  const { data: allProducts = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () =>
      adminProductsApi.list({}).then((r) => {
        const d = r.data;
        if (Array.isArray(d?.product)) return d.product;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d?.data?.products)) return d.data.products;
        if (Array.isArray(d)) return d;
        return [];
      }),
  });

  // Fetch all inventory to populate stock column
  const { data: inventoryList = [] } = useQuery({
    queryKey: ["admin-inventory-all"],
    queryFn: () =>
      adminInventoryApi.getAll().then((r) => {
        const d = r.data.data;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.inventory)) return d.inventory;
        return [];
      }),
  });

  // Build productId → total available stock map
  const stockMap = useMemo(() => {
    const map = {};
    for (const inv of inventoryList) {
      const pid = inv.productId;
      if (!pid) continue;
      const avail = inv.availableStock ?? inv.totalStock ?? 0;
      map[pid] = (map[pid] || 0) + avail;
    }
    return map;
  }, [inventoryList]);

  // Unique categories from loaded products (to cover all backend categories)
  const allCategories = useMemo(() => {
    const fromProducts = [
      ...new Set(allProducts.map((p) => p.category).filter(Boolean)),
    ];
    const merged = [...new Set([...CATEGORIES, ...fromProducts])].sort();
    return merged;
  }, [allProducts]);

  // Client-side filtering
  const products = useMemo(() => {
    return allProducts.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        const name = (p.name || "").toLowerCase();
        const sku = (p.sku || "").toLowerCase();
        if (!name.includes(q) && !sku.includes(q)) return false;
      }
      if (
        filterCategory &&
        (p.category || "").toLowerCase() !== filterCategory.toLowerCase()
      )
        return false;
      if (filterStatus === "active" && p.isActive === false) return false;
      if (filterStatus === "inactive" && p.isActive !== false) return false;
      return true;
    });
  }, [allProducts, search, filterCategory, filterStatus]);

  const createProductMutation = useMutation({
    mutationFn: (formData) => adminProductsApi.create(formData),
    onSuccess: () => {
      qc.invalidateQueries(["admin-products"]);
      setProductModal(false);
      setNewProduct(emptyProduct());
      showToast("Product created successfully");
    },
    onError: (err) =>
      showToast(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.[0]?.msg ||
          "Failed to create product",
      ),
  });

  const set = (key, val) => setNewProduct((p) => ({ ...p, [key]: val }));

  const setSizeStock = (size, stock) =>
    setNewProduct((p) => ({
      ...p,
      sizes: p.sizes.map((s) => (s.size === size ? { ...s, stock } : s)),
    }));

  const handleSubmit = () => {
    const stockedSizes = newProduct.sizes
      .filter((s) => s.stock !== "" && Number(s.stock) > 0)
      .map((s) => ({ size: s.size, stock: Number(s.stock) }));

    if (!newProduct.name.trim() || newProduct.name.trim().length < 3) {
      showToast("Name must be at least 3 characters");
      return;
    }
    if (
      !newProduct.description.trim() ||
      newProduct.description.trim().length < 10
    ) {
      showToast("Description must be at least 10 characters");
      return;
    }
    if (!newProduct.price || Number(newProduct.price) < 0) {
      showToast("Valid price is required");
      return;
    }
    if (!newProduct.category.trim()) {
      showToast("Category is required");
      return;
    }
    if (!newProduct.subCategory.trim()) {
      showToast("Sub-category is required");
      return;
    }
    if (stockedSizes.length === 0) {
      showToast("Add stock to at least one size");
      return;
    }
    if (
      !newProduct.image1 ||
      !newProduct.image2 ||
      !newProduct.image3 ||
      !newProduct.image4
    ) {
      showToast("All 4 product images are required");
      return;
    }

    const fd = new FormData();
    fd.append("name", newProduct.name.trim());
    fd.append("description", newProduct.description.trim());
    fd.append("price", String(Number(newProduct.price)));
    fd.append("category", newProduct.category.trim());
    fd.append("subCategory", newProduct.subCategory.trim());
    fd.append("sizes", JSON.stringify(stockedSizes));
    fd.append("bestseller", newProduct.bestseller ? "true" : "false");
    fd.append("image1", newProduct.image1);
    fd.append("image2", newProduct.image2);
    fd.append("image3", newProduct.image3);
    fd.append("image4", newProduct.image4);

    createProductMutation.mutate(fd);
  };

  return (
    <div className="ns-content">
      {productModal && (
        <div className="modal-overlay" onClick={() => setProductModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add Product</div>
              <button
                className="modal-close"
                type="button"
                onClick={() => setProductModal(false)}
              >
                ×
              </button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <div className="form-label">Product Name</div>
                <input
                  className="ns-input"
                  placeholder="e.g. Phantom Chronograph"
                  value={newProduct.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div className="form-group">
                <div className="form-label">Category</div>
                <select
                  className="ns-select"
                  style={{ width: "100%" }}
                  value={newProduct.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  <option value="">Select category</option>
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row three">
              <div className="form-group">
                <div className="form-label">Sub-category</div>
                <input
                  className="ns-input"
                  placeholder="e.g. Topwear"
                  value={newProduct.subCategory}
                  onChange={(e) => set("subCategory", e.target.value)}
                />
              </div>
              <div className="form-group">
                <div className="form-label">Price (₹)</div>
                <input
                  className="ns-input"
                  type="number"
                  placeholder="0"
                  value={newProduct.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </div>
              <div className="form-group">
                <div className="form-label">Bestseller</div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    paddingTop: 10,
                  }}
                >
                  <label className="ns-toggle">
                    <input
                      type="checkbox"
                      checked={newProduct.bestseller}
                      onChange={(e) => set("bestseller", e.target.checked)}
                    />
                    <div className="ns-toggle-track" />
                    <div className="ns-toggle-thumb" />
                  </label>
                  <span style={{ fontSize: 12, color: "var(--text-mid)" }}>
                    Featured
                  </span>
                </div>
              </div>
            </div>
            <div
              className="form-row"
              style={{ gridTemplateColumns: "1fr", marginBottom: 16 }}
            >
              <div className="form-group">
                <div className="form-label">Description</div>
                <textarea
                  className="ns-input"
                  rows={3}
                  style={{ resize: "vertical" }}
                  placeholder="Product description (min 10 characters)…"
                  value={newProduct.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
            </div>
            <div
              className="form-row"
              style={{ gridTemplateColumns: "1fr", marginBottom: 16 }}
            >
              <div className="form-group">
                <div className="form-label">Sizes & Stock</div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gap: 8,
                  }}
                >
                  {newProduct.sizes.map((s) => (
                    <div key={s.size}>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          marginBottom: 4,
                          textAlign: "center",
                        }}
                      >
                        {s.size}
                      </div>
                      <input
                        className="ns-input"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={s.stock}
                        onChange={(e) => setSizeStock(s.size, e.target.value)}
                        style={{ textAlign: "center" }}
                      />
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginTop: 6,
                  }}
                >
                  Leave a size blank or 0 to skip it.
                </div>
              </div>
            </div>
            <div
              className="form-row"
              style={{ gridTemplateColumns: "1fr", marginBottom: 16 }}
            >
              <div className="form-group">
                <div className="form-label">Product Images (4 required)</div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 10,
                  }}
                >
                  {[1, 2, 3, 4].map((n) => {
                    const key = `image${n}`;
                    const file = newProduct[key];
                    return (
                      <label
                        key={key}
                        style={{
                          display: "block",
                          border: "1px dashed var(--border-gold)",
                          background: file
                            ? "transparent"
                            : "rgba(201,169,110,0.04)",
                          cursor: "pointer",
                          aspectRatio: "1 / 1",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            set(key, e.target.files?.[0] || null)
                          }
                        />
                        {file ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "column",
                              gap: 4,
                              color: "var(--text-muted)",
                              fontSize: 11,
                            }}
                          >
                            <span style={{ fontSize: 18, opacity: 0.5 }}>
                              +
                            </span>
                            Image {n}
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="ns-btn ns-btn-ghost"
                onClick={() => setProductModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ns-btn ns-btn-primary"
                disabled={createProductMutation.isPending}
                onClick={handleSubmit}
              >
                {createProductMutation.isPending ? "Creating…" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="page-eyebrow">02 — Commerce</div>
        <div className="page-title">
          Product <em>Management</em>
        </div>
        <div className="page-sub">
          {products.length} of {allProducts.length} products
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.4,
            }}
          >
            <circle cx="9" cy="9" r="6" />
            <path d="M16 16l-3-3" />
          </svg>
          <input
            className="ns-input"
            placeholder="Search products…"
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="ns-select"
          style={{ width: 160 }}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="ns-select"
          style={{ width: 140 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          className="ns-btn ns-btn-primary"
          onClick={() => setProductModal(true)}
        >
          + Add Product
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="ns-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "40px 16px",
                      color: "var(--text-muted)",
                    }}
                  >
                    {allProducts.length === 0
                      ? "No products found"
                      : "No products match filters"}
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const pid = p._id || p.id || "";
                  const stock = stockMap[String(pid)] ?? p.stock ?? null;
                  return (
                    <tr key={String(pid)}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              background: "rgba(201,169,110,0.06)",
                              border: "1px solid var(--border-gold)",
                              flexShrink: 0,
                              overflow: "hidden",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {p.image?.[0] || p.images?.[0] ? (
                              <img
                                src={p.image?.[0] || p.images?.[0]}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 20 20"
                                fill="none"
                                stroke="rgba(201,169,110,0.4)"
                                strokeWidth="1.2"
                              >
                                <rect x="3" y="3" width="14" height="14" />
                                <path d="M3 8h14M8 3v14" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: 13,
                                color: "var(--champagne)",
                              }}
                            >
                              {p.name}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--text-muted)",
                              }}
                            >
                              {p.sku || ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{p.category || "—"}</td>
                      <td className="primary">
                        {fmt(p.offerPrice || p.price)}
                      </td>
                      <td>
                        {stock !== null ? (
                          <div className="stock-level">
                            <div
                              style={{
                                fontSize: 12,
                                color:
                                  stock < 10
                                    ? "rgba(190,110,110,0.9)"
                                    : "var(--champagne)",
                                fontWeight: 500,
                              }}
                            >
                              {stock}
                            </div>
                            <div
                              className="progress-bar"
                              style={{ marginTop: 4 }}
                            >
                              <div
                                className={`progress-fill${stock < 10 ? " red" : ""}`}
                                style={{
                                  width: `${Math.min(100, Math.round((stock / 100) * 100))}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span
                            style={{ fontSize: 11, color: "var(--text-muted)" }}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={
                            p.isActive !== false
                              ? "badge badge-delivered"
                              : "badge badge-cancelled"
                          }
                        >
                          {p.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderTop: "1px solid rgba(201,169,110,0.06)",
          }}
        >
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Showing {products.length} of {allProducts.length} products
          </div>
        </div>
      </div>
    </div>
  );
}

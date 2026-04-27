import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useProductsList } from "../../hooks/useProducts";
import ProductCard from "../../components/ui/molecules/ProductCard";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    order: searchParams.get("order") || "desc",
    limit: 20,
    skip: 0,
  });

  const { data, isLoading, error } = useProductsList(filters);
  const products = data?.products || [];
  const total = data?.total || 0;

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      skip: 0, // Reset pagination
    }));
  };

  const handlePageChange = (newSkip) => {
    setFilters((prev) => ({
      ...prev,
      skip: newSkip,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "createdAt",
      order: "desc",
      limit: 20,
      skip: 0,
    });
  };

  const categories = ["ELECTRONICS", "CLOTHING", "BOOKS", "HOME", "SPORTS"];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="mt-2 text-slate-400">
            Discover our amazing collection of products
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-3xl bg-slate-900/95 p-6 shadow-2xl ring-1 ring-white/10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Min Price
              </label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                placeholder="0"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Max Price
              </label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                placeholder="10000"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Sort and Clear */}
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <select
                value={`${filters.sortBy}_${filters.order}`}
                onChange={(e) => {
                  const [sortBy, order] = e.target.value.split("_");
                  handleFilterChange("sortBy", sortBy);
                  handleFilterChange("order", order);
                }}
                className="rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-2 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="createdAt_desc">Newest First</option>
                <option value="createdAt_asc">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="rounded-2xl bg-slate-700 px-4 py-2 text-white transition hover:bg-slate-600"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-slate-400">
            {isLoading
              ? "Loading..."
              : `Showing ${products.length} of ${total} products`}
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-2xl bg-slate-800"></div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 rounded bg-slate-800"></div>
                  <div className="h-4 w-2/3 rounded bg-slate-800"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-8 text-center">
            <p className="text-red-400">
              Failed to load products. Please try again.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl bg-slate-900/95 p-8 text-center shadow-2xl ring-1 ring-white/10">
            <p className="text-slate-400">
              No products found matching your criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {total > filters.limit && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handlePageChange(
                        Math.max(0, filters.skip - filters.limit),
                      )
                    }
                    disabled={filters.skip === 0}
                    className="rounded-2xl bg-slate-800 px-4 py-2 text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="flex items-center px-4 py-2 text-slate-400">
                    Page {Math.floor(filters.skip / filters.limit) + 1} of{" "}
                    {Math.ceil(total / filters.limit)}
                  </span>

                  <button
                    onClick={() =>
                      handlePageChange(filters.skip + filters.limit)
                    }
                    disabled={filters.skip + filters.limit >= total}
                    className="rounded-2xl bg-slate-800 px-4 py-2 text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;

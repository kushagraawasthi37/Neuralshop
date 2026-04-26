import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useProductStore } from "../../stores/productStore.js";
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
 * Products page component - Displays product catalog with filtering and search
 */
const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchProducts, fetchCategories } = useProductStore();
  const { showError } = useUiStore();

  // Local state for filters
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "name");
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || "",
  });

  // Fetch products with filters
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products", searchQuery, selectedCategory, sortBy, priceRange],
    queryFn: () =>
      fetchProducts({
        search: searchQuery,
        category: selectedCategory,
        sort: sortBy,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    if (error) {
      showError(MESSAGES.ERROR.FETCH_PRODUCTS);
    }
  }, [error, showError]);

  // Update URL params when filters change
  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ search: searchQuery });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    updateFilters({ category: categoryId });
  };

  const handleSortChange = (sortValue) => {
    setSortBy(sortValue);
    updateFilters({ sort: sortValue });
  };

  const handlePriceRangeChange = (field, value) => {
    const newRange = { ...priceRange, [field]: value };
    setPriceRange(newRange);
    updateFilters({
      minPrice: newRange.min,
      maxPrice: newRange.max,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortBy("name");
    setPriceRange({ min: "", max: "" });
    setSearchParams({});
  };

  const products = productsData?.products || [];
  const totalCount = productsData?.totalCount || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
        <p className="text-gray-600">
          {totalCount > 0
            ? `Showing ${products.length} of ${totalCount} products`
            : "Browse our product catalog"}
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="lg:col-span-2">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="outline">
                Search
              </Button>
            </div>
          </form>

          {/* Category Filter */}
          <Select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            placeholder="All Categories"
          >
            <option value="">All Categories</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>

          {/* Sort */}
          <Select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="name">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="price">Price Low-High</option>
            <option value="price_desc">Price High-Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
          </Select>
        </div>

        {/* Price Range */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Price
            </label>
            <Input
              type="number"
              placeholder="0"
              value={priceRange.min}
              onChange={(e) => handlePriceRangeChange("min", e.target.value)}
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price
            </label>
            <Input
              type="number"
              placeholder="No limit"
              value={priceRange.max}
              onChange={(e) => handlePriceRangeChange("max", e.target.value)}
              min="0"
            />
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={clearFilters} className="w-full">
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group cursor-pointer hover:shadow-lg transition-shadow"
            >
              <Link to={`${ROUTES.PRODUCTS}/${product.id}`}>
                <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-t-lg overflow-hidden">
                  <img
                    src={
                      product.images?.[0] || "/images/placeholder-product.jpg"
                    }
                    alt={product.name}
                    className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.target.src = "/images/placeholder-product.jpg";
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-lg font-semibold text-primary-600 mb-1">
                    {formatPrice(product.price)}
                  </p>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <p className="text-sm text-gray-500 line-through mb-1">
                        {formatPrice(product.originalPrice)}
                      </p>
                    )}
                  {product.rating && (
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
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
                      </div>
                      <span className="ml-1 text-sm text-gray-500">
                        ({product.reviewCount || 0})
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                  {product.inStock === false && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                      Out of Stock
                    </span>
                  )}
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && products.length === 0 && (
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
            Try adjusting your search or filter criteria.
          </p>
          <div className="mt-6">
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* Load More (if pagination is needed) */}
      {products.length > 0 && products.length < totalCount && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => {
              // TODO: Implement pagination
              console.log("Load more products");
            }}
          >
            Load More Products
          </Button>
        </div>
      )}
    </div>
  );
};

export default Products;

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "../api/products";
import { wishlistApi } from "../api/user";
import { useCartStore } from "../store/cartStore";
import StarRating from "../components/ui/StarRating";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

function sortProducts(products, sortBy) {
  if (!sortBy) return products;
  const arr = [...products];
  if (sortBy === "price_asc") return arr.sort((a, b) => (a.offerPrice ?? a.price ?? 0) - (b.offerPrice ?? b.price ?? 0));
  if (sortBy === "price_desc") return arr.sort((a, b) => (b.offerPrice ?? b.price ?? 0) - (a.offerPrice ?? a.price ?? 0));
  if (sortBy === "newest") return arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  if (sortBy === "rating") return arr.sort((a, b) => (b.rating ?? b.avgRating ?? 0) - (a.rating ?? a.avgRating ?? 0));
  return arr;
}

const CATEGORIES = [
  "All",
  "Watches",
  "Apparel",
  "Bags",
  "Footwear",
  "Accessories",
  "Jewellery",
];
const SORT_OPTIONS = [
  { label: "Relevance", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
  { label: "Top Rated", value: "rating" },
];

function ProductCard({ product }) {
  const { addItem } = useCartStore();
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addItem(product.id || product._id, 1, {});
    } catch (_) {}
    setAdding(false);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    try {
      if (wishlisted) {
        await wishlistApi.remove(product.id || product._id);
      } else {
        await wishlistApi.add(product.id || product._id);
      }
      setWishlisted((w) => !w);
    } catch (_) {}
  };

  const price = product.offerPrice || product.price || 0;
  const original = product.originalPrice || product.comparePrice;
  const discount =
    original && original > price
      ? Math.round(((original - price) / original) * 100)
      : null;
  const img = product.image?.[0] || product.images?.[0];

  return (
    <Link
      to={`/product/${product.id || product._id}`}
      style={{ textDecoration: "none" }}
    >
      <div
        className="product-listing-card"
        style={{
          background: "#1a1916",
          border: "1px solid rgba(201,169,110,0.18)",
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(201,169,110,0.42)";
          e.currentTarget.style.transform = "translateY(-4px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(201,169,110,0.18)";
          e.currentTarget.style.transform = "none";
        }}
      >
        {/* Image */}
        <div
          style={{
            position: "relative",
            aspectRatio: "3/4",
            background: "#0d0c0b",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {img ? (
            <img
              src={img}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.6s ease",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "none")}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="48" height="48" viewBox="0 0 60 60" fill="none">
                <rect
                  x="10"
                  y="10"
                  width="40"
                  height="40"
                  stroke="rgba(201,169,110,0.3)"
                  strokeWidth="0.8"
                />
                <path
                  d="M20 30h20M30 20v20"
                  stroke="rgba(201,169,110,0.2)"
                  strokeWidth="0.8"
                />
              </svg>
            </div>
          )}
          {discount && (
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                background: "rgba(201,169,110,0.9)",
                color: "#0d0c0b",
                fontSize: 10,
                letterSpacing: "0.1em",
                padding: "3px 7px",
                fontWeight: 500,
              }}
            >
              -{discount}%
            </div>
          )}
          <button
            onClick={handleWishlist}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 34,
              height: 34,
              background: "rgba(13,12,11,0.7)",
              border: "1px solid rgba(201,169,110,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
          >
            <span
              style={{
                fontSize: 14,
                color: wishlisted ? "#c9a96e" : "rgba(201,169,110,0.4)",
                lineHeight: 1,
              }}
            >
              {wishlisted ? "♥" : "♡"}
            </span>
          </button>
        </div>

        {/* Info */}
        <div
          style={{
            padding: "clamp(12px,2vw,16px)",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(201,169,110,0.5)",
              marginBottom: 5,
            }}
          >
            {product.category || ""}
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(14px,2vw,16px)",
              fontWeight: 300,
              color: "#f0e6d0",
              marginBottom: 6,
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.name}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
            }}
          >
            <StarRating rating={product.rating || product.avgRating || 0} />
            {product.reviewCount > 0 && (
              <span style={{ fontSize: 11, color: "rgba(240,230,208,0.35)" }}>
                ({product.reviewCount})
              </span>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(17px,3vw,20px)",
                fontWeight: 300,
                color: "#c9a96e",
              }}
            >
              {fmt(price)}
            </span>
            {original && original > price && (
              <span
                style={{
                  fontSize: 12,
                  color: "rgba(240,230,208,0.35)",
                  textDecoration: "line-through",
                }}
              >
                {fmt(original)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            style={{
              width: "100%",
              padding: "10px",
              background: "rgba(201,169,110,0.08)",
              border: "1px solid rgba(201,169,110,0.25)",
              color: "#c9a96e",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "'DM Sans',sans-serif",
              minHeight: 40,
              marginTop: "auto",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#c9a96e";
              e.currentTarget.style.color = "#0d0c0b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(201,169,110,0.08)";
              e.currentTarget.style.color = "#c9a96e";
            }}
          >
            {adding ? "Adding…" : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}

function Skeleton() {
  return (
    <div
      style={{
        background: "#1a1916",
        border: "1px solid rgba(201,169,110,0.08)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          aspectRatio: "3/4",
          background: "rgba(201,169,110,0.04)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div style={{ padding: 16 }}>
        <div
          style={{
            height: 8,
            background: "rgba(201,169,110,0.06)",
            marginBottom: 10,
            width: "40%",
          }}
        />
        <div
          style={{
            height: 18,
            background: "rgba(201,169,110,0.06)",
            marginBottom: 8,
          }}
        />
        <div
          style={{
            height: 14,
            background: "rgba(201,169,110,0.06)",
            width: "60%",
          }}
        />
      </div>
    </div>
  );
}

function FilterSidebar({
  category,
  setCategory,
  priceMin,
  priceMax,
  setPriceMin,
  setPriceMax,
  sortBy,
  setSortBy,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Category */}
      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(201,169,110,0.5)",
            marginBottom: 14,
          }}
        >
          Category
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                background:
                  category === cat ? "rgba(201,169,110,0.08)" : "none",
                border:
                  category === cat
                    ? "1px solid rgba(201,169,110,0.25)"
                    : "1px solid transparent",
                color: category === cat ? "#c9a96e" : "rgba(240,230,208,0.45)",
                fontSize: 12,
                letterSpacing: "0.06em",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "'DM Sans',sans-serif",
                minHeight: 40,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(201,169,110,0.5)",
            marginBottom: 14,
          }}
        >
          Price Range
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "rgba(240,230,208,0.45)",
            marginBottom: 10,
          }}
        >
          <span>₹{priceMin.toLocaleString("en-IN")}</span>
          <span>₹{priceMax.toLocaleString("en-IN")}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <label
              style={{
                fontSize: 10,
                color: "rgba(240,230,208,0.35)",
                marginBottom: 4,
                display: "block",
              }}
            >
              Min Price
            </label>
            <input
              type="range"
              min={0}
              max={50000}
              step={500}
              value={priceMin}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPriceMin(val);
                if (val > priceMax) setPriceMax(val);
              }}
              style={{
                width: "100%",
                accentColor: "#c9a96e",
                background: "none",
                cursor: "pointer",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 10,
                color: "rgba(240,230,208,0.35)",
                marginBottom: 4,
                display: "block",
              }}
            >
              Max Price
            </label>
            <input
              type="range"
              min={0}
              max={50000}
              step={500}
              value={priceMax}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPriceMax(val);
                if (val < priceMin) setPriceMin(val);
              }}
              style={{
                width: "100%",
                accentColor: "#c9a96e",
                background: "none",
                cursor: "pointer",
              }}
            />
          </div>
        </div>
      </div>

      {/* Sort */}
      <div>
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(201,169,110,0.5)",
            marginBottom: 14,
          }}
        >
          Sort By
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                background:
                  sortBy === opt.value ? "rgba(201,169,110,0.08)" : "none",
                border:
                  sortBy === opt.value
                    ? "1px solid rgba(201,169,110,0.25)"
                    : "1px solid transparent",
                color:
                  sortBy === opt.value ? "#c9a96e" : "rgba(240,230,208,0.45)",
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "'DM Sans',sans-serif",
                minHeight: 40,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState(
    searchParams.get("category") || "All",
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");
  const [priceMin, setPriceMin] = useState(
    Number(searchParams.get("priceMin") || 0),
  );
  const [priceMax, setPriceMax] = useState(
    Number(searchParams.get("priceMax") || 50000),
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const limit = 12;

  const queryParams = {
    ...(category && category !== "All" ? { category } : {}),
    ...(priceMin > 0 ? { priceMin } : {}),
    ...(priceMax < 50000 ? { priceMax } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
    skip: (page - 1) * limit,
    limit,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () =>
      productApi.list(queryParams).then((r) => r.data.data || r.data),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const rawProducts = Array.isArray(data)
    ? data
    : data?.products || data?.items || [];
  const products = sortProducts(rawProducts, sortBy);
  const total = data?.total || data?.count || rawProducts.length;
  const totalPages = Math.ceil(total / limit);

  const activeFilters = [
    ...(category && category !== "All"
      ? [{ label: category, clear: () => setCategory("All") }]
      : []),
    ...(priceMin > 0 || priceMax < 50000
      ? [
          {
            label: `₹${priceMin.toLocaleString("en-IN")} – ₹${priceMax.toLocaleString("en-IN")}`,
            clear: () => {
              setPriceMin(0);
              setPriceMax(50000);
            },
          },
        ]
      : []),
  ];

  useEffect(() => {
    setPage(1);
  }, [category, sortBy, priceMin, priceMax]);

  const clearAllFilters = () => {
    setCategory("All");
    setPriceMin(0);
    setPriceMax(50000);
    setSortBy("");
  };

  return (
    <div style={{ minHeight: "100vh", paddingTop: "var(--nav-h, 80px)" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* Mobile filter overlay */
        .mobile-filter-overlay {
          display: none;
          position: fixed;
          top: var(--nav-h, 60px);
          bottom: 0; left: 0; right: 0;
          background: rgba(13,12,11,0.92);
          z-index: 500;
          align-items: flex-end;
          backdrop-filter: blur(10px);
        }
        .mobile-filter-overlay.open {
          display: flex;
        }
        .mobile-filter-panel {
          width: 100%;
          background: #1a1916;
          border-top: 1px solid rgba(201,169,110,0.18);
          padding: 24px 20px 40px;
          max-height: 88vh;
          overflow-y: auto;
        }
        .mobile-filter-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(201,169,110,0.12);
        }
      `}</style>

      {/* Mobile filter drawer */}
      <div
        className={`mobile-filter-overlay${mobileFiltersOpen ? " open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setMobileFiltersOpen(false);
        }}
      >
        <div className="mobile-filter-panel">
          <div className="mobile-filter-panel-header">
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 22,
                fontWeight: 300,
                color: "#f0e6d0",
              }}
            >
              Filters
            </div>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              style={{
                width: 36,
                height: 36,
                border: "1px solid rgba(201,169,110,0.18)",
                background: "none",
                color: "rgba(240,230,208,0.5)",
                cursor: "pointer",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
          <FilterSidebar
            category={category}
            setCategory={setCategory}
            priceMin={priceMin}
            priceMax={priceMax}
            setPriceMin={setPriceMin}
            setPriceMax={setPriceMax}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button
              onClick={() => {
                clearAllFilters();
                setMobileFiltersOpen(false);
              }}
              style={{
                flex: 1,
                padding: "12px",
                background: "none",
                border: "1px solid rgba(201,169,110,0.18)",
                color: "rgba(240,230,208,0.45)",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                minHeight: 44,
              }}
            >
              Clear All
            </button>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              style={{
                flex: 1,
                padding: "12px",
                background: "#c9a96e",
                border: "none",
                color: "#0d0c0b",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 500,
                minHeight: 44,
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "0 var(--page-px)",
        }}
      >
        {/* Page header */}
        <div className="page-header">
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#c9a96e",
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 1,
                  background: "#c9a96e",
                  display: "inline-block",
                }}
              />
              Collection
            </div>
            <h1 className="page-header__title">
              {category && category !== "All" ? (
                category
              ) : (
                <>
                  <em style={{ fontStyle: "italic", color: "#c9a96e" }}>All</em>{" "}
                  Products
                </>
              )}
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "rgba(240,230,208,0.38)",
                marginTop: 6,
              }}
            >
              {isLoading
                ? "Loading…"
                : `${total.toLocaleString("en-IN")} pieces in collection`}
            </p>
          </div>

          {/* Mobile filter btn */}
          <button
            className="mobile-filter-btn"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="14" y2="12" />
              <line x1="4" y1="18" x2="10" y2="18" />
            </svg>
            Filters
            {activeFilters.length > 0 && (
              <span
                style={{
                  background: "#c9a96e",
                  color: "#0d0c0b",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  fontSize: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                }}
              >
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>

        {/* Layout */}
        <div className="listing-layout">
          {/* Desktop sidebar */}
          <aside
            className="listing-sidebar"
            style={{
              background: "#1a1916",
              border: "1px solid rgba(201,169,110,0.12)",
              padding: "clamp(20px,3vw,28px)",
            }}
          >
            {/* Search in sidebar */}
            <div style={{ marginBottom: 32 }}>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(201,169,110,0.5)",
                  marginBottom: 12,
                }}
              >
                Search
              </div>
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "rgba(201,169,110,0.04)",
                  border: "1px solid rgba(201,169,110,0.2)",
                  color: "#f0e6d0",
                  fontSize: 12,
                  fontFamily: "'DM Sans',sans-serif",
                  outline: "none",
                  minHeight: 40,
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(201,169,110,0.5)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(201,169,110,0.2)")
                }
              />
            </div>
            <FilterSidebar
              category={category}
              setCategory={setCategory}
              priceMin={priceMin}
              priceMax={priceMax}
              setPriceMin={setPriceMin}
              setPriceMax={setPriceMax}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </aside>

          {/* Main content */}
          <div className="listing-content">
            {/* Active filters + count bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {activeFilters.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 12px",
                      border: "1px solid rgba(201,169,110,0.3)",
                      fontSize: 11,
                      color: "#c9a96e",
                    }}
                  >
                    {f.label}
                    <button
                      onClick={f.clear}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "rgba(201,169,110,0.5)",
                        fontSize: 14,
                        lineHeight: 1,
                        padding: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {activeFilters.length > 1 && (
                  <button
                    onClick={clearAllFilters}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: 11,
                      color: "rgba(240,230,208,0.35)",
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div style={{ fontSize: 11, color: "rgba(240,230,208,0.35)" }}>
                {isLoading ? "" : `${products.length} of ${total} shown`}
              </div>
            </div>

            {isLoading ? (
              <div className="listing-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: "clamp(32px,6vw,42px)",
                    fontWeight: 300,
                    color: "rgba(201,169,110,0.4)",
                    marginBottom: 16,
                  }}
                >
                  No results
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(240,230,208,0.35)",
                    marginBottom: 28,
                  }}
                >
                  No products match your current filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  style={{
                    padding: "12px 32px",
                    background: "#c9a96e",
                    color: "#0d0c0b",
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                    minHeight: 44,
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="listing-grid">
                  {products.map((p, i) => (
                    <ProductCard key={p.id || p._id || i} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 4,
                      marginBottom: 48,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      style={{
                        padding: "10px 16px",
                        background: "none",
                        border: "1px solid rgba(201,169,110,0.2)",
                        color: "rgba(240,230,208,0.45)",
                        cursor: page === 1 ? "default" : "pointer",
                        fontSize: 11,
                        letterSpacing: "0.1em",
                        opacity: page === 1 ? 0.4 : 1,
                        minHeight: 40,
                      }}
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pg =
                        Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                      return (
                        <button
                          key={pg}
                          onClick={() => setPage(pg)}
                          style={{
                            width: 40,
                            height: 40,
                            background:
                              page === pg ? "rgba(201,169,110,0.12)" : "none",
                            border:
                              page === pg
                                ? "1px solid rgba(201,169,110,0.4)"
                                : "1px solid rgba(201,169,110,0.12)",
                            color:
                              page === pg
                                ? "#c9a96e"
                                : "rgba(240,230,208,0.45)",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          {pg}
                        </button>
                      );
                    })}
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      style={{
                        padding: "10px 16px",
                        background: "none",
                        border: "1px solid rgba(201,169,110,0.2)",
                        color: "rgba(240,230,208,0.45)",
                        cursor: page === totalPages ? "default" : "pointer",
                        fontSize: 11,
                        letterSpacing: "0.1em",
                        opacity: page === totalPages ? 0.4 : 1,
                        minHeight: 40,
                      }}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

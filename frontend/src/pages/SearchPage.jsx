import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "../api/products";
import { cartApi } from "../api/cart";
import { useAuthStore } from "../store/authStore";
import { useGuestCartStore } from "../store/guestCartStore";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

// ── Client-side sort (matches CollectionPage exactly) ──────────────────────
function sortProducts(products, sortBy) {
  if (!sortBy) return products;
  const arr = [...products];
  if (sortBy === "price_asc")
    return arr.sort(
      (a, b) => (a.offerPrice ?? a.price ?? 0) - (b.offerPrice ?? b.price ?? 0),
    );
  if (sortBy === "price_desc")
    return arr.sort(
      (a, b) => (b.offerPrice ?? b.price ?? 0) - (a.offerPrice ?? a.price ?? 0),
    );
  if (sortBy === "newest")
    return arr.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );
  if (sortBy === "rating")
    return arr.sort(
      (a, b) => (b.rating ?? b.avgRating ?? 0) - (a.rating ?? a.avgRating ?? 0),
    );
  return arr;
}

const SORT_OPTIONS = [
  { label: "Relevance", value: "" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
  { label: "Newest", value: "newest" },
];

const CATEGORIES = [
  "All",
  "Watches",
  "Apparel",
  "Bags",
  "Footwear",
  "Accessories",
  "Jewellery",
];

function SizePicker({ sizes, onSelect, onClose }) {
  const available = (sizes || []).filter((s) => s.stock > 0);
  if (!available.length) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% + 6px)",
        left: 0,
        right: 0,
        background: "#1a1916",
        border: "1px solid rgba(201,169,110,0.35)",
        padding: "10px 12px",
        zIndex: 100,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(201,169,110,0.55)",
          marginBottom: 8,
        }}
      >
        Select Size
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {available.map((s) => (
          <button
            key={s.size}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(s.size);
            }}
            style={{
              padding: "6px 12px",
              border: "1px solid rgba(201,169,110,0.35)",
              background: "none",
              color: "#c9a96e",
              fontSize: 11,
              cursor: "pointer",
              letterSpacing: "0.08em",
              fontFamily: "'DM Sans',sans-serif",
              minHeight: 36,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#c9a96e";
              e.currentTarget.style.color = "#0d0c0b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "#c9a96e";
            }}
          >
            {s.size}
          </button>
        ))}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{
          marginTop: 8,
          background: "none",
          border: "none",
          fontSize: 10,
          color: "rgba(240,230,208,0.3)",
          cursor: "pointer",
          padding: 0,
        }}
      >
        Cancel
      </button>
    </div>
  );
}

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const guestAddItem = useGuestCartStore((s) => s.addItem);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);

  const availableSizes = (product.sizes || []).filter((s) => s.stock > 0);
  const price = product.offerPrice || product.price || 0;
  const img = product.images?.[0] || product.image?.[0];

  const doAddToCart = async (size) => {
    setAdding(true);
    setShowSizePicker(false);
    try {
      if (isLoggedIn) {
        await cartApi.addItem(
          product.id || product._id,
          1,
          size,
          price,
          product.name,
          img || "",
        );
      } else {
        guestAddItem({
          productId: product.id || product._id,
          quantity: 1,
          size,
          priceAtAdd: price,
          name: product.name,
          image: img || "",
        });
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (_) {}
    setAdding(false);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!availableSizes.length) {
      navigate(`/product/${product.id || product._id}`);
      return;
    }
    if (availableSizes.length === 1) {
      doAddToCart(availableSizes[0].size);
      return;
    }
    setShowSizePicker((v) => !v);
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id || product._id}`)}
      style={{
        background: "#1a1916",
        border: "1px solid rgba(201,169,110,0.18)",
        overflow: "visible",
        transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
        cursor: "pointer",
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(201,169,110,0.42)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(201,169,110,0.18)";
        e.currentTarget.style.transform = "none";
      }}
    >
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
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
            <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
              <rect
                x="10"
                y="10"
                width="40"
                height="40"
                stroke="rgba(201,169,110,0.25)"
                strokeWidth="0.8"
              />
              <path
                d="M20 30h20M30 20v20"
                stroke="rgba(201,169,110,0.15)"
                strokeWidth="0.8"
              />
            </svg>
          </div>
        )}
      </div>
      <div
        style={{
          padding: "clamp(10px,2vw,14px)",
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(201,169,110,0.45)",
            marginBottom: 4,
          }}
        >
          {product.category || ""}
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "clamp(13px,2vw,15px)",
            fontWeight: 300,
            color: "#f0e6d0",
            marginBottom: 5,
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
            gap: 4,
            marginBottom: 7,
          }}
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              style={{
                fontSize: 10,
                color:
                  s <= Math.round(product.rating || 0)
                    ? "#c9a96e"
                    : "rgba(201,169,110,0.2)",
              }}
            >
              ★
            </span>
          ))}
          {product.reviewCount > 0 && (
            <span style={{ fontSize: 10, color: "rgba(240,230,208,0.35)" }}>
              ({product.reviewCount})
            </span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(16px,3vw,18px)",
              fontWeight: 300,
              color: "#c9a96e",
            }}
          >
            {fmt(price)}
          </span>
        </div>
        <div style={{ position: "relative", marginTop: "auto" }}>
          {showSizePicker && (
            <SizePicker
              sizes={product.sizes}
              onSelect={doAddToCart}
              onClose={() => setShowSizePicker(false)}
            />
          )}
          <button
            onClick={handleAddToCart}
            disabled={adding}
            style={{
              width: "100%",
              padding: "9px",
              background: added ? "#c9a96e" : "rgba(201,169,110,0.07)",
              border: "1px solid rgba(201,169,110,0.2)",
              color: added ? "#0d0c0b" : "#c9a96e",
              fontSize: 9,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.25s ease",
              fontFamily: "'DM Sans',sans-serif",
              minHeight: 38,
            }}
            onMouseEnter={(e) => {
              if (!added) {
                e.currentTarget.style.background = "#c9a96e";
                e.currentTarget.style.color = "#0d0c0b";
              }
            }}
            onMouseLeave={(e) => {
              if (!added) {
                e.currentTarget.style.background = "rgba(201,169,110,0.07)";
                e.currentTarget.style.color = "#c9a96e";
              }
            }}
          >
            {adding ? "Adding…" : added ? "Added ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
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
          background: "rgba(201,169,110,0.03)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div style={{ padding: 14 }}>
        <div
          style={{
            height: 8,
            background: "rgba(201,169,110,0.05)",
            marginBottom: 8,
            width: "40%",
          }}
        />
        <div
          style={{
            height: 15,
            background: "rgba(201,169,110,0.05)",
            marginBottom: 6,
          }}
        />
        <div
          style={{
            height: 12,
            background: "rgba(201,169,110,0.05)",
            width: "50%",
          }}
        />
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [inputVal, setInputVal] = useState(searchParams.get("q") || "");

  // ── sortBy is local state only — NOT sent to the API ──────────────────────
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [priceMax, setPriceMax] = useState(
    Number(searchParams.get("priceMax") || 0),
  );
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));

  const q = searchParams.get("q") || "";
  const limit = 16;

  // ── sortBy intentionally excluded from queryParams (client-side only) ─────
  const queryParams = {
    search: q,
    ...(category ? { category } : {}),
    ...(priceMax > 0 ? { priceMax } : {}),
    skip: (page - 1) * limit,
    limit,
  };

  const { data, isLoading } = useQuery({
    // sortBy excluded from queryKey → changing sort never triggers a refetch
    queryKey: ["search", queryParams],
    queryFn: () =>
      productApi.list(queryParams).then((r) => r.data.data || r.data),
    enabled: q.length > 0,
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });

  const rawProducts = Array.isArray(data)
    ? data
    : data?.products || data?.items || [];

  const total = data?.total || data?.count || rawProducts.length;
  const totalPages = Math.ceil(total / limit);

  // ── Apply client-side sort (same logic as CollectionPage) ─────────────────
  const products = sortProducts(rawProducts, sortBy);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setPage(1);
    setSearchParams({
      q: inputVal.trim(),
      // sortBy intentionally NOT included in URL params that trigger API call
      ...(category ? { category } : {}),
      ...(priceMax > 0 ? { priceMax } : {}),
    });
  };

  const removeFilter = (key) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next);
    if (key === "category") setCategory("");
    if (key === "sortBy") setSortBy("");
    if (key === "priceMax") setPriceMax(0);
    setPage(1);
  };

  useEffect(() => {
    setInputVal(q);
    setPage(1);
  }, [q]);

  useEffect(() => {
    if (!q) return;
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("q", q);
      // sortBy kept in URL for shareability but doesn't affect API call
      if (sortBy) next.set("sortBy", sortBy);
      else next.delete("sortBy");
      if (category) next.set("category", category);
      else next.delete("category");
      if (priceMax > 0) next.set("priceMax", String(priceMax));
      else next.delete("priceMax");
      if (page > 1) next.set("page", String(page));
      else next.delete("page");
      return next;
    });
  }, [q, sortBy, category, priceMax, page, setSearchParams]);

  const activeFilterChips = [
    ...(category ? [{ label: category, key: "category" }] : []),
    ...(sortBy
      ? [
          {
            label:
              SORT_OPTIONS.find((o) => o.value === sortBy)?.label || sortBy,
            key: "sortBy",
          },
        ]
      : []),
    ...(priceMax > 0
      ? [
          {
            label: `Under ₹${priceMax.toLocaleString("en-IN")}`,
            key: "priceMax",
          },
        ]
      : []),
  ];

  return (
    <div style={{ minHeight: "100vh", paddingTop: "var(--nav-h, 80px)" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Search Hero */}
      <div
        style={{
          padding: "clamp(28px,5vw,60px) var(--page-px) clamp(20px,4vw,48px)",
          borderBottom: "1px solid rgba(201,169,110,0.08)",
          background: "rgba(201,169,110,0.01)",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(201,169,110,0.5)",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Search
          </div>
          <form onSubmit={handleSearch} style={{ position: "relative" }}>
            <input
              ref={inputRef}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search the collection…"
              style={{
                width: "100%",
                padding:
                  "clamp(14px,3vw,20px) 56px clamp(14px,3vw,20px) clamp(16px,3vw,24px)",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(201,169,110,0.2)",
                color: "#f0e6d0",
                fontSize: "clamp(14px,2.5vw,16px)",
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 300,
                outline: "none",
                letterSpacing: "0.02em",
                transition: "border-color 0.3s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(201,169,110,0.5)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(201,169,110,0.2)")
              }
            />
            <button
              type="submit"
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: 52,
                background: "rgba(201,169,110,0.08)",
                border: "1px solid rgba(201,169,110,0.2)",
                borderLeft: "none",
                color: "#c9a96e",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.25s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(201,169,110,0.18)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(201,169,110,0.08)")
              }
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="9" cy="9" r="6" />
                <path d="M16 16l-3-3" />
              </svg>
            </button>
          </form>
          {q && (
            <div
              style={{
                marginTop: 12,
                textAlign: "center",
                fontSize: 13,
                color: "rgba(240,230,208,0.38)",
              }}
            >
              {isLoading
                ? "Searching…"
                : `${total.toLocaleString("en-IN")} results for `}
              {!isLoading && (
                <em
                  style={{
                    fontStyle: "italic",
                    color: "rgba(240,230,208,0.55)",
                  }}
                >
                  "{q}"
                </em>
              )}
            </div>
          )}
        </div>
      </div>

      {q.length > 0 && (
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "0 var(--page-px)",
          }}
        >
          {/* Category filter pills */}
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              padding: "clamp(12px,2vw,20px) 0 0",
              overflowX: "auto",
            }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = cat === "All" ? !category : category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat === "All" ? "" : cat);
                    setPage(1);
                  }}
                  style={{
                    padding: "7px 16px",
                    border: `1px solid ${isActive ? "rgba(201,169,110,0.4)" : "rgba(201,169,110,0.15)"}`,
                    background: isActive ? "rgba(201,169,110,0.1)" : "none",
                    color: isActive ? "#c9a96e" : "rgba(240,230,208,0.45)",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                    minHeight: 36,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Controls bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "clamp(14px,3vw,24px) 0",
              borderBottom: "1px solid rgba(201,169,110,0.06)",
              flexWrap: "wrap",
              gap: 12,
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
              {activeFilterChips.map((chip) => (
                <div
                  key={chip.key}
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
                  {chip.label}
                  <button
                    onClick={() => removeFilter(chip.key)}
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
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <label
                style={{
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(240,230,208,0.35)",
                }}
              >
                Sort
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  // Only updates local state — no API refetch triggered
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: "9px 14px",
                  background: "#252320",
                  border: "1px solid rgba(201,169,110,0.18)",
                  color: "#f0e6d0",
                  fontSize: 12,
                  outline: "none",
                  cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                  minHeight: 40,
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results */}
          <div style={{ paddingTop: "clamp(20px,4vw,32px)" }}>
            {isLoading ? (
              <div className="listing-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "clamp(48px,8vw,80px) 20px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: "clamp(36px,8vw,52px)",
                    fontWeight: 300,
                    color: "rgba(201,169,110,0.3)",
                    marginBottom: 16,
                    lineHeight: 1,
                  }}
                >
                  No results
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(240,230,208,0.35)",
                    marginBottom: 8,
                  }}
                >
                  We couldn't find anything for <em>"{q}"</em>.
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(240,230,208,0.25)",
                    marginBottom: 32,
                  }}
                >
                  Try a different keyword or browse the full collection.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => {
                      setInputVal("");
                      setSearchParams({});
                    }}
                    style={{
                      padding: "12px 24px",
                      background: "none",
                      border: "1px solid rgba(201,169,110,0.25)",
                      color: "#c9a96e",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                      minHeight: 44,
                    }}
                  >
                    Clear Search
                  </button>
                  <button
                    onClick={() => navigate("/products")}
                    style={{
                      padding: "12px 24px",
                      background: "#c9a96e",
                      color: "#0d0c0b",
                      border: "none",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                      minHeight: 44,
                    }}
                  >
                    Browse All
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="listing-grid" style={{ marginBottom: 40 }}>
                  {products.map((p, i) => (
                    <ProductCard key={p.id || p._id || i} product={p} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 4,
                      marginBottom: 60,
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
      )}

      {/* No query state */}
      {!q && (
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "clamp(48px,8vw,80px) var(--page-px)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(20px,4vw,28px)",
              fontWeight: 300,
              color: "rgba(240,230,208,0.3)",
              marginBottom: 24,
            }}
          >
            What are you looking for?
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {["Watches", "Apparel", "Bags", "Footwear", "Accessories"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => navigate(`/products?category=${cat}`)}
                  style={{
                    padding: "11px 20px",
                    background: "none",
                    border: "1px solid rgba(201,169,110,0.18)",
                    color: "rgba(240,230,208,0.45)",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    fontFamily: "'DM Sans',sans-serif",
                    minHeight: 44,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)";
                    e.currentTarget.style.color = "#c9a96e";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(201,169,110,0.18)";
                    e.currentTarget.style.color = "rgba(240,230,208,0.45)";
                  }}
                >
                  {cat}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"; //pagination / infinite scroll.
import { productApi } from "../api/products";
import { cartApi } from "../api/cart";
import { wishlistApi } from "../api/user";
import { useAuthStore } from "../store/authStore";
import { useGuestCartStore } from "../store/guestCartStore";
import { getSessionId, useBehaviorTracker } from "../hooks/useBehaviorTracker";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const LIMIT = 5;

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

function StarRating({ rating = 0 }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{
            fontSize: 11,
            color:
              s <= Math.round(rating) ? "#c9a96e" : "rgba(201,169,110,0.2)",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

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
              padding: "5px 10px",
              border: "1px solid rgba(201,169,110,0.35)",
              background: "none",
              color: "#c9a96e",
              fontSize: 11,
              cursor: "pointer",
              letterSpacing: "0.08em",
              fontFamily: "'DM Sans',sans-serif",
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
          letterSpacing: "0.1em",
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
  const [wishlisted, setWishlisted] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);

  const availableSizes = (product.sizes || []).filter((s) => s.stock > 0);

  const handleCardClick = () => {
    navigate(`/product/${product.id || product._id}`);
  };

  const doAddToCart = async (size) => {
    setAdding(true);
    setShowSizePicker(false);
    try {
      if (isLoggedIn) {
        await cartApi.addItem(
          product.id || product._id,
          1,
          size,
          product.offerPrice || product.price,
          product.name,
          product.images?.[0] || "",
        );
      } else {
        guestAddItem({
          productId: product.id || product._id,
          quantity: 1,
          size,
          priceAtAdd: product.offerPrice || product.price,
          name: product.name,
          image: product.images?.[0] || "",
        });
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (_) {}
    setAdding(false);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // stop event propagation to prevent triggering the card's onClick
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

  const handleWishlist = async (e) => {
    e.stopPropagation(); // stop event propagation to prevent triggering the card's onClick
    try {
      if (wishlisted) await wishlistApi.remove(product.id || product._id);
      else await wishlistApi.add(product.id || product._id);
      setWishlisted((w) => !w);
    } catch (_) {}
  };

  const price = product.offerPrice || product.price || 0;
  const img = product.images?.[0];

  return (
    <div
      onClick={handleCardClick}
      style={{
        background: "#1a1916",
        border: "1px solid rgba(201,169,110,0.18)",
        overflow: "visible",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
        position: "relative",
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
      <div
        className="listing-card__img"
        style={{
          position: "relative",
          aspectRatio: "3/4",
          background: "#0d0c0b",
          overflow: "hidden",
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
        <button
          onClick={handleWishlist}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 32,
            height: 32,
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

      <div style={{ padding: "16px 16px 20px", position: "relative" }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(201,169,110,0.5)",
            marginBottom: 6,
          }}
        >
          {product.category || ""}
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 16,
            fontWeight: 300,
            color: "#f0e6d0",
            marginBottom: 8,
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
            marginBottom: 12,
          }}
        >
          <StarRating rating={product.rating || 0} />
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
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 20,
              fontWeight: 300,
              color: "#c9a96e",
            }}
          >
            {fmt(price)}
          </span>
        </div>
        <div style={{ position: "relative" }}>
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
              padding: "10px",
              background: added ? "#c9a96e" : "rgba(201,169,110,0.08)",
              border: "1px solid rgba(201,169,110,0.25)",
              color: added ? "#0d0c0b" : "#c9a96e",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "'DM Sans',sans-serif",
            }}
            onMouseEnter={(e) => {
              if (!added) {
                e.currentTarget.style.background = "#c9a96e";
                e.currentTarget.style.color = "#0d0c0b";
              }
            }}
            onMouseLeave={(e) => {
              if (!added) {
                e.currentTarget.style.background = "rgba(201,169,110,0.08)";
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

function CardSkeleton() {
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

const getProducts = (page) =>
  Array.isArray(page) ? page : page?.products || page?.items || [];
const getTotal = (page) => page?.total || page?.count || 0;

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

function PersonalisedStrip({ isLoggedIn }) {
  const navigate = useNavigate();
  const guestAddItem = useGuestCartStore((s) => s.addItem);
  const { track } = useBehaviorTracker();

  const { data: picks = [], isLoading } = useQuery({
    queryKey: ["personalized-collection", isLoggedIn],
    queryFn: () =>
      productApi
        .personalized(getSessionId())
        .then((r) => (r.data.data || []).slice(0, 8)),
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  if (isLoading || picks.length < 2) return null;

  return (
    <div
      style={{
        padding: "28px 0 0",
        marginBottom: 32,
        borderBottom: "1px solid rgba(201,169,110,0.07)",
        paddingBottom: 32,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <span
          style={{
            width: 24,
            height: 1,
            background: "linear-gradient(to right, transparent, #c9a96e)",
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: 9,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#c9a96e",
          }}
        >
          Curated For You
        </span>
        <span
          style={{
            fontSize: 9,
            letterSpacing: "0.1em",
            color: "rgba(201,169,110,0.3)",
            textTransform: "uppercase",
          }}
        >
          · AI Picks
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          paddingBottom: 8,
          scrollbarWidth: "none",
        }}
      >
        {picks.map((p) => {
          const pid = p._id || p.id;
          const img = p.images?.[0];
          return (
            <div
              key={pid}
              onClick={() => navigate(`/product/${pid}`)}
              style={{
                flex: "0 0 160px",
                background: "#1a1916",
                border: "1px solid rgba(201,169,110,0.14)",
                cursor: "pointer",
                transition: "all 0.35s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,169,110,0.38)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,169,110,0.14)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                style={{
                  aspectRatio: "3/4",
                  background: "#0d0c0b",
                  overflow: "hidden",
                }}
              >
                {img ? (
                  <img
                    src={img}
                    alt={p.name}
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
                    }}
                  >
                    <svg width="32" height="32" viewBox="0 0 60 60" fill="none">
                      <rect
                        x="10"
                        y="10"
                        width="40"
                        height="40"
                        stroke="rgba(201,169,110,0.2)"
                        strokeWidth="0.8"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div style={{ padding: "10px 12px 14px" }}>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(201,169,110,0.45)",
                    marginBottom: 4,
                  }}
                >
                  {p.category}
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 13,
                    fontWeight: 300,
                    color: "#f0e6d0",
                    marginBottom: 6,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 16,
                    color: "#c9a96e",
                  }}
                >
                  {"₹" + Number(p.price || 0).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CollectionPage() {
  const { isLoggedIn } = useAuthStore();
  const [searchParams] = useSearchParams();
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
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const sentinelRef = useRef(null);

  const hasFilters =
    category !== "All" ||
    priceMin > 0 ||
    priceMax < 50000 ||
    search.trim() !== "";

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["collection", { category, priceMin, priceMax, search }],
      queryFn: ({ pageParam = 0 }) => {
        if (!hasFilters) {
          return productApi
            .browse({ skip: pageParam, limit: LIMIT })
            .then((r) => r.data.data || r.data);
        }
        return productApi
          .list({
            ...(category && category !== "All" ? { category } : {}),
            ...(priceMin > 0 ? { priceMin } : {}),
            ...(priceMax < 50000 ? { priceMax } : {}),
            ...(search.trim() ? { search: search.trim() } : {}),
            skip: pageParam,
            limit: LIMIT,
          })
          .then((r) => r.data.data || r.data);
      },
      getNextPageParam: (lastPage, allPages) => {
        const loaded = allPages.flatMap(getProducts).length;
        const total = getTotal(lastPage);
        return loaded < total ? loaded : undefined;
      },
      staleTime: 5 * 60 * 1000,
    });

  const allProducts = data?.pages.flatMap(getProducts) ?? [];
  const displayedProducts = sortProducts(allProducts, sortBy);
  const total = data?.pages[0] ? getTotal(data.pages[0]) : 0;

  //Purpose infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the sentinel comes into view, fetch the next page if available
        //isIntersecting is true when the sentinel is visible in the viewport
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "120px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const clearAll = () => {
    setCategory("All");
    setPriceMin(0);
    setPriceMax(50000);
    setSortBy("");
    setSearch("");
    setSearchInput("");
  };

  const activeFilters = [
    ...(category && category !== "All"
      ? [{ label: category, clear: () => setCategory("All") }]
      : []),
    ...(search
      ? [
          {
            label: `"${search}"`,
            clear: () => {
              setSearch("");
              setSearchInput("");
            },
          },
        ]
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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="listing-page">
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .col-mobile-filter-overlay {
          display: none;
          position: fixed;
          top: var(--nav-h, 60px);
          bottom: 0; left: 0; right: 0;
          background: rgba(13,12,11,0.92);
          z-index: 500;
          align-items: flex-end;
          backdrop-filter: blur(10px);
        }
        .col-mobile-filter-overlay.open { display: flex; }
        .col-mobile-filter-panel {
          width: 100%;
          background: #1a1916;
          border-top: 1px solid rgba(201,169,110,0.18);
          padding: 24px 20px 40px;
          max-height: 88vh;
          overflow-y: auto;
        }
        .col-mobile-filter-header {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 24px; padding-bottom: 16px;
          border-bottom: 1px solid rgba(201,169,110,0.12);
        }
      `}</style>

      {/* Hero Header */}
      <div
        style={{
          padding: "clamp(32px,5vw,56px) var(--page-px) clamp(24px,4vw,40px)",
          borderBottom: "1px solid rgba(201,169,110,0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 600,
            height: 280,
            background:
              "radial-gradient(ellipse at top right, rgba(201,169,110,0.05) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#c9a96e",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              width: 32,
              height: 1,
              background: "linear-gradient(to right, transparent, #c9a96e)",
              display: "inline-block",
            }}
          />
          NeuralShop — Curated Collection
          <span
            style={{
              width: 32,
              height: 1,
              background: "linear-gradient(to left, transparent, #c9a96e)",
              display: "inline-block",
            }}
          />
        </div>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "clamp(38px,5.5vw,68px)",
            fontWeight: 300,
            color: "#f0e6d0",
            lineHeight: 1.05,
            marginBottom: 16,
          }}
        >
          {search ? (
            <>
              Results for{" "}
              <em style={{ fontStyle: "italic", color: "#c9a96e" }}>
                "{search}"
              </em>
            </>
          ) : category && category !== "All" ? (
            <>
              <em style={{ fontStyle: "italic", color: "#c9a96e" }}>
                {category}
              </em>{" "}
              Collection
            </>
          ) : (
            <>
              The Complete{" "}
              <em style={{ fontStyle: "italic", color: "#c9a96e" }}>
                Collection
              </em>
            </>
          )}
        </h1>

        <p
          style={{
            fontSize: 13,
            color: "rgba(240,230,208,0.4)",
            maxWidth: 520,
            lineHeight: 1.7,
          }}
        >
          {isLoading
            ? "Curating collection…"
            : `${total.toLocaleString("en-IN")} curated pieces, each crafted for the discerning collector`}
        </p>
      </div>

      {/* Mobile filter toggle — opens bottom drawer on mobile */}
      <button
        className="listing-filter-toggle"
        onClick={() => setMobileFiltersOpen(true)}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="14" y2="12" />
          <line x1="4" y1="18" x2="10" y2="18" />
        </svg>
        Show Filters
      </button>

      {/* Mobile filter bottom drawer */}
      <div
        className={`col-mobile-filter-overlay${mobileFiltersOpen ? " open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setMobileFiltersOpen(false);
        }}
      >
        <div className="col-mobile-filter-panel">
          <div className="col-mobile-filter-header">
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
          {/* Search */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(201,169,110,0.5)",
                marginBottom: 10,
              }}
            >
              Search
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearch(searchInput.trim());
                setMobileFiltersOpen(false);
              }}
              style={{ display: "flex", gap: 0 }}
            >
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products…"
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  background: "rgba(201,169,110,0.04)",
                  border: "1px solid rgba(201,169,110,0.18)",
                  borderRight: "none",
                  color: "#f0e6d0",
                  fontSize: 12,
                  outline: "none",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "8px 12px",
                  background: "rgba(201,169,110,0.12)",
                  border: "1px solid rgba(201,169,110,0.18)",
                  color: "#c9a96e",
                  cursor: "pointer",
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                ↵
              </button>
            </form>
          </div>
          {/* Category */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(201,169,110,0.5)",
                marginBottom: 12,
              }}
            >
              Category
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: "7px 14px",
                    background:
                      category === cat ? "rgba(201,169,110,0.1)" : "none",
                    border: `1px solid ${category === cat ? "rgba(201,169,110,0.35)" : "rgba(201,169,110,0.15)"}`,
                    color:
                      category === cat ? "#c9a96e" : "rgba(240,230,208,0.45)",
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          {/* Sort */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(201,169,110,0.5)",
                marginBottom: 12,
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
                    padding: "9px 12px",
                    background:
                      sortBy === opt.value ? "rgba(201,169,110,0.08)" : "none",
                    border:
                      sortBy === opt.value
                        ? "1px solid rgba(201,169,110,0.25)"
                        : "1px solid transparent",
                    color:
                      sortBy === opt.value
                        ? "#c9a96e"
                        : "rgba(240,230,208,0.45)",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Price */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(201,169,110,0.5)",
                marginBottom: 10,
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
                marginBottom: 8,
              }}
            >
              <span>₹{priceMin.toLocaleString("en-IN")}</span>
              <span>₹{priceMax.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min={0}
              max={50000}
              step={500}
              value={priceMin}
              onChange={(e) => {
                const v = Number(e.target.value);
                setPriceMin(v);
                if (v > priceMax) setPriceMax(v);
              }}
              style={{ width: "100%", accentColor: "#c9a96e", marginBottom: 8 }}
            />
            <input
              type="range"
              min={0}
              max={50000}
              step={500}
              value={priceMax}
              onChange={(e) => {
                const v = Number(e.target.value);
                setPriceMax(v);
                if (v < priceMin) setPriceMin(v);
              }}
              style={{ width: "100%", accentColor: "#c9a96e" }}
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => {
                clearAll();
                setMobileFiltersOpen(false);
              }}
              style={{
                flex: 1,
                padding: 12,
                background: "none",
                border: "1px solid rgba(201,169,110,0.18)",
                color: "rgba(240,230,208,0.5)",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Clear All
            </button>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              style={{
                flex: 1,
                padding: 12,
                background: "#c9a96e",
                border: "none",
                color: "#0d0c0b",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 500,
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="listing-layout">
        {/* Sticky Sidebar — desktop only */}
        <aside className="listing-sidebar">
          {/* Search */}
          <div style={{ marginBottom: 40 }}>
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
            <form
              onSubmit={handleSearchSubmit}
              style={{ display: "flex", gap: 0 }}
            >
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products…"
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  background: "rgba(201,169,110,0.04)",
                  border: "1px solid rgba(201,169,110,0.18)",
                  borderRight: "none",
                  color: "#f0e6d0",
                  fontSize: 12,
                  outline: "none",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "8px 12px",
                  background: "rgba(201,169,110,0.12)",
                  border: "1px solid rgba(201,169,110,0.18)",
                  color: "#c9a96e",
                  cursor: "pointer",
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                ↵
              </button>
            </form>
          </div>

          {/* Category */}
          <div style={{ marginBottom: 40 }}>
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(201,169,110,0.5)",
                marginBottom: 16,
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
                    padding: "9px 12px",
                    background:
                      category === cat ? "rgba(201,169,110,0.08)" : "none",
                    border:
                      category === cat
                        ? "1px solid rgba(201,169,110,0.25)"
                        : "1px solid transparent",
                    color:
                      category === cat ? "#c9a96e" : "rgba(240,230,208,0.45)",
                    fontSize: 12,
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: 40 }}>
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(201,169,110,0.5)",
                marginBottom: 16,
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
                marginBottom: 16,
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
                    padding: "9px 12px",
                    background:
                      sortBy === opt.value ? "rgba(201,169,110,0.08)" : "none",
                    border:
                      sortBy === opt.value
                        ? "1px solid rgba(201,169,110,0.25)"
                        : "1px solid transparent",
                    color:
                      sortBy === opt.value
                        ? "#c9a96e"
                        : "rgba(240,230,208,0.45)",
                    fontSize: 12,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="listing-content">
          {/* AI Personalized Strip */}
          {!hasFilters && <PersonalisedStrip isLoggedIn={isLoggedIn} />}

          {/* Filter chips + count bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 28,
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
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {activeFilters.length > 1 && (
                <button
                  onClick={clearAll}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 11,
                    color: "rgba(240,230,208,0.35)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Clear all
                </button>
              )}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(240,230,208,0.35)",
                fontFamily: "'DM Mono',monospace",
              }}
            >
              {!isLoading && `${allProducts.length} / ${total} loaded`}
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 2,
              }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : allProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 42,
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
                onClick={clearAll}
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
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="listing-grid">
                {displayedProducts.map((p, i) => (
                  <ProductCard key={p.id || p._id || i} product={p} />
                ))}
                {isFetchingNextPage &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <CardSkeleton key={`sk-${i}`} />
                  ))}
              </div>

              <div
                ref={sentinelRef}
                style={{
                  height: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 8,
                }}
              >
                {isFetchingNextPage && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      color: "rgba(201,169,110,0.5)",
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: "1px solid rgba(201,169,110,0.35)",
                        borderTopColor: "#c9a96e",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Loading more
                  </div>
                )}
                {!hasNextPage &&
                  allProducts.length > 0 &&
                  !isFetchingNextPage && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        fontSize: 9,
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        color: "rgba(201,169,110,0.2)",
                      }}
                    >
                      <span
                        style={{
                          width: 40,
                          height: 1,
                          background: "rgba(201,169,110,0.15)",
                          display: "inline-block",
                        }}
                      />
                      End of Collection
                      <span
                        style={{
                          width: 40,
                          height: 1,
                          background: "rgba(201,169,110,0.15)",
                          display: "inline-block",
                        }}
                      />
                    </div>
                  )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

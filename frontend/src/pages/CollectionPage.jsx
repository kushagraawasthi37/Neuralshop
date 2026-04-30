import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { productApi } from "../api/products";
import { wishlistApi } from "../api/user";
import { useCartStore } from "../store/cartStore";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const LIMIT = 12;

const CATEGORIES = ["All", "Watches", "Apparel", "Bags", "Footwear", "Accessories", "Jewellery"];
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
        <span key={s} style={{ fontSize: 11, color: s <= Math.round(rating) ? "#c9a96e" : "rgba(201,169,110,0.2)" }}>★</span>
      ))}
    </div>
  );
}

function ProductCard({ product }) {
  const { addItem } = useCartStore();
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setAdding(true);
    try { await addItem(product.id || product._id, 1, {}); } catch (_) {}
    setAdding(false);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    try {
      if (wishlisted) await wishlistApi.remove(product.id || product._id);
      else await wishlistApi.add(product.id || product._id);
      setWishlisted((w) => !w);
    } catch (_) {}
  };

  const price = product.offerPrice || product.price || 0;
  const original = product.originalPrice || product.comparePrice;
  const discount = original && original > price ? Math.round(((original - price) / original) * 100) : null;
  const img = product.image?.[0] || product.images?.[0];

  return (
    <Link to={`/product/${product.id || product._id}`} style={{ textDecoration: "none" }}>
      <div
        style={{ background: "#1a1916", border: "1px solid rgba(201,169,110,0.18)", overflow: "hidden", cursor: "pointer", transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,110,0.42)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,110,0.18)"; e.currentTarget.style.transform = "none"; }}
      >
        <div style={{ position: "relative", aspectRatio: "3/4", background: "#0d0c0b", overflow: "hidden" }}>
          {img ? (
            <img src={img} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "none")} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="48" height="48" viewBox="0 0 60 60" fill="none">
                <rect x="10" y="10" width="40" height="40" stroke="rgba(201,169,110,0.3)" strokeWidth="0.8" />
                <path d="M20 30h20M30 20v20" stroke="rgba(201,169,110,0.2)" strokeWidth="0.8" />
              </svg>
            </div>
          )}
          {discount && (
            <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(201,169,110,0.9)", color: "#0d0c0b", fontSize: 10, letterSpacing: "0.1em", padding: "3px 8px", fontWeight: 500 }}>
              -{discount}%
            </div>
          )}
          <button
            onClick={handleWishlist}
            style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, background: "rgba(13,12,11,0.7)", border: "1px solid rgba(201,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.25s ease" }}
          >
            <span style={{ fontSize: 14, color: wishlisted ? "#c9a96e" : "rgba(201,169,110,0.4)", lineHeight: 1 }}>
              {wishlisted ? "♥" : "♡"}
            </span>
          </button>
        </div>

        <div style={{ padding: "16px 16px 20px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(201,169,110,0.5)", marginBottom: 6 }}>
            {product.category || ""}
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 300, color: "#f0e6d0", marginBottom: 8, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {product.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <StarRating rating={product.rating || product.avgRating || 0} />
            {product.reviewCount > 0 && (
              <span style={{ fontSize: 11, color: "rgba(240,230,208,0.35)" }}>({product.reviewCount})</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 300, color: "#c9a96e" }}>{fmt(price)}</span>
            {original && original > price && (
              <span style={{ fontSize: 12, color: "rgba(240,230,208,0.35)", textDecoration: "line-through" }}>{fmt(original)}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            style={{ width: "100%", padding: "10px", background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.25)", color: "#c9a96e", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.3s ease", fontFamily: "'DM Sans',sans-serif" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#c9a96e"; e.currentTarget.style.color = "#0d0c0b"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(201,169,110,0.08)"; e.currentTarget.style.color = "#c9a96e"; }}
          >
            {adding ? "Adding…" : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div style={{ background: "#1a1916", border: "1px solid rgba(201,169,110,0.08)", overflow: "hidden" }}>
      <div style={{ aspectRatio: "3/4", background: "rgba(201,169,110,0.04)", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ padding: 16 }}>
        <div style={{ height: 8, background: "rgba(201,169,110,0.06)", marginBottom: 10, width: "40%" }} />
        <div style={{ height: 18, background: "rgba(201,169,110,0.06)", marginBottom: 8 }} />
        <div style={{ height: 14, background: "rgba(201,169,110,0.06)", width: "60%" }} />
      </div>
    </div>
  );
}

const getProducts = (page) => Array.isArray(page) ? page : (page?.products || page?.items || []);
const getTotal = (page) => page?.total || page?.count || 0;

export default function CollectionPage() {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");
  const [priceMin, setPriceMin] = useState(Number(searchParams.get("priceMin") || 0));
  const [priceMax, setPriceMax] = useState(Number(searchParams.get("priceMax") || 50000));
  const sentinelRef = useRef(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["collection", { category, sortBy, priceMin, priceMax }],
    queryFn: ({ pageParam = 0 }) =>
      productApi.list({
        ...(category && category !== "All" ? { category } : {}),
        ...(sortBy ? { sortBy } : {}),
        ...(priceMin > 0 ? { price_min: priceMin } : {}),
        ...(priceMax < 50000 ? { price_max: priceMax } : {}),
        skip: pageParam,
        limit: LIMIT,
      }).then((r) => r.data.data || r.data),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.flatMap(getProducts).length;
      const total = getTotal(lastPage);
      return loaded < total ? loaded : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

  const allProducts = data?.pages.flatMap(getProducts) ?? [];
  const total = data?.pages[0] ? getTotal(data.pages[0]) : 0;

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "120px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const activeFilters = [
    ...(category && category !== "All" ? [{ label: category, clear: () => setCategory("All") }] : []),
    ...(priceMin > 0 || priceMax < 50000
      ? [{ label: `₹${priceMin.toLocaleString("en-IN")} – ₹${priceMax.toLocaleString("en-IN")}`, clear: () => { setPriceMin(0); setPriceMax(50000); } }]
      : []),
  ];

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80 }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* Hero Header */}
      <div style={{ padding: "56px 52px 40px", borderBottom: "1px solid rgba(201,169,110,0.08)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 600, height: 280, background: "radial-gradient(ellipse at top right, rgba(201,169,110,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: "30%", width: 1, height: "100%", background: "linear-gradient(to bottom, transparent, rgba(201,169,110,0.05), transparent)", pointerEvents: "none" }} />

        <div style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a96e", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ width: 32, height: 1, background: "linear-gradient(to right, transparent, #c9a96e)", display: "inline-block" }} />
          NeuralShop — Curated Collection
          <span style={{ width: 32, height: 1, background: "linear-gradient(to left, transparent, #c9a96e)", display: "inline-block" }} />
        </div>

        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(38px,5.5vw,68px)", fontWeight: 300, color: "#f0e6d0", lineHeight: 1.05, marginBottom: 16 }}>
          {category && category !== "All" ? (
            <><em style={{ fontStyle: "italic", color: "#c9a96e" }}>{category}</em> Collection</>
          ) : (
            <>The Complete <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Collection</em></>
          )}
        </h1>

        <p style={{ fontSize: 13, color: "rgba(240,230,208,0.4)", maxWidth: 520, lineHeight: 1.7 }}>
          {isLoading
            ? "Curating collection…"
            : `${total.toLocaleString("en-IN")} curated pieces, each crafted for the discerning collector`}
        </p>
      </div>

      <div style={{ display: "flex", padding: "0 52px" }}>
        {/* Sticky Sidebar */}
        <aside style={{
          width: 240, flexShrink: 0, paddingTop: 40, paddingRight: 40,
          borderRight: "1px solid rgba(201,169,110,0.08)",
          position: "sticky", top: 80, alignSelf: "flex-start",
          maxHeight: "calc(100vh - 80px)", overflowY: "auto",
        }}>
          {/* Category */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(201,169,110,0.5)", marginBottom: 16 }}>Category</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)}
                  style={{ textAlign: "left", padding: "9px 12px", background: category === cat ? "rgba(201,169,110,0.08)" : "none", border: category === cat ? "1px solid rgba(201,169,110,0.25)" : "1px solid transparent", color: category === cat ? "#c9a96e" : "rgba(240,230,208,0.45)", fontSize: 12, letterSpacing: "0.06em", cursor: "pointer", transition: "all 0.2s ease", fontFamily: "'DM Sans',sans-serif" }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(201,169,110,0.5)", marginBottom: 16 }}>Price Range</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(240,230,208,0.45)", marginBottom: 10 }}>
              <span>₹{priceMin.toLocaleString("en-IN")}</span>
              <span>₹{priceMax.toLocaleString("en-IN")}</span>
            </div>
            <input type="range" min={0} max={50000} step={500} value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#c9a96e", background: "none", cursor: "pointer" }} />
          </div>

          {/* Sort */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(201,169,110,0.5)", marginBottom: 16 }}>Sort By</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {SORT_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setSortBy(opt.value)}
                  style={{ textAlign: "left", padding: "9px 12px", background: sortBy === opt.value ? "rgba(201,169,110,0.08)" : "none", border: sortBy === opt.value ? "1px solid rgba(201,169,110,0.25)" : "1px solid transparent", color: sortBy === opt.value ? "#c9a96e" : "rgba(240,230,208,0.45)", fontSize: 12, cursor: "pointer", transition: "all 0.2s ease", fontFamily: "'DM Sans',sans-serif" }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div style={{ flex: 1, paddingLeft: 40, paddingTop: 32 }}>
          {/* Filter chips + count bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {activeFilters.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", border: "1px solid rgba(201,169,110,0.3)", fontSize: 11, color: "#c9a96e" }}>
                  {f.label}
                  <button onClick={f.clear} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(201,169,110,0.5)", fontSize: 14, lineHeight: 1 }}>×</button>
                </div>
              ))}
              {activeFilters.length > 1 && (
                <button
                  onClick={() => { setCategory("All"); setPriceMin(0); setPriceMax(50000); setSortBy(""); }}
                  style={{ background: "none", border: "none", fontSize: 11, color: "rgba(240,230,208,0.35)", cursor: "pointer", textDecoration: "underline" }}
                >
                  Clear all
                </button>
              )}
            </div>
            <div style={{ fontSize: 11, color: "rgba(240,230,208,0.35)", fontFamily: "'DM Mono',monospace" }}>
              {!isLoading && `${allProducts.length} / ${total} loaded`}
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 2 }}>
              {Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : allProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 42, fontWeight: 300, color: "rgba(201,169,110,0.4)", marginBottom: 16 }}>
                No results
              </div>
              <p style={{ fontSize: 13, color: "rgba(240,230,208,0.35)", marginBottom: 28 }}>
                No products match your current filters.
              </p>
              <button
                onClick={() => { setCategory("All"); setPriceMin(0); setPriceMax(50000); setSortBy(""); }}
                style={{ padding: "12px 32px", background: "#c9a96e", color: "#0d0c0b", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 2 }}>
                {allProducts.map((p, i) => <ProductCard key={p.id || p._id || i} product={p} />)}
                {isFetchingNextPage && Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={`sk-${i}`} />)}
              </div>

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 8 }}>
                {isFetchingNextPage && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(201,169,110,0.5)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                    <div style={{ width: 16, height: 16, border: "1px solid rgba(201,169,110,0.35)", borderTopColor: "#c9a96e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    Loading more
                  </div>
                )}
                {!hasNextPage && allProducts.length > 0 && !isFetchingNextPage && (
                  <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(201,169,110,0.2)" }}>
                    <span style={{ width: 40, height: 1, background: "rgba(201,169,110,0.15)", display: "inline-block" }} />
                    End of Collection
                    <span style={{ width: 40, height: 1, background: "rgba(201,169,110,0.15)", display: "inline-block" }} />
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

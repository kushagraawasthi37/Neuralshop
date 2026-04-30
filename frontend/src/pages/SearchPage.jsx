import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "../api/products";
import { useCartStore } from "../store/cartStore";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

const SORT_OPTIONS = [
  { label: "Relevance", value: "" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
  { label: "Newest", value: "newest" },
];

function ProductCard({ product }) {
  const { addItem } = useCartStore();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setAdding(true);
    try { await addItem(product.id || product._id, 1, {}); } catch (_) {}
    setAdding(false);
  };

  const price = product.offerPrice || product.price || 0;
  const original = product.originalPrice || product.comparePrice;
  const discount = original && original > price ? Math.round(((original - price) / original) * 100) : null;
  const img = product.image?.[0] || product.images?.[0];

  return (
    <Link to={`/product/${product.id || product._id}`} style={{ textDecoration: "none" }}>
      <div style={{ background: "#1a1916", border: "1px solid rgba(201,169,110,0.18)", overflow: "hidden", transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,110,0.42)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,110,0.18)"; e.currentTarget.style.transform = "none"; }}>
        <div style={{ position: "relative", aspectRatio: "3/4", background: "#0d0c0b", overflow: "hidden" }}>
          {img ? (
            <img src={img} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
                <rect x="10" y="10" width="40" height="40" stroke="rgba(201,169,110,0.25)" strokeWidth="0.8" />
                <path d="M20 30h20M30 20v20" stroke="rgba(201,169,110,0.15)" strokeWidth="0.8" />
              </svg>
            </div>
          )}
          {discount && (
            <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(201,169,110,0.9)", color: "#0d0c0b", fontSize: 9, letterSpacing: "0.1em", padding: "2px 7px", fontWeight: 500 }}>
              -{discount}%
            </div>
          )}
        </div>
        <div style={{ padding: "14px 14px 18px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(201,169,110,0.45)", marginBottom: 5 }}>{product.category || ""}</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 300, color: "#f0e6d0", marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 300, color: "#c9a96e" }}>{fmt(price)}</span>
            {original && original > price && (
              <span style={{ fontSize: 11, color: "rgba(240,230,208,0.3)", textDecoration: "line-through" }}>{fmt(original)}</span>
            )}
          </div>
          <button onClick={handleAddToCart} disabled={adding}
            style={{ width: "100%", padding: "9px", background: "rgba(201,169,110,0.07)", border: "1px solid rgba(201,169,110,0.2)", color: "#c9a96e", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.25s ease", fontFamily: "'DM Sans',sans-serif" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#c9a96e"; e.currentTarget.style.color = "#0d0c0b"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(201,169,110,0.07)"; e.currentTarget.style.color = "#c9a96e"; }}>
            {adding ? "Adding…" : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}

function Skeleton() {
  return (
    <div style={{ background: "#1a1916", border: "1px solid rgba(201,169,110,0.08)", overflow: "hidden" }}>
      <div style={{ aspectRatio: "3/4", background: "rgba(201,169,110,0.03)", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ padding: 14 }}>
        <div style={{ height: 8, background: "rgba(201,169,110,0.05)", marginBottom: 8, width: "40%" }} />
        <div style={{ height: 15, background: "rgba(201,169,110,0.05)", marginBottom: 6 }} />
        <div style={{ height: 12, background: "rgba(201,169,110,0.05)", width: "50%" }} />
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [inputVal, setInputVal] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [priceMax, setPriceMax] = useState(Number(searchParams.get("priceMax") || 0));
  const [page, setPage] = useState(1);

  const q = searchParams.get("q") || "";
  const limit = 16;

  const queryParams = {
    search: q,
    ...(sortBy ? { sortBy } : {}),
    ...(category ? { category } : {}),
    ...(priceMax > 0 ? { price_max: priceMax } : {}),
    skip: (page - 1) * limit,
    limit,
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["search", queryParams],
    queryFn: () => productApi.list(queryParams).then((r) => r.data.data || r.data),
    enabled: q.length > 0,
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });

  const products = Array.isArray(data) ? data : (data?.products || data?.items || []);
  const total = data?.total || data?.count || products.length;
  const totalPages = Math.ceil(total / limit);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setPage(1);
    setSearchParams({ q: inputVal.trim(), ...(sortBy ? { sortBy } : {}), ...(category ? { category } : {}) });
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
    setInputVal(searchParams.get("q") || "");
    setPage(1);
  }, [searchParams.get("q")]);

  const activeFilterChips = [
    ...(category ? [{ label: category, key: "category" }] : []),
    ...(sortBy ? [{ label: SORT_OPTIONS.find(o => o.value === sortBy)?.label || sortBy, key: "sortBy" }] : []),
    ...(priceMax > 0 ? [{ label: `Under ₹${priceMax.toLocaleString("en-IN")}`, key: "priceMax" }] : []),
  ];

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Search Hero */}
      <div style={{ padding: "60px 52px 48px", borderBottom: "1px solid rgba(201,169,110,0.08)", background: "rgba(201,169,110,0.01)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(201,169,110,0.5)", textAlign: "center", marginBottom: 20 }}>
            Search
          </div>
          <form onSubmit={handleSearch} style={{ position: "relative" }}>
            <input
              ref={inputRef}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search the collection…"
              style={{ width: "100%", padding: "20px 60px 20px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,169,110,0.2)", color: "#f0e6d0", fontSize: 16, fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, outline: "none", letterSpacing: "0.02em", transition: "border-color 0.3s ease" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(201,169,110,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(201,169,110,0.2)")}
            />
            <button type="submit"
              style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 56, background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)", borderLeft: "none", color: "#c9a96e", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.25s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,169,110,0.18)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(201,169,110,0.08)")}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="9" r="6" /><path d="M16 16l-3-3" />
              </svg>
            </button>
          </form>
          {q && (
            <div style={{ marginTop: 14, textAlign: "center", fontSize: 13, color: "rgba(240,230,208,0.38)" }}>
              {isLoading ? "Searching…" : `${total.toLocaleString("en-IN")} results for `}
              {!isLoading && <em style={{ fontStyle: "italic", color: "rgba(240,230,208,0.55)" }}>"{q}"</em>}
            </div>
          )}
        </div>
      </div>

      {q.length > 0 && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 52px" }}>
          {/* Controls bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0", borderBottom: "1px solid rgba(201,169,110,0.06)", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {activeFilterChips.map((chip) => (
                <div key={chip.key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", border: "1px solid rgba(201,169,110,0.3)", fontSize: 11, color: "#c9a96e" }}>
                  {chip.label}
                  <button onClick={() => removeFilter(chip.key)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(201,169,110,0.5)", fontSize: 14, lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                style={{ padding: "9px 14px", background: "#252320", border: "1px solid rgba(201,169,110,0.18)", color: "#f0e6d0", fontSize: 12, outline: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Results */}
          <div style={{ paddingTop: 32 }}>
            {isLoading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2 }}>
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 52, fontWeight: 300, color: "rgba(201,169,110,0.3)", marginBottom: 16, lineHeight: 1 }}>
                  No results
                </div>
                <p style={{ fontSize: 13, color: "rgba(240,230,208,0.35)", marginBottom: 8 }}>
                  We couldn't find anything for <em>"{q}"</em>.
                </p>
                <p style={{ fontSize: 12, color: "rgba(240,230,208,0.25)", marginBottom: 32 }}>
                  Try a different keyword or browse the full collection.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button onClick={() => { setInputVal(""); setSearchParams({}); }}
                    style={{ padding: "12px 24px", background: "none", border: "1px solid rgba(201,169,110,0.25)", color: "#c9a96e", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    Clear Search
                  </button>
                  <button onClick={() => navigate("/products")}
                    style={{ padding: "12px 24px", background: "#c9a96e", color: "#0d0c0b", border: "none", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    Browse All
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2, marginBottom: 48 }}>
                  {products.map((p, i) => <ProductCard key={p.id || p._id || i} product={p} />)}
                </div>

                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 60 }}>
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      style={{ padding: "10px 18px", background: "none", border: "1px solid rgba(201,169,110,0.2)", color: "rgba(240,230,208,0.45)", cursor: page === 1 ? "default" : "pointer", fontSize: 11, opacity: page === 1 ? 0.4 : 1 }}>
                      ← Prev
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                      return (
                        <button key={pg} onClick={() => setPage(pg)}
                          style={{ width: 40, height: 40, background: page === pg ? "rgba(201,169,110,0.12)" : "none", border: page === pg ? "1px solid rgba(201,169,110,0.4)" : "1px solid rgba(201,169,110,0.12)", color: page === pg ? "#c9a96e" : "rgba(240,230,208,0.45)", cursor: "pointer", fontSize: 12 }}>
                          {pg}
                        </button>
                      );
                    })}
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      style={{ padding: "10px 18px", background: "none", border: "1px solid rgba(201,169,110,0.2)", color: "rgba(240,230,208,0.45)", cursor: page === totalPages ? "default" : "pointer", fontSize: 11, opacity: page === totalPages ? 0.4 : 1 }}>
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
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "80px 52px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 300, color: "rgba(240,230,208,0.3)", marginBottom: 24 }}>
            What are you looking for?
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {["Watches", "Apparel", "Bags", "Footwear", "Accessories"].map((cat) => (
              <button key={cat} onClick={() => navigate(`/products?category=${cat}`)}
                style={{ padding: "10px 20px", background: "none", border: "1px solid rgba(201,169,110,0.18)", color: "rgba(240,230,208,0.45)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.25s ease", fontFamily: "'DM Sans',sans-serif" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)"; e.currentTarget.style.color = "#c9a96e"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,110,0.18)"; e.currentTarget.style.color = "rgba(240,230,208,0.45)"; }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

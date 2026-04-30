import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi, reviewApi } from "../api/products";
import { wishlistApi } from "../api/user";
import { cartApi } from "../api/cart";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function StarRating({ rating = 0, count = 0, interactive = false, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s}
            style={{ fontSize: interactive ? 20 : 13, color: s <= (interactive ? (hover || rating) : Math.round(rating)) ? "#c9a96e" : "rgba(201,169,110,0.2)", cursor: interactive ? "pointer" : "default", transition: "color 0.15s" }}
            onMouseEnter={() => interactive && setHover(s)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onRate?.(s)}>
            ★
          </span>
        ))}
      </div>
      {count > 0 && <span style={{ fontSize: 12, color: "rgba(240,230,208,0.38)" }}>({count} reviews)</span>}
    </div>
  );
}

function Toast({ msg, show }) {
  return (
    <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 9000, background: "#1a1916", border: "1px solid rgba(201,169,110,0.18)", padding: "16px 24px", display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#f0e6d0", transform: show ? "translateY(0)" : "translateY(80px)", opacity: show ? 1 : 0, transition: "all 0.5s cubic-bezier(0.23,1,0.32,1)", minWidth: 240 }}>
      <div style={{ width: 6, height: 6, background: "#c9a96e", borderRadius: "50%", flexShrink: 0 }} />
      {msg}
    </div>
  );
}

function RelatedCard({ product }) {
  const price = product.offerPrice || product.price || 0;
  const img = product.image?.[0] || product.images?.[0];
  return (
    <Link to={`/product/${product.id || product._id}`} style={{ textDecoration: "none" }}>
      <div style={{ border: "1px solid rgba(201,169,110,0.12)", transition: "border-color 0.3s ease", cursor: "pointer" }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.35)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.12)")}>
        <div style={{ aspectRatio: "1", background: "#0d0c0b", overflow: "hidden" }}>
          {img ? <img src={img} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: "rgba(201,169,110,0.03)" }} />}
        </div>
        <div style={{ padding: "12px 14px" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 300, color: "#f0e6d0", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</div>
          <div style={{ fontSize: 13, color: "#c9a96e" }}>{fmt(price)}</div>
        </div>
      </div>
    </Link>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [reviewForm, setReviewForm] = useState({ show: false, rating: 0, comment: "" });
  const [addingCart, setAddingCart] = useState(false);

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getById(id).then((r) => r.data.data || r.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["product-reviews", id],
    queryFn: () => fetch(`/api/reviews/product/${id}`).then((r) => r.json()).then((r) => r.data || []).catch(() => []),
    staleTime: 2 * 60 * 1000,
  });

  const { data: similar = [] } = useQuery({
    queryKey: ["similar", id],
    queryFn: () => productApi.similar(id).then((r) => r.data.data || []),
    staleTime: 10 * 60 * 1000,
    enabled: !!product,
  });

  const { data: wishlistStatus } = useQuery({
    queryKey: ["wishlist-check", id],
    queryFn: () => wishlistApi.check(id).then((r) => r.data.data?.isWishlisted ?? false).catch(() => false),
  });

  const wishlistMutation = useMutation({
    mutationFn: (add) => add ? wishlistApi.add(id) : wishlistApi.remove(id),
    onSuccess: (_, add) => {
      qc.invalidateQueries(["wishlist-check", id]);
      showToast(add ? "Added to wishlist" : "Removed from wishlist");
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ rating, comment }) => reviewApi.submit(id, { rating, comment }),
    onSuccess: () => {
      qc.invalidateQueries(["product-reviews", id]);
      setReviewForm({ show: false, rating: 0, comment: "" });
      showToast("Review submitted — thank you!");
    },
    onError: (err) => {
      showToast(err?.response?.data?.message || "Could not submit review");
    },
  });

  const handleAddToCart = async () => {
    if (!selectedSize) {
      showToast("Please select a size");
      return;
    }
    setAddingCart(true);
    try {
      const productId = product.id || product._id;
      const priceAtAdd = product.offerPrice || product.price || 0;
      const image = (product.image || product.images || [])[0] || "";
      await cartApi.addItem(productId, quantity, selectedSize, priceAtAdd, product.name, image);
      showToast("Added to cart");
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not add to cart");
    }
    setAddingCart(false);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", paddingTop: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 300, color: "rgba(201,169,110,0.4)" }}>Loading…</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: "100vh", paddingTop: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 42, fontWeight: 300, color: "#c9a96e", marginBottom: 16 }}>Product not found</div>
          <button onClick={() => navigate("/products")} style={{ padding: "12px 32px", background: "#c9a96e", color: "#0d0c0b", border: "none", cursor: "pointer", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif" }}>
            Browse Collection
          </button>
        </div>
      </div>
    );
  }

  const images = product.image || product.images || [];
  const price = product.offerPrice || product.price || 0;
  const original = product.originalPrice || product.comparePrice;
  const discount = original && original > price ? Math.round(((original - price) / original) * 100) : null;
  const sizes = product.sizes?.length ? product.sizes : SIZES;
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : product.rating || 0;

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80 }}>
      <Toast msg={toast.msg} show={toast.show} />

      {/* Breadcrumb */}
      <div style={{ padding: "24px 52px", borderBottom: "1px solid rgba(201,169,110,0.06)", display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "rgba(240,230,208,0.38)", letterSpacing: "0.08em" }}>
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
        <span>/</span>
        <Link to="/products" style={{ color: "inherit", textDecoration: "none" }}>Products</Link>
        {product.category && <><span>/</span><Link to={`/products?category=${product.category}`} style={{ color: "inherit", textDecoration: "none" }}>{product.category}</Link></>}
        <span>/</span>
        <span style={{ color: "rgba(240,230,208,0.6)" }}>{product.name}</span>
      </div>

      {/* Main content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, maxWidth: 1400, margin: "0 auto", padding: "0 52px" }}>
        {/* Left — Image Gallery */}
        <div style={{ paddingTop: 48, paddingRight: 52, paddingBottom: 48, borderRight: "1px solid rgba(201,169,110,0.06)" }}>
          {/* Main image */}
          <div style={{ position: "relative", background: "#0d0c0b", aspectRatio: "3/4", overflow: "hidden", marginBottom: 12 }}>
            {images.length > 0 ? (
              <img src={images[selectedImg]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="64" height="64" viewBox="0 0 60 60" fill="none">
                  <rect x="10" y="10" width="40" height="40" stroke="rgba(201,169,110,0.3)" strokeWidth="0.8" />
                  <path d="M20 30h20M30 20v20" stroke="rgba(201,169,110,0.2)" strokeWidth="0.8" />
                </svg>
              </div>
            )}
            {discount && (
              <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(201,169,110,0.9)", color: "#0d0c0b", fontSize: 11, letterSpacing: "0.1em", padding: "4px 10px", fontWeight: 500 }}>
                -{discount}%
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8 }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImg(i)}
                  style={{ width: 72, height: 72, border: i === selectedImg ? "1px solid #c9a96e" : "1px solid rgba(201,169,110,0.12)", overflow: "hidden", cursor: "pointer", background: "none", flexShrink: 0, padding: 0, transition: "border-color 0.2s ease" }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — Product Info */}
        <div style={{ paddingTop: 48, paddingLeft: 52, paddingBottom: 48 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(201,169,110,0.5)", marginBottom: 12 }}>
            {product.category}
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,3vw,42px)", fontWeight: 300, color: "#f0e6d0", lineHeight: 1.15, marginBottom: 16 }}>
            {product.name}
          </h1>

          <div style={{ marginBottom: 20 }}>
            <StarRating rating={avgRating} count={reviews.length} />
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid rgba(201,169,110,0.08)" }}>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 300, color: "#c9a96e" }}>{fmt(price)}</span>
            {original && original > price && (
              <span style={{ fontSize: 16, color: "rgba(240,230,208,0.35)", textDecoration: "line-through" }}>{fmt(original)}</span>
            )}
            {discount && (
              <span style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(138,173,135,0.8)", background: "rgba(74,92,71,0.15)", border: "1px solid rgba(74,92,71,0.35)", padding: "3px 10px" }}>
                Save {discount}%
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p style={{ fontSize: 13, fontWeight: 300, color: "rgba(240,230,208,0.55)", lineHeight: 1.8, marginBottom: 28 }}>
              {product.description}
            </p>
          )}

          {/* Size Selector */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(240,230,208,0.38)" }}>Size</div>
              {selectedSize && <div style={{ fontSize: 11, color: "#c9a96e", letterSpacing: "0.1em" }}>{selectedSize}</div>}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {sizes.map((size) => {
                const sizeStr = typeof size === "object" ? size.size : size;
                const inStock = typeof size === "object" ? (size.stock ?? 1) > 0 : true;
                return (
                  <button key={sizeStr} onClick={() => inStock && setSelectedSize(sizeStr)} disabled={!inStock}
                    style={{ width: 44, height: 44, border: selectedSize === sizeStr ? "1px solid #c9a96e" : "1px solid rgba(201,169,110,0.18)", background: selectedSize === sizeStr ? "rgba(201,169,110,0.1)" : "none", color: !inStock ? "rgba(240,230,208,0.18)" : selectedSize === sizeStr ? "#c9a96e" : "rgba(240,230,208,0.55)", fontSize: 11, letterSpacing: "0.08em", cursor: inStock ? "pointer" : "not-allowed", textDecoration: !inStock ? "line-through" : "none", transition: "all 0.2s ease", fontFamily: "'DM Sans',sans-serif", position: "relative" }}>
                    {sizeStr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(240,230,208,0.38)", marginBottom: 12 }}>Quantity</div>
            <div style={{ display: "flex", alignItems: "center", gap: 0, width: "fit-content", border: "1px solid rgba(201,169,110,0.18)" }}>
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{ width: 40, height: 40, background: "none", border: "none", color: "#c9a96e", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <span style={{ width: 48, textAlign: "center", fontSize: 14, color: "#f0e6d0" }}>{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                style={{ width: 40, height: 40, background: "none", border: "none", color: "#c9a96e", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
            <button onClick={handleAddToCart} disabled={addingCart}
              style={{ flex: 1, padding: "16px 24px", background: "#c9a96e", color: "#0d0c0b", border: "none", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500, cursor: "pointer", transition: "background 0.3s ease", fontFamily: "'DM Sans',sans-serif", opacity: addingCart ? 0.7 : 1 }}>
              {addingCart ? "Adding…" : "Add to Cart"}
            </button>
            <button onClick={() => wishlistMutation.mutate(!wishlistStatus)}
              style={{ width: 52, height: 52, border: "1px solid rgba(201,169,110,0.25)", background: wishlistStatus ? "rgba(201,169,110,0.1)" : "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s ease", flexShrink: 0 }}>
              <span style={{ fontSize: 20, color: wishlistStatus ? "#c9a96e" : "rgba(201,169,110,0.4)", lineHeight: 1 }}>{wishlistStatus ? "♥" : "♡"}</span>
            </button>
          </div>

          {/* Product meta */}
          {product.sku && (
            <div style={{ fontSize: 11, color: "rgba(240,230,208,0.3)", letterSpacing: "0.08em" }}>
              SKU: {product.sku}
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "64px 52px", borderTop: "1px solid rgba(201,169,110,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9a96e", display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ width: 24, height: 1, background: "#c9a96e", display: "inline-block" }} /> Reviews
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 300, color: "#f0e6d0" }}>
              Customer <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Voices</em>
            </div>
          </div>
          {reviews.length > 0 && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 52, fontWeight: 300, color: "#c9a96e", lineHeight: 1 }}>
                {avgRating.toFixed(1)}
              </div>
              <StarRating rating={avgRating} />
              <div style={{ fontSize: 11, color: "rgba(240,230,208,0.35)", marginTop: 4 }}>{reviews.length} reviews</div>
            </div>
          )}
        </div>

        {/* Write review toggle */}
        <div style={{ marginBottom: 40 }}>
          <button onClick={() => setReviewForm((f) => ({ ...f, show: !f.show }))}
            style={{ padding: "12px 28px", background: "none", border: "1px solid rgba(201,169,110,0.25)", color: "#c9a96e", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.25s ease" }}>
            {reviewForm.show ? "Cancel" : "Write a Review"}
          </button>

          {reviewForm.show && (
            <div style={{ marginTop: 24, padding: 28, border: "1px solid rgba(201,169,110,0.15)", background: "rgba(26,25,22,0.8)" }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(240,230,208,0.38)", marginBottom: 10 }}>Your Rating</div>
                <StarRating rating={reviewForm.rating} interactive onRate={(r) => setReviewForm((f) => ({ ...f, rating: r }))} />
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(240,230,208,0.38)", marginBottom: 10 }}>Your Review</div>
                <textarea value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))} rows={4}
                  placeholder="Share your experience…"
                  style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,169,110,0.18)", color: "#f0e6d0", fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: "none", resize: "vertical" }} />
              </div>
              <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                <button
                  disabled={reviewMutation.isPending}
                  style={{ padding: "12px 28px", background: "#c9a96e", color: "#0d0c0b", border: "none", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: reviewMutation.isPending ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", opacity: reviewMutation.isPending ? 0.7 : 1 }}
                  onClick={() => {
                    if (!reviewForm.rating) { showToast("Please select a rating"); return; }
                    if (!reviewForm.comment.trim()) { showToast("Please write a review"); return; }
                    reviewMutation.mutate({ rating: reviewForm.rating, comment: reviewForm.comment.trim() });
                  }}>
                  {reviewMutation.isPending ? "Submitting…" : "Submit Review"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Review list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {reviews.length === 0 ? (
            <div style={{ padding: "40px 0", color: "rgba(240,230,208,0.35)", fontSize: 13, textAlign: "center" }}>
              No reviews yet. Be the first to share your thoughts.
            </div>
          ) : (
            reviews.map((r, i) => (
              <div key={r.id || i} style={{ padding: "24px 0", borderBottom: "1px solid rgba(201,169,110,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#c9a96e", fontWeight: 500 }}>
                      {(r.user?.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: "#f0e6d0" }}>{r.user?.name || "Anonymous"}</div>
                      <div style={{ fontSize: 10, color: "rgba(240,230,208,0.35)", letterSpacing: "0.06em" }}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : ""}
                      </div>
                    </div>
                  </div>
                  <StarRating rating={r.rating} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 300, color: "rgba(240,230,208,0.55)", lineHeight: 1.7 }}>{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Related Products */}
      {similar.length > 0 && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 52px 80px", borderTop: "1px solid rgba(201,169,110,0.08)" }}>
          <div style={{ paddingTop: 64, marginBottom: 40 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9a96e", display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ width: 24, height: 1, background: "#c9a96e", display: "inline-block" }} /> You May Also Like
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 300, color: "#f0e6d0" }}>
              Similar <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Pieces</em>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2 }}>
            {similar.slice(0, 6).map((p, i) => <RelatedCard key={p.id || p._id || i} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}

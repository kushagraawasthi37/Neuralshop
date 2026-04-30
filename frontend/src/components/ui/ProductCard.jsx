import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cartApi } from "../../api/cart";

function formatPrice(price) {
  return "₹" + Number(price).toLocaleString("en-IN");
}

function Stars({ rating }) {
  const full = Math.floor(rating || 0);
  return (
    <span style={{ color: "#c9a96e", fontSize: 11 }}>
      {"★".repeat(full)}
      {"☆".repeat(5 - full)}
    </span>
  );
}

function SizePicker({ sizes, onSelect, onClose }) {
  const available = (sizes || []).filter((s) => s.stock > 0);
  if (!available.length) return null;
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        bottom: "calc(100% + 6px)",
        left: 0,
        right: 0,
        background: "#1a1916",
        border: "1px solid rgba(201,169,110,0.4)",
        padding: "10px 12px",
        zIndex: 200,
      }}
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
        }}
      >
        Cancel
      </button>
    </div>
  );
}

export default function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const navigate = useNavigate();

  const img = product?.images?.[0] || product?.image1 || null;
  const availableSizes = (product?.sizes || []).filter((s) => s.stock > 0);

  const doAddToCart = async (size) => {
    setAdding(true);
    setShowSizePicker(false);
    try {
      await cartApi.addItem(
        product._id || product.id,
        1,
        size,
        product.offerPrice || product.price,
        product.name,
        img || "",
      );
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (_) {}
    setAdding(false);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!availableSizes.length) {
      navigate(`/product/${product._id || product.id}`);
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
      onClick={() => navigate(`/product/${product._id || product.id}`)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false);
        setShowSizePicker(false);
      }}
      style={{
        flex: "0 0 300px",
        position: "relative",
        background: "#1a1916",
        border: `1px solid ${hovering ? "rgba(201,169,110,0.25)" : "rgba(201,169,110,0.08)"}`,
        cursor: "pointer",
        overflow: "visible",
        transform: hovering ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovering ? "0 30px 60px rgba(0,0,0,0.4)" : "none",
        transition: "all 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        scrollSnapAlign: "start",
      }}
    >
      {/* Image area */}
      <div
        style={{
          width: "100%",
          height: 320,
          background: "linear-gradient(135deg, #1a1916 0%, #252320 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: hovering ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.6s ease",
          }}
        >
          {img ? (
            <img
              src={img}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <svg
              viewBox="0 0 100 100"
              fill="none"
              stroke="#c9a96e"
              strokeWidth="0.8"
              width="100"
              height="100"
              style={{
                opacity: hovering ? 0.35 : 0.2,
                transition: "opacity 0.3s",
              }}
            >
              <rect x="20" y="20" width="60" height="60" rx="2" />
              <path d="M35 40 L50 30 L65 40 L65 60 L35 60 Z" />
              <circle cx="50" cy="50" r="8" fill="rgba(201,169,110,0.1)" />
            </svg>
          )}
        </div>

        {/* Hover overlay with Add to Cart */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(13,12,11,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: hovering ? 1 : 0,
            transition: "opacity 0.4s",
            pointerEvents: hovering ? "auto" : "none",
          }}
        >
          <button
            onClick={handleAddToCart}
            disabled={adding}
            style={{
              padding: "12px 28px",
              background: added ? "rgba(201,169,110,0.8)" : "#c9a96e",
              color: "#0d0c0b",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              transform: hovering ? "translateY(0)" : "translateY(10px)",
              transition: "transform 0.3s ease",
            }}
          >
            {adding ? "Adding…" : added ? "Added ✓" : "Add to Cart"}
          </button>
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setWishlisted((w) => !w);
          }}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            background: wishlisted
              ? "rgba(201,169,110,0.2)"
              : "rgba(13,12,11,0.6)",
            border: `1px solid ${wishlisted ? "#c9a96e" : "rgba(201,169,110,0.15)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.3s",
            zIndex: 10,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={wishlisted ? "#c9a96e" : "none"}
            stroke={wishlisted ? "#c9a96e" : "rgba(240,230,208,0.6)"}
            strokeWidth="1.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>

        {product.bestseller && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              background: "#c9a96e",
              color: "#0d0c0b",
              fontSize: 9,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "4px 8px",
              fontWeight: 500,
            }}
          >
            Bestseller
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: 24, position: "relative" }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(240,230,208,0.35)",
            marginBottom: 8,
          }}
        >
          {product.category}
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 20,
            fontWeight: 400,
            color: "#f0e6d0",
            marginBottom: 4,
            lineHeight: 1.2,
          }}
        >
          {product.name}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(240,230,208,0.4)",
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          {product.description?.substring(0, 80)}
          {product.description?.length > 80 ? "…" : ""}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22,
              color: "#c9a96e",
            }}
          >
            {formatPrice(product.offerPrice || product.price)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Stars rating={product.rating || product.averageRating} />
            <span style={{ fontSize: 11, color: "rgba(240,230,208,0.3)" }}>
              ({product.reviewCount || product.numReviews || 0})
            </span>
          </div>
        </div>

        {/* Size picker anchored to card info area */}
        {showSizePicker && (
          <SizePicker
            sizes={product.sizes}
            onSelect={doAddToCart}
            onClose={() => setShowSizePicker(false)}
          />
        )}
      </div>
    </div>
  );
}

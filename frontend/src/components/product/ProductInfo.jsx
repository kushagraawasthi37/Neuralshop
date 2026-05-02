import { useState } from "react";
import StarRating from "../ui/StarRating";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function ProductInfo({
  product,
  avgRating,
  reviewCount,
  wishlistStatus,
  onAddToCart,
  onToggleWishlist,
  addingCart,
}) {
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const price = product.offerPrice || product.price || 0;
  const original = product.originalPrice || product.comparePrice;
  const discount =
    original && original > price
      ? Math.round(((original - price) / original) * 100)
      : null;
  const sizes = product.sizes?.length
    ? product.sizes
    : ["XS", "S", "M", "L", "XL", "XXL"];

  const handleAdd = () => onAddToCart({ selectedSize, quantity });

  return (
    <div className="product-info">
      <div className="product-info__category">{product.category}</div>

      <h1 className="product-info__name">{product.name}</h1>

      <div style={{ marginBottom: 20 }}>
        <StarRating rating={avgRating} count={reviewCount} />
      </div>

      {/* Price */}
      <div className="product-info__price-row">
        <span className="product-info__price">{fmt(price)}</span>
        {original && original > price && (
          <span className="product-info__price-original">{fmt(original)}</span>
        )}
        {discount && (
          <span className="product-info__price-badge">Save {discount}%</span>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <p className="product-info__desc">{product.description}</p>
      )}

      {/* Sizes */}
      <div className="product-info__section">
        <div className="product-info__section-header">
          <span className="product-info__label">Size</span>
          {selectedSize && (
            <span className="product-info__selected">{selectedSize}</span>
          )}
        </div>
        <div className="product-info__sizes">
          {sizes.map((size) => {
            const sizeStr = typeof size === "object" ? size.size : size;
            const inStock =
              typeof size === "object" ? (size.stock ?? 1) > 0 : true;
            return (
              <button
                key={sizeStr}
                onClick={() => inStock && setSelectedSize(sizeStr)}
                disabled={!inStock}
                className={`product-info__size-btn${selectedSize === sizeStr ? " active" : ""}${!inStock ? " out" : ""}`}
              >
                {sizeStr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity */}
      <div className="product-info__section">
        <div className="product-info__label" style={{ marginBottom: 12 }}>Quantity</div>
        <div className="product-info__qty">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="product-info__qty-btn"
          >
            −
          </button>
          <span className="product-info__qty-val">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            className="product-info__qty-btn"
          >
            +
          </button>
        </div>
      </div>

      {/* CTAs */}
      <div className="product-info__ctas">
        <button
          onClick={handleAdd}
          disabled={addingCart}
          className="product-info__add-btn"
        >
          {addingCart ? "Adding…" : "Add to Cart"}
        </button>
        <button
          onClick={onToggleWishlist}
          className={`product-info__wish-btn${wishlistStatus ? " active" : ""}`}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>
            {wishlistStatus ? "♥" : "♡"}
          </span>
        </button>
      </div>

      {product.sku && (
        <div className="product-info__sku">SKU: {product.sku}</div>
      )}
    </div>
  );
}

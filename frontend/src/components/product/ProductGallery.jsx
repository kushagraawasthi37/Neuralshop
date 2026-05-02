import { useState } from "react";

export default function ProductGallery({ images = [], name = "", discount }) {
  const [selectedImg, setSelectedImg] = useState(0);

  return (
    <div className="product-gallery">
      <div className="product-gallery__main">
        {images.length > 0 ? (
          <img
            src={images[selectedImg]}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="product-gallery__placeholder">
            <svg width="64" height="64" viewBox="0 0 60 60" fill="none">
              <rect x="10" y="10" width="40" height="40" stroke="rgba(201,169,110,0.3)" strokeWidth="0.8" />
              <path d="M20 30h20M30 20v20" stroke="rgba(201,169,110,0.2)" strokeWidth="0.8" />
            </svg>
          </div>
        )}
        {discount && (
          <div className="product-gallery__badge">-{discount}%</div>
        )}
      </div>

      {images.length > 1 && (
        <div className="product-gallery__thumbs">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImg(i)}
              className={`product-gallery__thumb${i === selectedImg ? " product-gallery__thumb--active" : ""}`}
            >
              <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useRef } from "react";

export default function ProductGallery({ images = [], name = "", discount }) {
  const [selectedImg, setSelectedImg] = useState(0);
  const thumbsRef = useRef(null);

  const goTo = (i) => {
    setSelectedImg(i);
    // Scroll selected thumb into view on mobile
    if (thumbsRef.current) {
      const thumb = thumbsRef.current.children[i];
      if (thumb)
        thumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
    }
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    goTo((selectedImg - 1 + images.length) % images.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    goTo((selectedImg + 1) % images.length);
  };

  return (
    <div className="product-gallery">
      {/* Main image */}
      <div className="product-gallery__main">
        {images.length > 0 ? (
          <img
            src={images[selectedImg]}
            alt={`${name} — image ${selectedImg + 1}`}
            className="product-gallery__main-img"
          />
        ) : (
          <div className="product-gallery__placeholder">
            <svg width="64" height="64" viewBox="0 0 60 60" fill="none">
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

        {discount && <div className="product-gallery__badge">-{discount}%</div>}

        {/* Mobile prev/next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="product-gallery__arrow product-gallery__arrow--prev"
              aria-label="Previous image"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="product-gallery__arrow product-gallery__arrow--next"
              aria-label="Next image"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {/* Dot indicators on mobile */}
        {images.length > 1 && (
          <div className="product-gallery__dots">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(i);
                }}
                className={`product-gallery__dot${i === selectedImg ? " product-gallery__dot--active" : ""}`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="product-gallery__thumbs" ref={thumbsRef}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`product-gallery__thumb${i === selectedImg ? " product-gallery__thumb--active" : ""}`}
              aria-label={`View image ${i + 1}`}
            >
              <img src={img} alt="" className="product-gallery__thumb-img" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

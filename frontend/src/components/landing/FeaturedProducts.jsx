import { useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "../../api/products";
import ProductCard from "../ui/ProductCard";
import ProductCardSkeleton from "../ui/ProductCardSkeleton";
import { useReveal } from "../../hooks/useReveal";
import "./styles/FeatureProduct.css";

export default function FeaturedProducts() {
  const scrollRef = useRef(null);
  const headerRef = useReveal();

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", "bestseller"],
    queryFn: () => productApi.list({ bestseller: true, limit: 10 }),
    select: (res) => res.data?.products || [],
  });

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 640, behavior: "smooth" });
  };

  const products = data || [];
  const skeletons = Array.from({ length: 8 });

  return (
    <section id="featured" className="landing-section featured-section">
      <div className="landing-inner">
        {/* Header */}
        <div ref={headerRef} className="featured-header reveal">
          <div>
            <div className="featured-label">
              <div className="featured-label__line" />
              <span className="featured-label__text">Curated Selection</span>
            </div>
            <h2 className="featured-title">
              New <em>Arrivals</em>
            </h2>
          </div>

          <div className="featured-controls">
            {/* Scroll arrows — only visible on mobile/tablet where scroll is active */}
            <button
              className="feat-nav-btn feat-nav-btn--scroll"
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 12H5M12 19l-7-7 7-7"
                  strokeWidth="1.5"
                  stroke="currentColor"
                />
              </svg>
            </button>
            <button
              className="feat-nav-btn feat-nav-btn--scroll"
              onClick={() => scroll(1)}
              aria-label="Scroll right"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  strokeWidth="1.5"
                  stroke="currentColor"
                />
              </svg>
            </button>
            <Link to="/collections?sort=newest" className="featured-link">
              View All
            </Link>
          </div>
        </div>

        {error && (
          <div className="featured-error">
            Unable to load products. Please try again later.
          </div>
        )}

        {/* ── Desktop: Collection Grid ── */}
        <div className="featured-grid">
          {isLoading
            ? skeletons.map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
        </div>

        {/* ── Mobile/Tablet: Horizontal Scroll ── */}
        <div ref={scrollRef} className="featured-scroll">
          {isLoading
            ? skeletons.map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
        </div>

        {/* Desktop footer link */}
        <div className="featured-footer">
          <Link to="/collections?sort=newest" className="featured-footer-link">
            <span>Explore Full Collection</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

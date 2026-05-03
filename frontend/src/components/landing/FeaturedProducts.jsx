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
    queryFn: () => productApi.list({ bestseller: true, limit: 8 }),
    select: (res) => res.data?.products || [],
  });

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 640, behavior: "smooth" });
  };

  return (
    <section id="featured" className="landing-section featured-section">
      <div className="landing-inner">
        <div ref={headerRef} className="featured-header reveal">
          <div>
            <div className="featured-label">
              <div className="featured-label__line" />
              <span className="featured-label__text">Neural Picks</span>
            </div>

            <h2 className="featured-title">
              Objects of <em>distinction</em>
            </h2>
          </div>

          <div className="featured-controls">
            <button className="feat-nav-btn" onClick={() => scroll(-1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="1.5" />
              </svg>
            </button>

            <button className="feat-nav-btn" onClick={() => scroll(1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="1.5" />
              </svg>
            </button>

            <Link to="/collections" className="featured-link">
              View All
            </Link>
          </div>
        </div>

        {error && (
          <div className="featured-error">
            Unable to load products. Please try again later.
          </div>
        )}

        <div ref={scrollRef} className="featured-scroll">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : (data || []).map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
        </div>
      </div>
    </section>
  );
}

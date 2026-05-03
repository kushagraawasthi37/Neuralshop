import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "../../api/products";
import { useReveal } from "../../hooks/useReveal";
import "./styles/Trending.css";

function formatPrice(price) {
  return "₹" + Number(price).toLocaleString("en-IN");
}

export default function TrendingSection() {
  const headerRef = useReveal();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState(null);

  const { data: trending = [], isLoading } = useQuery({
    queryKey: ["trending", 6],
    queryFn: () => productApi.trending({ limit: 6 }),
    select: (res) => res.data?.data || [],
  });

  const featuredProduct =
    featured || (trending.length > 0 ? trending[0] : null);

  const restProducts = trending.length > 1 ? trending.slice(1) : [];

  return (
    <section id="trending" className="landing-section">
      <div className="landing-inner">
        {/* HEADER */}
        <div
          ref={headerRef}
          className="reveal"
          style={{ marginBottom: "clamp(32px,5vw,60px)" }}
        >
          <div className="section-label">
            <span className="section-label__line" />
            Right Now
          </div>

          <h2
            className="font-serif"
            style={{ fontSize: "clamp(28px,4vw,60px)", fontWeight: 300 }}
          >
            What's <em style={{ color: "var(--text-muted)" }}>trending</em>
          </h2>
        </div>

        {/* GRID */}
        <div className="trending-two-col">
          {/* LEFT LIST */}
          <div className="trending-list">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="trending-item">
                    <div
                      className="skeleton"
                      style={{ width: 50, height: 40 }}
                    />
                    <div
                      className="skeleton"
                      style={{ width: 72, height: 72 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        className="skeleton"
                        style={{ width: "60%", height: 18, marginBottom: 6 }}
                      />
                      <div
                        className="skeleton"
                        style={{ width: "40%", height: 11 }}
                      />
                    </div>
                  </div>
                ))
              : restProducts.map((p, i) => (
                  <div
                    key={p._id || p.id}
                    className="trending-item"
                    onClick={() => {
                      setFeatured(p);
                      navigate(`/product/${p._id || p.id}`);
                    }}
                  >
                    {/* NUMBER */}
                    <div className="trending-num">
                      {String(i + 2).padStart(2, "0")}
                    </div>

                    {/* IMAGE */}
                    <div className="trending-thumb">
                      {p.images?.[0] || p.image1 ? (
                        <img
                          src={p.images?.[0] || p.image1}
                          alt={p.name}
                          loading="lazy"
                        />
                      ) : null}
                    </div>

                    {/* INFO */}
                    <div style={{ flex: 1 }}>
                      <div className="trending-title">{p.name}</div>
                      <div className="trending-cat">{p.category}</div>
                    </div>

                    {/* PRICE */}
                    <div className="trending-price">{formatPrice(p.price)}</div>
                  </div>
                ))}
          </div>

          {/* RIGHT FEATURED */}
          <div className="trending-sticky">
            {featuredProduct && (
              <div
                className="trending-featured"
                onClick={() =>
                  navigate(
                    `/product/${featuredProduct._id || featuredProduct.id}`,
                  )
                }
              >
                {/* IMAGE */}
                <div className="trending-feat-img">
                  {featuredProduct.images?.[0] || featuredProduct.image1 ? (
                    <img
                      src={
                        featuredProduct.images?.[0] || featuredProduct.image1
                      }
                      alt={featuredProduct.name}
                    />
                  ) : null}

                  <div className="trending-badge">Trending</div>
                </div>

                {/* INFO */}
                <div className="trending-feat-info">
                  <div className="trending-feat-cat">
                    {featuredProduct.category}
                  </div>

                  <div className="trending-feat-title">
                    {featuredProduct.name}
                  </div>

                  <div className="trending-feat-bottom">
                    <div className="trending-feat-price">
                      {formatPrice(featuredProduct.price)}
                    </div>

                    <button className="btn-gold-flip">
                      <span>View Details →</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "../../api/user";
import { useState } from "react";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

function Toast({ msg, show }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "clamp(16px,4vw,28px)",
        right: "clamp(16px,4vw,28px)",
        left: "clamp(16px,4vw,auto)",
        zIndex: 9999,
        background: "#1a1916",
        border: "1px solid rgba(201,169,110,0.18)",
        padding: "14px 22px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 12,
        color: "#f0e6d0",
        transform: show ? "translateY(0)" : "translateY(70px)",
        opacity: show ? 1 : 0,
        transition: "all 0.5s cubic-bezier(0.23,1,0.32,1)",
        minWidth: "min(240px, calc(100vw - 32px))",
      }}
    >
      <div
        style={{
          width: 5,
          height: 5,
          background: "#c9a96e",
          borderRadius: "50%",
          flexShrink: 0,
        }}
      />
      {msg}
    </div>
  );
}

export default function WishlistPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [toast, setToast] = useState({ show: false, msg: "" });

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistApi.get().then((r) => r.data.data?.items || []),
  });

  const removeMutation = useMutation({
    mutationFn: (productId) => wishlistApi.remove(productId),
    onSuccess: () => {
      qc.invalidateQueries(["wishlist"]);
      showToast("Removed from wishlist");
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => wishlistApi.clear(),
    onSuccess: () => {
      qc.invalidateQueries(["wishlist"]);
      showToast("Wishlist cleared");
    },
  });

  const goToProduct = (productId) => navigate(`/product/${productId}`);

  return (
    <div style={{ minHeight: "100vh", paddingTop: "var(--nav-h, 80px)" }}>
      <style>{`
        .wishlist-card {
          background: #1a1916;
          border: 1px solid rgba(201,169,110,0.18);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
        }
        .wishlist-card:hover {
          border-color: rgba(201,169,110,0.38);
          transform: translateY(-3px);
        }
        .wishlist-card__img {
          position: relative;
          aspect-ratio: 3/4;
          background: #252320;
          overflow: hidden;
          cursor: pointer;
        }
        .wishlist-card__img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.23,1,0.32,1);
        }
        .wishlist-card:hover .wishlist-card__img img {
          transform: scale(1.04);
        }
        .wishlist-card__remove {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 36px;
          height: 36px;
          background: rgba(13,12,11,0.75);
          border: 1px solid rgba(201,169,110,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #c9a96e;
          font-size: 15px;
          backdrop-filter: blur(8px);
          transition: all 0.25s;
        }
        .wishlist-card__remove:hover {
          background: rgba(201,169,110,0.15);
        }
        .wishlist-card__info {
          padding: clamp(14px,3vw,20px) clamp(14px,3vw,20px) clamp(18px,3vw,24px);
        }
        .wishlist-card__brand {
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(240,230,208,0.38);
          margin-bottom: 5px;
        }
        .wishlist-card__name {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(16px,4vw,20px);
          font-weight: 300;
          color: #f0e6d0;
          margin-bottom: 10px;
          line-height: 1.2;
        }
        .wishlist-card__price {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(18px,4vw,22px);
          color: #c9a96e;
        }
        .wishlist-card__original {
          font-size: 12px;
          color: rgba(240,230,208,0.38);
          text-decoration: line-through;
        }
        .wishlist-card__cta {
          width: 100%;
          padding: 12px;
          background: #c9a96e;
          border: none;
          color: #0d0c0b;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          min-height: 44px;
          transition: background 0.25s;
        }
        .wishlist-card__cta:hover {
          background: #b8924f;
        }
        @media (max-width: 639px) {
          .wishlist-card__name { font-size: 14px; }
          .wishlist-card__price { font-size: 17px; }
          .wishlist-clear-btn { font-size: 9px; padding: 9px 14px; }
        }
      `}</style>

      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "0 var(--page-px)",
        }}
      >
        {/* Page header */}
        <div className="page-header">
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#c9a96e",
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div style={{ width: 26, height: 1, background: "#c9a96e" }} />
              My Account
            </div>
            <h1 className="page-header__title">
              Saved{" "}
              <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Pieces</em>
            </h1>
          </div>
          {wishlist.length > 0 && (
            <button
              className="wishlist-clear-btn"
              onClick={() => clearMutation.mutate()}
              style={{
                padding: "10px 20px",
                background: "none",
                border: "1px solid rgba(140,70,70,0.35)",
                color: "rgba(190,110,110,0.75)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                minHeight: 44,
              }}
            >
              Clear Wishlist
            </button>
          )}
        </div>

        {isLoading ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 60 }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                border: "1px solid rgba(201,169,110,0.3)",
                borderTopColor: "#c9a96e",
                borderRadius: "50%",
                animation: "spin 1.2s linear infinite",
              }}
            />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : wishlist.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "clamp(48px,10vw,80px) 0",
              color: "rgba(240,230,208,0.4)",
              paddingBottom: 100,
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(42px,10vw,56px)",
                fontWeight: 300,
                color: "rgba(201,169,110,0.3)",
                marginBottom: 16,
                lineHeight: 1,
              }}
            >
              ♡
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(22px,5vw,28px)",
                marginBottom: 12,
                color: "rgba(240,230,208,0.6)",
              }}
            >
              No saved pieces yet
            </div>
            <div
              style={{
                fontSize: 13,
                marginBottom: 32,
                color: "rgba(240,230,208,0.4)",
              }}
            >
              Save items you love to find them easily later
            </div>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "14px 32px",
                background: "#c9a96e",
                border: "none",
                color: "#0d0c0b",
                cursor: "pointer",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 500,
                minHeight: 44,
              }}
            >
              Explore Collections
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((item) => {
              const product = item.productId || item.product || item;
              const productId = (product._id || product.id)?.toString();
              return (
                <div key={productId || Math.random()} className="wishlist-card">
                  <div
                    className="wishlist-card__img"
                    onClick={() => navigate(`/product/${productId}`)}
                  >
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width="52"
                          height="52"
                          viewBox="0 0 60 60"
                          fill="none"
                        >
                          <rect
                            x="15"
                            y="8"
                            width="30"
                            height="44"
                            stroke="rgba(201,169,110,0.4)"
                            strokeWidth="0.8"
                          />
                        </svg>
                      </div>
                    )}
                    <button
                      className="wishlist-card__remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMutation.mutate(productId);
                      }}
                    >
                      ♥
                    </button>
                  </div>
                  <div className="wishlist-card__info">
                    <div className="wishlist-card__brand">
                      {product.brand || product.category || "Neural Shop"}
                    </div>
                    <div className="wishlist-card__name">{product.name}</div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 14,
                        flexWrap: "wrap",
                        gap: 6,
                      }}
                    >
                      <div className="wishlist-card__price">
                        {fmt(product.price || product.offerPrice)}
                      </div>
                      {product.originalPrice &&
                        product.originalPrice >
                          (product.price || product.offerPrice) && (
                          <div className="wishlist-card__original">
                            {fmt(product.originalPrice)}
                          </div>
                        )}
                    </div>
                    <button
                      className="wishlist-card__cta"
                      onClick={() => goToProduct(productId)}
                    >
                      View &amp; Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}

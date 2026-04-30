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
        bottom: 28,
        right: 28,
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
        minWidth: 240,
      }}
    >
      <div
        style={{
          width: 5,
          height: 5,
          background: "#c9a96e",
          borderRadius: "50%",
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

  // Cart requires size selection — navigate to product page instead
  const goToProduct = (productId) => navigate(`/product/${productId}`);

  return (
    <div style={{ minHeight: "100vh", paddingTop: 100 }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 52px" }}>
        <div
          style={{
            padding: "52px 0 44px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(201,169,110,0.18)",
            marginBottom: 52,
          }}
        >
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
            <h1
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(34px,4.5vw,58px)",
                fontWeight: 300,
                color: "#f0e6d0",
                lineHeight: 1.04,
              }}
            >
              Saved{" "}
              <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Pieces</em>
            </h1>
          </div>
          {wishlist.length > 0 && (
            <button
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
              padding: "80px 0",
              color: "rgba(240,230,208,0.4)",
              paddingBottom: 100,
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 48,
                fontWeight: 300,
                color: "rgba(201,169,110,0.3)",
                marginBottom: 16,
              }}
            >
              ♡
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 28,
                marginBottom: 12,
              }}
            >
              No saved pieces yet
            </div>
            <div style={{ fontSize: 13, marginBottom: 32 }}>
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
              }}
            >
              Explore Collections
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 2,
              paddingBottom: 100,
            }}
          >
            {wishlist.map((item) => {
              // populated field is "productId" on the wishlist item
              const product = item.productId || item.product || item;
              const productId = (product._id || product.id)?.toString();
              return (
                <div
                  key={productId || Math.random()}
                  style={{
                    background: "#1a1916",
                    border: "1px solid rgba(201,169,110,0.18)",
                    position: "relative",
                    transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "3/4",
                      background: "#252320",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/product/${productId}`)}
                  >
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition:
                            "transform 0.6s cubic-bezier(0.23,1,0.32,1)",
                        }}
                      />
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
                          width="60"
                          height="60"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMutation.mutate(productId);
                      }}
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 32,
                        height: 32,
                        background: "rgba(13,12,11,0.7)",
                        border: "1px solid rgba(201,169,110,0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#c9a96e",
                        fontSize: 14,
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      ♥
                    </button>
                  </div>
                  <div style={{ padding: "20px 20px 24px" }}>
                    <div
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "rgba(240,230,208,0.38)",
                        marginBottom: 6,
                      }}
                    >
                      {product.brand || product.category || "Neural Shop"}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 20,
                        fontWeight: 300,
                        color: "#f0e6d0",
                        marginBottom: 12,
                        lineHeight: 1.2,
                      }}
                    >
                      {product.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Cormorant Garamond',serif",
                          fontSize: 22,
                          color: "#c9a96e",
                        }}
                      >
                        {fmt(product.price || product.offerPrice)}
                      </div>
                      {product.originalPrice &&
                        product.originalPrice >
                          (product.price || product.offerPrice) && (
                          <div
                            style={{
                              fontSize: 13,
                              color: "rgba(240,230,208,0.38)",
                              textDecoration: "line-through",
                            }}
                          >
                            {fmt(product.originalPrice)}
                          </div>
                        )}
                    </div>
                    <button
                      onClick={() => goToProduct(productId)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "#c9a96e",
                        border: "none",
                        color: "#0d0c0b",
                        fontSize: 10,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        fontFamily: "'DM Sans',sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      View & Add to Cart
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

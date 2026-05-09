import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "../../api/products";
import { getSessionId } from "../../hooks/useBehaviorTracker";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function PersonalizedSection() {
  const navigate = useNavigate();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["personalized-home"],
    queryFn: () =>
      productApi
        .personalized(getSessionId())
        .then((r) => (r.data.data || []).slice(0, 6)),
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  if (isLoading || products.length < 2) return null;

  return (
    <section
      style={{
        padding: "clamp(56px,7vw,96px) var(--page-px)",
        borderTop: "1px solid rgba(201,169,110,0.07)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              width: 40,
              height: 1,
              background: "linear-gradient(to right, transparent, #c9a96e)",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: 9,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "#c9a96e",
            }}
          >
            Picked For You · AI
          </span>
        </div>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "clamp(30px,4vw,48px)",
            fontWeight: 300,
            color: "#f0e6d0",
            lineHeight: 1.1,
          }}
        >
          Your Personal{" "}
          <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Curation</em>
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "rgba(240,230,208,0.38)",
            marginTop: 12,
            maxWidth: 420,
            lineHeight: 1.7,
          }}
        >
          Pieces selected based on your unique taste and browsing journey.
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 2,
        }}
      >
        {products.map((p) => {
          const pid = p._id || p.id;
          const img = p.images?.[0];
          return (
            <div
              key={pid}
              onClick={() => navigate(`/product/${pid}`)}
              style={{
                background: "#1a1916",
                border: "1px solid rgba(201,169,110,0.14)",
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,169,110,0.14)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                style={{
                  aspectRatio: "3/4",
                  background: "#0d0c0b",
                  overflow: "hidden",
                }}
              >
                {img ? (
                  <img
                    src={img}
                    alt={p.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.6s ease",
                    }}
                    onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => (e.target.style.transform = "none")}
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
                    <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
                      <rect x="10" y="10" width="40" height="40" stroke="rgba(201,169,110,0.2)" strokeWidth="0.8" />
                    </svg>
                  </div>
                )}
              </div>
              <div style={{ padding: "14px 16px 18px" }}>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(201,169,110,0.45)",
                    marginBottom: 5,
                  }}
                >
                  {p.category}
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 15,
                    fontWeight: 300,
                    color: "#f0e6d0",
                    marginBottom: 8,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 18,
                    fontWeight: 300,
                    color: "#c9a96e",
                  }}
                >
                  {fmt(p.price)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 32, textAlign: "center" }}>
        <button
          onClick={() => navigate("/collections")}
          style={{
            padding: "12px 36px",
            background: "none",
            border: "1px solid rgba(201,169,110,0.3)",
            color: "#c9a96e",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif",
            transition: "all 0.3s ease",
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
          View Full Collection
        </button>
      </div>
    </section>
  );
}

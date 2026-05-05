import { useNavigate } from "react-router-dom";
import { useReveal } from "../../hooks/useReveal";
import watchImg from "../../../assets/watch.webp";
import perfumeImg from "../../../assets/perfumes.webp";
import jewelleryImg from "../../../assets/jewellery.webp";
import clothesImg from "../../../assets/clothes.webp";
import techImg from "../../../assets/electronics.webp";
import "./styles/CategoryBento.css";

const categories = [
  {
    tag: "Flagship",
    name: "Rare\nTimepieces",
    count: "240 pieces",
    color: "#c9a96e",
    query: "watches",
    large: true,
    image: watchImg,
  },
  {
    tag: "Curated",
    name: "Fragrance\nAtelier",
    count: "88 pieces",
    color: "#4a5c47",
    query: "fragrance",
    image: perfumeImg,
  },
  {
    tag: "New",
    name: "Tech\nArtifacts",
    count: "156 pieces",
    color: "#8b6340",
    query: "tech",
    image: techImg,
  },
  {
    tag: "Limited",
    name: "Clothes",
    count: "112 pieces",
    color: "#2a4a47",
    query: "leather",
    image: clothesImg,
  },
  {
    tag: "Rare",
    name: "Fine\nJewellery",
    count: "64 pieces",
    color: "#a07840",
    query: "jewellery",
    image: jewelleryImg,
  },
];

function CatCard({ cat, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`cat-card ${cat.large ? "cat-bento-large" : "cat-bento-small"}`}
    >
      <div className="cat-card__bg">
        {cat.image && <img src={cat.image} loading="lazy" alt={cat.name} />}
      </div>
      <div className="cat-card__overlay" />
      <div className="cat-card__hover" />
      <div className="cat-card__content">
        <div className="cat-card__tag">{cat.tag}</div>
        <div
          className={`cat-card__title ${cat.large ? "cat-card__title--large" : "cat-card__title--small"}`}
        >
          {cat.name}
        </div>
        <div className="cat-card__count">{cat.count}</div>
        <div className="cat-card__arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M12 5l7 7-7 7"
              strokeWidth="1.5"
              stroke="currentColor"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function CategoryBento() {
  const sectionRef = useReveal();
  const navigate = useNavigate();

  return (
    <section
      id="categories"
      className="landing-section"
      style={{
        position: "relative",
        background: "linear-gradient(to bottom, #0d0c0b 0%, #111009 100%)",
        overflow: "hidden",
      }}
    >
      <div className="landing-inner">
        {/* Header */}
        <div
          className="reveal"
          ref={sectionRef}
          style={{ marginBottom: "clamp(32px, 6vw, 80px)" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div style={{ width: 30, height: 1, background: "#c9a96e" }} />
            <span
              style={{
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#c9a96e",
              }}
            >
              Discover by World
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(28px, 4vw, 60px)",
              fontWeight: 300,
              color: "#f0e6d0",
              lineHeight: 1.1,
            }}
          >
            Enter a{" "}
            <em style={{ fontStyle: "italic", color: "rgba(240,230,208,0.4)" }}>
              universe
            </em>
            <br />
            crafted for you
          </h2>
        </div>

        {/* Grid */}
        <div className="cat-bento-grid">
          {categories.map((cat) => (
            <CatCard
              key={cat.query}
              cat={cat}
              onClick={() => navigate(`/collections?category=${cat.query}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

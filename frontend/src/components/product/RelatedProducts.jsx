import { Link } from "react-router-dom";
import SectionHeading from "../ui/SectionHeading";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

function RelatedCard({ product }) {
  const price = product.offerPrice || product.price || 0;
  const img = product.image?.[0] || product.images?.[0];
  return (
    <Link
      to={`/product/${product.id || product._id}`}
      className="related-card"
      style={{ textDecoration: "none" }}
    >
      <div className="related-card__img">
        {img ? (
          <img src={img} alt={product.name} className="related-card__img-el" />
        ) : (
          <div className="related-card__img-placeholder" />
        )}
      </div>
      <div className="related-card__info">
        <div className="related-card__name">{product.name}</div>
        <div className="related-card__price">{fmt(price)}</div>
      </div>
    </Link>
  );
}

export default function RelatedProducts({ label, title, accent, items = [] }) {
  if (!items.length) return null;

  return (
    <div className="related-products">
      <SectionHeading label={label} title={title} accent={accent} />
      <div className="related-products__grid">
        {items.slice(0, 6).map((p, i) => (
          <RelatedCard key={p.id || p._id || i} product={p} />
        ))}
      </div>
    </div>
  );
}

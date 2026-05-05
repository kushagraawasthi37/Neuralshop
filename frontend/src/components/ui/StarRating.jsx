import { useState } from "react";

export default function StarRating({
  rating = 0,
  count = 0,
  interactive = false,
  onRate,
  size = 13,
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating">
      <div className="star-rating__stars">
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            className={`star-rating__star${interactive ? " star-rating__star--interactive" : ""}`}
            style={{
              fontSize: interactive ? "clamp(22px, 5vw, 26px)" : size,
              color:
                s <= (interactive ? hover || rating : Math.round(rating))
                  ? "#c9a96e"
                  : "rgba(201,169,110,0.2)",
            }}
            onMouseEnter={() => interactive && setHover(s)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onRate?.(s)}
            role={interactive ? "button" : undefined}
            aria-label={
              interactive ? `Rate ${s} star${s !== 1 ? "s" : ""}` : undefined
            }
          >
            ★
          </span>
        ))}
      </div>
      {count > 0 && <span className="star-rating__count">({count})</span>}
    </div>
  );
}

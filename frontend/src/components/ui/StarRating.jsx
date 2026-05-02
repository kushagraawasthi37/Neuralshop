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
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            style={{
              fontSize: interactive ? 20 : size,
              color:
                s <= (interactive ? hover || rating : Math.round(rating))
                  ? "#c9a96e"
                  : "rgba(201,169,110,0.2)",
              cursor: interactive ? "pointer" : "default",
              transition: "color 0.15s",
            }}
            onMouseEnter={() => interactive && setHover(s)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onRate?.(s)}
          >
            ★
          </span>
        ))}
      </div>
      {count > 0 && (
        <span style={{ fontSize: 12, color: "rgba(240,230,208,0.38)" }}>
          ({count})
        </span>
      )}
    </div>
  );
}

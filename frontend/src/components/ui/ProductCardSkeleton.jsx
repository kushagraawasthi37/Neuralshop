export default function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton">
      <div className="skeleton product-card-skeleton__img" />
      <div className="product-card-skeleton__info">
        <div
          className="skeleton"
          style={{ width: 80, height: 10, marginBottom: 12 }}
        />
        <div
          className="skeleton"
          style={{ width: "70%", height: 20, marginBottom: 8 }}
        />
        <div
          className="skeleton"
          style={{ width: "90%", height: 13, marginBottom: 4 }}
        />
        <div
          className="skeleton"
          style={{ width: "60%", height: 13, marginBottom: 20 }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="skeleton" style={{ width: 80, height: 22 }} />
          <div className="skeleton" style={{ width: 60, height: 14 }} />
        </div>
      </div>
    </div>
  );
}

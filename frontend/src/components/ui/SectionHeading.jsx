export default function SectionHeading({
  label,
  title,
  accent,
  className = "",
}) {
  return (
    <div className={`section-heading${className ? ` ${className}` : ""}`}>
      <div className="section-heading__label">
        <span className="section-heading__label-line" />
        {label}
      </div>
      <div className="section-heading__title">
        {title}{" "}
        {accent && <em className="section-heading__accent">{accent}</em>}
      </div>
    </div>
  );
}

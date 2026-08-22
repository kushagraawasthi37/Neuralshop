const normalized = (value) => String(value || "").toLowerCase();

export const evaluateCandidateConstraints = (request, candidate) => {
  const text = normalized(request);
  const maxPrice = text.match(/(?:under|below|less than)\s*[₹rs.]*\s*([\d,]+)/)?.[1];
  const size = text.match(/\b(xs|s|m|l|xl|xxl)\b/)?.[1]?.toUpperCase();
  const color = ["black", "white", "red", "blue", "green"].find((value) => text.includes(value));
  const category = ["outfit", "dress", "shoes", "jacket", "apparel", "formal"].find((value) => text.includes(value));
  const productText = normalized(`${candidate.name} ${candidate.category} ${candidate.subCategory} ${candidate.tags?.join(" ")}`);
  const hard = {
    price: !maxPrice || Number(candidate.price) <= Number(maxPrice.replaceAll(",", "")),
    size: !size || candidate.sizes?.some((entry) => normalized(entry.size) === normalized(size)),
    category: !category || productText.includes(category === "outfit" ? "apparel" : category),
    available: candidate.availableStock == null || candidate.availableStock > 0,
    exists: Boolean(candidate.id),
  };
  return { ...hard, satisfied: Object.values(hard).every(Boolean) };
};

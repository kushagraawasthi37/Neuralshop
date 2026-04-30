import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminReviewsApi } from "../../../api/admin";

export default function ReviewsPanel({ showToast }) {
  const qc = useQueryClient();

  const { data: reviews = [] } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () => adminReviewsApi.list().then((r) => {
      const d = r.data.data;
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.reviews)) return d.reviews;
      return [];
    }),
  });

  const toggleReviewMutation = useMutation({
    mutationFn: (id) => adminReviewsApi.toggleVisibility(id),
    onSuccess: () => { qc.invalidateQueries(["admin-reviews"]); showToast("Review visibility updated"); },
  });

  return (
    <div className="ns-content">
      <div className="page-header">
        <div className="page-eyebrow">08 — Intelligence</div>
        <div className="page-title">Review <em>Moderation</em></div>
        <div className="page-sub">{reviews.length} reviews loaded</div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
        <select className="ns-select" style={{ width: 160 }}>
          <option>All Ratings</option>
          {[5, 4, 3, 2, 1].map((n) => <option key={n}>{n} stars</option>)}
        </select>
        <select className="ns-select" style={{ width: 160 }}>
          <option>All Visibility</option>
          <option>Visible</option>
          <option>Hidden</option>
        </select>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>
            <circle cx="9" cy="9" r="6" /><path d="M16 16l-3-3" />
          </svg>
          <input className="ns-input" placeholder="Search by product or reviewer…" style={{ paddingLeft: 36 }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {reviews.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-muted)" }}>No reviews found</div>
        ) : (
          reviews.map((r) => {
            const name = r.user?.name || r.userId?.slice?.(0, 8) || "User";
            const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
            const isVisible = r.isVisible !== false;
            return (
              <div key={r.id || r._id} className="card" style={{ padding: 24, borderColor: isVisible ? "var(--border-gold)" : "rgba(190,110,110,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div className="admin-avatar" style={{ width: 36, height: 36 }}>{initials}</div>
                      <div>
                        <div style={{ fontSize: 13, color: "var(--champagne)" }}>{name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {r.productId?.name || r.productId?.slice?.(0, 16) || "—"} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= (r.rating || 0) ? "star-filled" : "star-empty"}>★</span>
                        ))}
                      </div>
                      <span className={isVisible ? "badge badge-delivered" : "badge badge-cancelled"} style={{ marginLeft: 4 }}>
                        {isVisible ? "Visible" : "Hidden"}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.7, maxWidth: 600 }}>"{r.comment}"</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0, marginLeft: 24 }}>
                    <label className="ns-toggle">
                      <input type="checkbox" checked={isVisible} onChange={() => toggleReviewMutation.mutate(r.id || r._id)} />
                      <div className="ns-toggle-track" />
                      <div className="ns-toggle-thumb" />
                    </label>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

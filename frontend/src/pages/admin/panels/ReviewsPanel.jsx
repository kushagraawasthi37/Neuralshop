import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminReviewsApi } from "../../../api/admin";

export default function ReviewsPanel({ showToast }) {
  const qc = useQueryClient();

  const [filterRating, setFilterRating] = useState("");
  const [filterVisibility, setFilterVisibility] = useState("");
  const [search, setSearch] = useState("");

  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState("");

  const { data: rawData } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () =>
      adminReviewsApi.list({}).then((r) => {
        const d = r.data.data;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.reviews)) return d.reviews;
        return [];
      }),
  });

  // Client-side filtering for rating, visibility, and search
  const reviews = (rawData || []).filter((r) => {
    if (filterRating && String(r.rating) !== String(filterRating)) return false;
    if (filterVisibility === "visible" && r.isVisible === false) return false;
    if (filterVisibility === "hidden" && r.isVisible !== false) return false;
    if (search) {
      const name = (r.user?.name || r.userId?.toString?.() || "").toLowerCase();
      const product = (
        r.productId?.name ||
        r.productId?.toString?.() ||
        ""
      ).toLowerCase();
      const comment = (r.comment || "").toLowerCase();
      const q = search.toLowerCase();
      if (!name.includes(q) && !product.includes(q) && !comment.includes(q))
        return false;
    }
    return true;
  });

  const toggleReviewMutation = useMutation({
    mutationFn: (id) => adminReviewsApi.toggleVisibility(id),
    onSuccess: () => {
      qc.invalidateQueries(["admin-reviews"]);
      showToast("Visibility updated");
    },
    onError: () => showToast("Failed to update visibility"),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id) => adminReviewsApi.deleteAny(id),
    onSuccess: () => {
      qc.invalidateQueries(["admin-reviews"]);
      showToast("Review deleted");
    },
    onError: (err) =>
      showToast(err?.response?.data?.message || "Failed to delete review"),
  });

  const replyMutation = useMutation({
    mutationFn: ({ reviewId, comment }) =>
      adminReviewsApi.respond(reviewId, comment),
    onSuccess: () => {
      qc.invalidateQueries(["admin-reviews"]);
      setReplyModal(null);
      setReplyText("");
      showToast("Reply posted");
    },
    onError: (err) =>
      showToast(err?.response?.data?.message || "Failed to post reply"),
  });

  const openReplyModal = (r) => {
    setReplyText(r.adminResponse?.comment || "");
    setReplyModal({
      reviewId: r._id || r.id,
      existing: !!r.adminResponse?.comment,
    });
  };

  return (
    <div className="ns-content">
      {/* Reply modal */}
      {replyModal && (
        <div className="modal-overlay" onClick={() => setReplyModal(null)}>
          <div
            className="modal"
            style={{ minWidth: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                {replyModal.existing ? "Edit Reply" : "Add Admin Reply"}
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={() => setReplyModal(null)}
              >
                ×
              </button>
            </div>
            <div className="form-group">
              <div className="form-label">Reply</div>
              <textarea
                className="ns-input"
                rows={4}
                style={{ resize: "vertical" }}
                placeholder="Write your response to this review…"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="ns-btn ns-btn-ghost"
                onClick={() => setReplyModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ns-btn ns-btn-primary"
                disabled={replyMutation.isPending || !replyText.trim()}
                onClick={() =>
                  replyMutation.mutate({
                    reviewId: replyModal.reviewId,
                    comment: replyText.trim(),
                  })
                }
              >
                {replyMutation.isPending ? "Posting…" : "Post Reply"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="page-eyebrow">08 — Intelligence</div>
        <div className="page-title">
          Review <em>Moderation</em>
        </div>
        <div className="page-sub">{reviews.length} reviews</div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <select
          className="ns-select"
          style={{ width: 150 }}
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
        >
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} stars
            </option>
          ))}
        </select>
        <select
          className="ns-select"
          style={{ width: 150 }}
          value={filterVisibility}
          onChange={(e) => setFilterVisibility(e.target.value)}
        >
          <option value="">All Visibility</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.4,
            }}
          >
            <circle cx="9" cy="9" r="6" />
            <path d="M16 16l-3-3" />
          </svg>
          <input
            className="ns-input"
            placeholder="Search by product, reviewer, or comment…"
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {reviews.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              padding: 40,
            }}
          >
            {rawData === undefined ? "Loading reviews…" : "No reviews found"}
          </div>
        ) : (
          reviews.map((r) => {
            const id = r._id || r.id;
            const name =
              r.user?.name || r.userId?.toString?.()?.slice(0, 8) || "User";
            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const isVisible = r.isVisible !== false;
            const hasReply = !!r.adminResponse?.comment;

            return (
              <div
                key={String(id)}
                className="card"
                style={{
                  padding: 20,
                  borderColor: isVisible
                    ? "var(--border-gold)"
                    : "rgba(190,110,110,0.2)",
                }}
              >
                {/* Header row: avatar + meta + stars + badge + Actions label */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      className="admin-avatar"
                      style={{
                        width: 34,
                        height: 34,
                        flexShrink: 0,
                        fontSize: 12,
                      }}
                    >
                      {initials}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--champagne)",
                          lineHeight: 1.3,
                        }}
                      >
                        {name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {r.productId?.name ||
                          r.productId?.toString?.()?.slice(0, 16) ||
                          "—"}{" "}
                        ·{" "}
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString("en-IN")
                          : ""}
                      </div>
                    </div>
                    <div
                      style={{ display: "flex", gap: 2, alignItems: "center" }}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= (r.rating || 0)
                              ? "star-filled"
                              : "star-empty"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span
                      className={
                        isVisible
                          ? "badge badge-delivered"
                          : "badge badge-cancelled"
                      }
                    >
                      {isVisible ? "● Visible" : "● Hidden"}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      paddingTop: 2,
                    }}
                  >
                    Actions
                  </div>
                </div>

                {/* Review body + actions row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                  }}
                >
                  {/* Left: review content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {r.title && (
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--champagne)",
                          marginBottom: 4,
                        }}
                      >
                        {r.title}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-mid)",
                        lineHeight: 1.7,
                      }}
                    >
                      "{r.comment}"
                    </div>

                    {hasReply && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: "8px 12px",
                          background: "rgba(201,169,110,0.05)",
                          border: "1px solid rgba(201,169,110,0.15)",
                          borderLeft: "2px solid rgba(201,169,110,0.5)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            letterSpacing: "0.1em",
                            color: "var(--gold)",
                            marginBottom: 4,
                          }}
                        >
                          ADMIN REPLY
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-mid)",
                            lineHeight: 1.6,
                          }}
                        >
                          {r.adminResponse.comment}
                        </div>
                        {r.adminResponse.respondedAt && (
                          <div
                            style={{
                              fontSize: 10,
                              color: "var(--text-muted)",
                              marginTop: 4,
                            }}
                          >
                            {new Date(
                              r.adminResponse.respondedAt,
                            ).toLocaleDateString("en-IN")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: action controls */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 8,
                      alignItems: "center",
                      flexShrink: 0,
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    {/* Visibility toggle */}
                    <label
                      className="ns-toggle"
                      title={isVisible ? "Hide review" : "Show review"}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => toggleReviewMutation.mutate(String(id))}
                        disabled={toggleReviewMutation.isPending}
                      />
                      <div className="ns-toggle-track" />
                      <div className="ns-toggle-thumb" />
                    </label>

                    <button
                      type="button"
                      className="ns-btn ns-btn-ghost"
                      style={{ padding: "5px 14px", fontSize: 11 }}
                      onClick={() => {
                        console.log("Opening reply modal for review");
                        openReplyModal(r);
                      }}
                    >
                      {hasReply ? "Edit Reply" : "Reply"}
                    </button>

                    <button
                      type="button"
                      className="ns-btn ns-btn-danger"
                      style={{ padding: "5px 14px", fontSize: 11 }}
                      disabled={deleteReviewMutation.isPending}
                      onClick={() => {
                        console.log("Opening reply modal for review");
                        if (
                          window.confirm(
                            "Delete this review? This cannot be undone.",
                          )
                        ) {
                          deleteReviewMutation.mutate(String(id));
                        }
                      }}
                    >
                      Delete
                    </button>
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

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminReviewsApi } from "../../../api/admin";

export default function ReviewsPanel({ showToast }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [respondModal, setRespondModal] = useState(null);
  const [responseText, setResponseText] = useState("");

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () =>
      adminReviewsApi.list().then((r) => r.data?.data || r.data || []),
  });

  const rawReviews = Array.isArray(reviewsData)
    ? reviewsData
    : Array.isArray(reviewsData?.reviews)
      ? reviewsData.reviews
      : [];

  const reviews = rawReviews.filter((r) => {
    const matchSearch =
      !search ||
      (r.comment || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.userName || r.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.productName || r.product?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchRating =
      filterRating === "all" || String(r.rating) === filterRating;
    return matchSearch && matchRating;
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: (id) => adminReviewsApi.toggleVisibility(id),
    onSuccess: () => {
      qc.invalidateQueries(["admin-reviews"]);
      showToast("Review visibility updated");
    },
    onError: () => showToast("Failed to toggle visibility"),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id) => adminReviewsApi.deleteAny(id),
    onSuccess: () => {
      qc.invalidateQueries(["admin-reviews"]);
      showToast("Review deleted");
    },
    onError: () => showToast("Failed to delete review"),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, comment }) => adminReviewsApi.respond(id, comment),
    onSuccess: () => {
      qc.invalidateQueries(["admin-reviews"]);
      setRespondModal(null);
      setResponseText("");
      showToast("Response published");
    },
    onError: (err) =>
      showToast(err.response?.data?.message || "Failed to publish response"),
  });

  return (
    <div className="ns-content">
      {respondModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setRespondModal(null);
            setResponseText("");
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Respond to Review</div>
              <button
                className="modal-close"
                onClick={() => {
                  setRespondModal(null);
                  setResponseText("");
                }}
              >
                ×
              </button>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginBottom: 12,
              }}
            >
              Author:{" "}
              <span style={{ color: "var(--champagne)" }}>
                {respondModal.userName || respondModal.user?.name || "Customer"}
              </span>
            </div>
            <div
              style={{
                fontSize: 13,
                fontStyle: "italic",
                color: "var(--text-mid)",
                marginBottom: 16,
                padding: 12,
                background: "rgba(201,169,110,0.03)",
                border: "1px solid rgba(201,169,110,0.12)",
              }}
            >
              "{respondModal.comment}"
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <div className="form-label">Official Store Response</div>
              <textarea
                className="ns-input"
                rows={4}
                placeholder="Write your official response to this customer…"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>
            <div className="modal-actions">
              <button
                className="ns-btn ns-btn-ghost"
                onClick={() => {
                  setRespondModal(null);
                  setResponseText("");
                }}
              >
                Cancel
              </button>
              <button
                className="ns-btn ns-btn-primary"
                disabled={!responseText.trim() || respondMutation.isPending}
                onClick={() =>
                  respondMutation.mutate({
                    id: respondModal.id || respondModal._id,
                    comment: responseText.trim(),
                  })
                }
              >
                {respondMutation.isPending ? "Publishing…" : "Publish Response"}
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
        <div className="page-sub">{rawReviews.length} customer reviews</div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <input
            className="ns-input"
            placeholder="Search reviews by customer, product, or content…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="ns-select"
          style={{ width: 150 }}
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars ★★★★★</option>
          <option value="4">4 Stars ★★★★☆</option>
          <option value="3">3 Stars ★★★☆☆</option>
          <option value="2">2 Stars ★★☆☆☆</option>
          <option value="1">1 Star ★☆☆☆☆</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="ns-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Rating</th>
                <th>Review Comment</th>
                <th>Product</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "40px 16px",
                      color: "var(--text-muted)",
                    }}
                  >
                    Loading reviews…
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "40px 16px",
                      color: "var(--text-muted)",
                    }}
                  >
                    No reviews match filter
                  </td>
                </tr>
              ) : (
                reviews.map((r) => {
                  const id = r.id || r._id;
                  const isVisible = r.isVisible !== false;
                  return (
                    <tr key={id}>
                      <td className="primary">
                        <div>{r.userName || r.user?.name || "Anonymous"}</div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--text-muted)",
                            marginTop: 2,
                          }}
                        >
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleDateString("en-IN")
                            : "—"}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: "var(--gold)", fontSize: 13 }}>
                          {"★".repeat(r.rating || 5)}
                          {"☆".repeat(5 - (r.rating || 5))}
                        </span>
                      </td>
                      <td style={{ maxWidth: 280 }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--champagne)",
                            lineHeight: 1.5,
                          }}
                        >
                          {r.comment}
                        </div>
                        {r.adminResponse && (
                          <div
                            style={{
                              marginTop: 6,
                              padding: "6px 10px",
                              background: "rgba(201,169,110,0.06)",
                              borderLeft: "2px solid var(--gold)",
                              fontSize: 11,
                              color: "var(--gold)",
                            }}
                          >
                            <strong>Store Response:</strong> {r.adminResponse}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="ns-code">
                          {r.productName || r.product?.name || (r.productId || "").slice(0, 12) || "Product"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            isVisible
                              ? "badge badge-delivered"
                              : "badge badge-cancelled"
                          }
                        >
                          {isVisible ? "Visible" : "Hidden"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button
                            className="ns-btn ns-btn-ghost"
                            style={{ padding: "5px 10px", fontSize: 10 }}
                            disabled={toggleVisibilityMutation.isPending}
                            onClick={() => toggleVisibilityMutation.mutate(id)}
                          >
                            {isVisible ? "Hide" : "Show"}
                          </button>
                          <button
                            className="ns-btn ns-btn-ghost"
                            style={{ padding: "5px 10px", fontSize: 10 }}
                            onClick={() => {
                              setRespondModal(r);
                              setResponseText(r.adminResponse || "");
                            }}
                          >
                            Respond
                          </button>
                          <button
                            className="ns-btn ns-btn-danger"
                            style={{ padding: "5px 10px", fontSize: 10 }}
                            disabled={deleteReviewMutation.isPending}
                            onClick={() => deleteReviewMutation.mutate(id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

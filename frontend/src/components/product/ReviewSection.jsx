import StarRating from "../ui/StarRating";

export default function ReviewSection({
  reviews = [],
  avgRating,
  user,
  reviewForm,
  setReviewForm,
  editForm,
  setEditForm,
  reviewMutation,
  editMutation,
  deleteMutation,
  showToast,
}) {
  return (
    <div className="review-section">
      {/* Header */}
      <div className="review-section__header">
        <div>
          <div className="review-section__label">
            <span className="review-section__label-line" />
            Reviews
          </div>
          <div className="review-section__title">
            Customer{" "}
            <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Voices</em>
          </div>
        </div>
        {reviews.length > 0 && (
          <div className="review-section__summary">
            <div className="review-section__avg">{avgRating.toFixed(1)}</div>
            <StarRating rating={avgRating} />
            <div className="review-section__count">
              {reviews.length} reviews
            </div>
          </div>
        )}
      </div>

      {/* Write review */}
      <div style={{ marginBottom: 40 }}>
        <button
          onClick={() => setReviewForm((f) => ({ ...f, show: !f.show }))}
          className="review-section__write-btn"
        >
          {reviewForm.show ? "Cancel" : "Write a Review"}
        </button>

        {reviewForm.show && (
          <div className="review-section__form">
            <div style={{ marginBottom: 16 }}>
              <div className="review-section__field-label">Your Rating</div>
              <StarRating
                rating={reviewForm.rating}
                interactive
                onRate={(r) => setReviewForm((f) => ({ ...f, rating: r }))}
              />
            </div>
            <div>
              <div className="review-section__field-label">Your Review</div>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, comment: e.target.value }))
                }
                rows={4}
                placeholder="Share your experience…"
                className="review-section__textarea"
              />
            </div>
            <div className="review-section__form-actions">
              <button
                disabled={reviewMutation.isPending}
                className="review-section__submit-btn"
                onClick={() => {
                  if (!reviewForm.rating) {
                    showToast("Please select a rating");
                    return;
                  }
                  if (!reviewForm.comment.trim()) {
                    showToast("Please write a review");
                    return;
                  }
                  reviewMutation.mutate({
                    rating: reviewForm.rating,
                    comment: reviewForm.comment.trim(),
                  });
                }}
              >
                {reviewMutation.isPending ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {reviews.length === 0 ? (
          <div className="review-section__empty">
            No reviews yet. Be the first to share your thoughts.
          </div>
        ) : (
          reviews.map((r, i) => {
            const reviewUserId =
              r.userId?._id || r.userId?.id || r.userId || r.user?._id;
            const loggedUserId = user?._id || user?.id;
            const isOwn =
              user &&
              reviewUserId &&
              loggedUserId &&
              reviewUserId.toString() === loggedUserId.toString();
            const isEditing = editForm.reviewId === (r.id || r._id);

            return (
              <div key={r.id || i} className="review-item">
                <div className="review-item__top">
                  <div className="review-item__user">
                    <div className="review-item__avatar">
                      {(r.userId?.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="review-item__name">
                        {r.userId?.name || "Anonymous"}
                      </div>
                      <div className="review-item__date">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString("en-IN", {
                              month: "long",
                              year: "numeric",
                            })
                          : ""}
                      </div>
                    </div>
                  </div>
                  <div className="review-item__rating-row">
                    <StarRating rating={r.rating} />
                    {isOwn && !isEditing && (
                      <div className="review-item__actions">
                        <button
                          onClick={() =>
                            setEditForm({
                              reviewId: r.id || r._id,
                              rating: r.rating,
                              comment: r.comment,
                            })
                          }
                          className="review-item__edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(r.id || r._id)}
                          disabled={deleteMutation.isPending}
                          className="review-item__delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div
                    className="review-section__form"
                    style={{ marginTop: 12 }}
                  >
                    <div style={{ marginBottom: 12 }}>
                      <div className="review-section__field-label">Rating</div>
                      <StarRating
                        rating={editForm.rating}
                        interactive
                        onRate={(v) =>
                          setEditForm((f) => ({ ...f, rating: v }))
                        }
                      />
                    </div>
                    <textarea
                      value={editForm.comment}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, comment: e.target.value }))
                      }
                      rows={3}
                      className="review-section__textarea"
                    />
                    <div className="review-section__form-actions">
                      <button
                        onClick={() =>
                          setEditForm({
                            reviewId: null,
                            rating: 0,
                            comment: "",
                          })
                        }
                        className="review-item__edit-btn"
                        style={{ padding: "8px 20px" }}
                      >
                        Cancel
                      </button>
                      <button
                        disabled={editMutation.isPending}
                        onClick={() =>
                          editMutation.mutate({
                            reviewId: editForm.reviewId,
                            rating: editForm.rating,
                            comment: editForm.comment,
                          })
                        }
                        className="review-section__submit-btn"
                      >
                        {editMutation.isPending ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="review-item__comment">{r.comment}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

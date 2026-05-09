import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi, reviewApi } from "../api/products";
import { wishlistApi } from "../api/user";
import { cartApi } from "../api/cart";
import { useAuthStore } from "../store/authStore";
import { useGuestCartStore } from "../store/guestCartStore";
import Toast from "../components/ui/Toast";
import ProductGallery from "../components/product/ProductGallery";
import ProductInfo from "../components/product/ProductInfo";
import ReviewSection from "../components/product/ReviewSection";
import RelatedProducts from "../components/product/RelatedProducts";
import { useProductViewTracker, useBehaviorTracker } from "../hooks/useBehaviorTracker";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, isLoggedIn } = useAuthStore();
  const guestAddItem = useGuestCartStore((s) => s.addItem);

  const [toast, setToast] = useState({ show: false, msg: "" });
  const [reviewForm, setReviewForm] = useState({
    show: false,
    rating: 0,
    comment: "",
  });
  const [editForm, setEditForm] = useState({
    reviewId: null,
    rating: 0,
    comment: "",
  });
  const [addingCart, setAddingCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  // Behavior tracking
  useProductViewTracker(product);
  const { track } = useBehaviorTracker();

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () =>
      productApi
        .getById(id)
        .then((r) => r.data.product || r.data.data || r.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["product-reviews", id],
    queryFn: () =>
      reviewApi
        .getByProduct(id)
        .then((res) => res.data?.data?.reviews || res.data?.data || []),
    staleTime: 2 * 60 * 1000,
  });

  const { data: similar = [] } = useQuery({
    queryKey: ["similar", id],
    queryFn: async () => {
      const res = await productApi.related(id);
      return res.data.data || [];
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!product,
  });

  const { data: youMayLike = [] } = useQuery({
    queryKey: ["you-may-like", id],
    queryFn: () => productApi.youMayLike(id).then((r) => r.data.data || []),
    staleTime: 10 * 60 * 1000,
    enabled: !!product,
  });

  const { data: wishlistStatus } = useQuery({
    queryKey: ["wishlist-check", id],
    queryFn: () =>
      wishlistApi
        .check(id)
        .then((r) => r.data.data?.inWishlist ?? false)
        .catch(() => false),
  });

  const wishlistMutation = useMutation({
    mutationFn: (add) => (add ? wishlistApi.add(id) : wishlistApi.remove(id)),
    onSuccess: (_, add) => {
      qc.invalidateQueries(["wishlist-check", id]);
      showToast(add ? "Added to wishlist" : "Removed from wishlist");
      if (add && product) {
        track("wishlist_add", product._id || product.id, {
          productName: product.name,
          category: product.category,
          price: product.price,
        });
      }
    },
  });

  // Broadcast product context to VoiceAssistant
  useEffect(() => {
    if (!product) return;
    const availableSizes = (product.sizes || [])
      .filter((s) => s.stock > 0)
      .map((s) => s.size);
    window.dispatchEvent(
      new CustomEvent("voice:product_context", {
        detail: {
          productId: product._id || product.id,
          productName: product.name,
          availableSizes,
          selectedSize,
        },
      }),
    );
  }, [product, selectedSize]);

  // Listen for voice-triggered add-to-cart
  useEffect(() => {
    const handler = (e) => {
      const { size } = e.detail || {};
      const targetSize =
        size ||
        (product?.sizes || []).filter((s) => s.stock > 0).map((s) => s.size)[0];
      if (targetSize) {
        setSelectedSize(targetSize);
        handleAddToCart({ selectedSize: targetSize, quantity: 1 });
      }
    };
    window.addEventListener("voice:add_to_cart", handler);
    return () => window.removeEventListener("voice:add_to_cart", handler);
  }, [product]);

  const reviewMutation = useMutation({
    mutationFn: ({ rating, comment }) =>
      reviewApi.submit(id, { rating, comment }),
    onSuccess: () => {
      qc.invalidateQueries(["product-reviews", id]);
      setReviewForm({ show: false, rating: 0, comment: "" });
      showToast("Review submitted — thank you!");
    },
    onError: (err) =>
      showToast(err?.response?.data?.message || "Could not submit review"),
  });

  const editMutation = useMutation({
    mutationFn: ({ reviewId, rating, comment }) =>
      reviewApi.update(reviewId, { rating, comment }),
    onSuccess: () => {
      qc.invalidateQueries(["product-reviews", id]);
      setEditForm({ reviewId: null, rating: 0, comment: "" });
      showToast("Review updated");
    },
    onError: (err) =>
      showToast(err?.response?.data?.message || "Could not update review"),
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId) => reviewApi.delete(reviewId),
    onSuccess: () => {
      qc.invalidateQueries(["product-reviews", id]);
      showToast("Review deleted");
    },
    onError: (err) =>
      showToast(err?.response?.data?.message || "Could not delete review"),
  });

  const handleAddToCart = async ({ selectedSize, quantity }) => {
    if (!selectedSize) {
      showToast("Please select a size");
      return;
    }
    setAddingCart(true);
    try {
      const productId = product.id || product._id;
      const priceAtAdd = product.offerPrice || product.price || 0;
      const image = (product.image || product.images || [])[0] || "";
      if (isLoggedIn) {
        await cartApi.addItem(productId, quantity, selectedSize, priceAtAdd, product.name, image);
      } else {
        guestAddItem({ productId, quantity, size: selectedSize, priceAtAdd, name: product.name, image });
      }
      track("add_to_cart", productId, {
        productName: product.name,
        category: product.category,
        price: priceAtAdd,
        size: selectedSize,
      });
      showToast("Added to cart");
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not add to cart");
    }
    setAddingCart(false);
  };

  if (isLoading) {
    return (
      <div
        className="page-center"
        style={{ minHeight: "100vh", paddingTop: 80 }}
      >
        <div className="page-loader-text">Loading…</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        className="page-center"
        style={{
          minHeight: "100vh",
          paddingTop: 80,
          padding: "80px var(--page-px) 40px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="error-title">Product not found</div>
          <button onClick={() => navigate("/products")} className="btn-primary">
            Browse Collection
          </button>
        </div>
      </div>
    );
  }

  const images = product.image || product.images || [];
  const price = product.offerPrice || product.price || 0;
  const original = product.originalPrice || product.comparePrice;
  const discount =
    original && original > price
      ? Math.round(((original - price) / original) * 100)
      : null;
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : product.rating || 0;

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80 }}>
      <Toast msg={toast.msg} show={toast.show} />

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/" className="breadcrumb__link">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="breadcrumb__link">
          Products
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              to={`/products?category=${product.category}`}
              className="breadcrumb__link"
            >
              {product.category}
            </Link>
          </>
        )}
        <span>/</span>
        <span
          style={{
            color: "rgba(240,230,208,0.6)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "40vw",
          }}
        >
          {product.name}
        </span>
      </div>

      {/* Main product layout */}
      <div className="product-layout">
        <div className="product-layout__gallery">
          <ProductGallery
            images={images}
            name={product.name}
            discount={discount}
          />
        </div>
        <div className="product-layout__info">
          <ProductInfo
            product={product}
            avgRating={avgRating}
            reviewCount={reviews.length}
            wishlistStatus={wishlistStatus}
            onAddToCart={handleAddToCart}
            onToggleWishlist={() => wishlistMutation.mutate(!wishlistStatus)}
            addingCart={addingCart}
          />
        </div>
      </div>

      {/* Reviews */}
      <div className="product-section">
        <ReviewSection
          reviews={reviews}
          avgRating={avgRating}
          user={user}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          editForm={editForm}
          setEditForm={setEditForm}
          reviewMutation={reviewMutation}
          editMutation={editMutation}
          deleteMutation={deleteMutation}
          showToast={showToast}
        />
      </div>

      {/* Related */}
      {similar.length > 0 && (
        <div className="product-section">
          <RelatedProducts
            label="You May Also Like"
            title="Similar"
            accent="Pieces"
            items={similar}
          />
        </div>
      )}

      {youMayLike.length > 0 && (
        <div className="product-section">
          <RelatedProducts
            label="Curated For You"
            title="You May"
            accent="Like"
            items={youMayLike}
          />
        </div>
      )}
    </div>
  );
}

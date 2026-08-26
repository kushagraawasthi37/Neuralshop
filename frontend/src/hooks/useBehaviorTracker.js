import { useCallback, useEffect, useRef } from "react";
import { behaviorApi } from "../api/behavior";

const SESSION_KEY = "ns_session_id";

export function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// Fire-and-forget — never throws, never blocks the caller
const fireEvent = (event, productId, metadata) => {
  behaviorApi
    .track({ event, productId, metadata, sessionId: getSessionId() })
    .catch(() => {
      // Tracking request does not block the user experience, so we ignore any errors
    });
};

export function useBehaviorTracker() {
  const track = useCallback((event, productId, metadata = {}) => {
    fireEvent(event, productId, metadata);
  }, []);
  return { track };
}

// Tracks time spent on a product page; call once per product
export function useProductViewTracker(product) {
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (!product) return;
    const id = product._id || product.id;
    startRef.current = Date.now();

    fireEvent("product_view", id, {
      productName: product.name,
      category: product.category,
      subCategory: product.subCategory,
      price: product.price,
    });

    return () => {
      const duration = Math.round((Date.now() - startRef.current) / 1000);
      if (duration > 2) {
        fireEvent("product_view", id, {
          productName: product.name,
          category: product.category,
          subCategory: product.subCategory,
          price: product.price,
          duration,
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id || product?.id]);
}

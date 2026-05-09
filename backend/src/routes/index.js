import authRoutes from "../modules/auth/auth.routes.js";
import healthRoute from "../modules/healthCheck/healthcheck.routes.js";
import productRoutes from "../modules/product/product.routes.js";
import reviewRoutes from "../modules/product/review.routes.js";
import recommendationRoutes from "../modules/product/recommendation.routes.js";
import cartRoutes from "../modules/cart/cart.routes.js";
import guestCartRoutes from "../modules/cart/guest-cart.routes.js";
import orderRoutes from "../modules/order/order.routes.js";
import orderAdminRoutes from "../modules/order/order.admin.routes.js";
import returnRoutes from "../modules/order/return.routes.js";
import paymentRoutes from "../modules/payment/payment.routes.js";
import couponRoutes from "../modules/payment/coupon.routes.js";
import inventoryAdminRoutes from "../modules/inventory/inventory.admin.routes.js";
import inventoryRoutes from "../modules/inventory/inventory.admin.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import wishlistRoutes from "../modules/user/wishlist.routes.js";
import analyticsRoutes from "../modules/admin/analytics.routes.js";
import adminProfileRoutes from "../modules/admin/admin.profile.routes.js";
import behaviorRoutes from "../modules/behavior/behavior.routes.js";
import voiceRoutes from "../modules/voice/voice.routes.js";

export const setupRoutes = (app) => {
  app.use("/api/healthCheck", healthRoute);
  app.use("/api/auth", authRoutes);

  // Product routes
  app.use("/api/product", productRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/recommendations", recommendationRoutes);

  // Cart routes
  app.use("/api/cart", cartRoutes);
  app.use("/api/guest-cart", guestCartRoutes);

  // Order routes
  app.use("/api/admin/orders", orderAdminRoutes); // Admin order routes
  app.use("/orders", orderRoutes); // Order routes at root: /orders
  app.use("/api/returns", returnRoutes); // Return/refund routes

  // Inventory routes
  app.use("/api/admin/inventory", inventoryAdminRoutes); // Admin inventory routes
  app.use("/api/inventory", inventoryRoutes);

  // Payment routes
  app.use(paymentRoutes); // Payment routes at root: /orders/:id/pay, /payments/:id, /webhook
  app.use("/api/coupons", couponRoutes); // Coupon routes

  // User routes
  app.use("/api/user", userRoutes);
  app.use("/api/wishlist", wishlistRoutes);

  // Analytics routes
  app.use("/api/analytics", analyticsRoutes);

  // Admin profile routes
  app.use("/api/admin", adminProfileRoutes);

  // AI features
  app.use("/api/behavior", behaviorRoutes);
  app.use("/api/voice", voiceRoutes);
};

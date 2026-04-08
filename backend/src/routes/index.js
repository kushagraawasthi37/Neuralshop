import authRoutes from "../modules/auth/auth.routes.js";
import healthRoute from "../modules/healthCheck/healthcheck.routes.js";
import productRoutes from "../modules/product/product.routes.js";
import cartRoutes from "../modules/cart/cart.routes.js";
import orderRoutes from "../modules/order/order.routes.js";
import orderAdminRoutes from "../modules/order/order.admin.routes.js";
import paymentRoutes from "../modules/payment/payment.routes.js";
import inventoryAdminRoutes from "../modules/inventory/inventory.admin.routes.js";
import inventoryRoutes from "../modules/inventory/inventory.admin.routes.js";
import userRoutes from "../modules/user/user.routes.js";

export const setupRoutes = (app) => {
  app.use("/api/healthCheck", healthRoute);
  app.use("/api/auth", authRoutes);
  app.use("/api/product", productRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/admin/orders", orderAdminRoutes); // Admin order routes
  app.use(orderRoutes); // Order routes at root: /orders
  app.use("/api/admin/inventory", inventoryAdminRoutes); // Admin inventory routes
  app.use(paymentRoutes); // Payment routes at root: /orders/:id/pay, /payments/:id, /webhook
  app.use("/api/user", userRoutes);
  app.use("/api/inventory", inventoryRoutes);
};

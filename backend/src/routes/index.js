import authRoutes from "../modules/auth/auth.routes.js";
<<<<<<< HEAD
import healthRoute from "../modules/healthCheck/healthcheck.routes.js";
// import userRoutes from "../modules/user/user.routes.js";
// import productRoutes from "../modules/product/product.routes.js";
// import cartRoutes from "../modules/cart/cart.routes.js";
// import orderRoutes from "../modules/order/order.routes.js";
// import paymentRoutes from "../modules/payment/payment.routes.js";
// import inventoryRoutes from "../modules/inventory/inventory.routes.js";

export const setupRoutes = (app) => {
  app.use("/api/healthCheck", healthRoute);
  app.use("/api/auth", authRoutes);
  // app.use("/api/user", userRoutes);
  // app.use("/api/product", productRoutes);
  // app.use("/api/cart", cartRoutes);
  // app.use("/api/order", orderRoutes);
  // app.use("/api/payment", paymentRoutes);
  // app.use("/api/inventory", inventoryRoutes);
=======
import userRoutes from "../modules/user/user.routes.js";
import productRoutes from "../modules/product/product.routes.js";
import cartRoutes from "../modules/cart/cart.routes.js";
import orderRoutes from "../modules/order/order.routes.js";
import paymentRoutes from "../modules/payment/payment.routes.js";
import inventoryRoutes from "../modules/inventory/inventory.routes.js";

export const setupRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/product", productRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/order", orderRoutes);
  app.use("/api/payment", paymentRoutes);
  app.use("/api/inventory", inventoryRoutes);
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
};

import "dotenv/config";
import mongoose from "mongoose";

const { default: prisma } = await import("../src/prisma/client.js");
const { Product } = await import("../src/modules/product/product.model.js");
const { default: Admin } = await import("../src/modules/auth/auth.model.js");
const { User } = await import("../src/modules/user/user.model.js");

const benchmarkUserId = "benchmark-user";
const benchmarkAdminId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
const benchmarkProductSku = "benchmark-product";
const mongoUrl = process.env.BENCHMARK_MONGO_URL || process.env.MONGO_URL || "mongodb://neural:neural_secret@localhost:27017/neuralshop?authSource=admin";

await mongoose.connect(mongoUrl);

try {
  await prisma.returnRequest.deleteMany({ where: { userId: benchmarkUserId } });
  await prisma.idempotencyKey.deleteMany({ where: { userId: benchmarkUserId } });
  await prisma.orderItem.deleteMany({ where: { productId: { startsWith: "benchmark-product" } } });
  await prisma.payment.deleteMany({ where: { order: { userId: benchmarkUserId } } });
  await prisma.order.deleteMany({ where: { userId: benchmarkUserId } });
  await prisma.address.deleteMany({ where: { userId: benchmarkUserId } });
  await prisma.inventory.deleteMany({ where: { adminId: benchmarkAdminId.toString() } });

  await Product.deleteMany({ sku: benchmarkProductSku });
  await User.deleteMany({ email: "benchmark-user@neuralshop.test" });
  await Admin.deleteMany({ _id: benchmarkAdminId });

  await Admin.create({
    _id: benchmarkAdminId,
    name: "Benchmark Admin",
    email: "benchmark-admin@neuralshop.test",
    password: "benchmark-password-not-for-login",
    role: "admin",
    emailVerified: true,
  });

  const product = await Product.create({
    name: "Benchmark Product",
    description: "Isolated product for concurrency and payment validation.",
    price: 100,
    images: ["https://example.invalid/benchmark.png"],
    category: "benchmark",
    subCategory: "benchmark",
    sizes: [{ size: "M", stock: 10 }],
    owner: benchmarkAdminId,
    sku: benchmarkProductSku,
  });

  const address = await prisma.address.create({
    data: {
      userId: benchmarkUserId,
      label: "Benchmark",
      street: "1 Benchmark Street",
      city: "Testville",
      state: "Test State",
      zipCode: "000000",
      country: "India",
      isDefault: true,
    },
  });

  await prisma.inventory.create({
    data: {
      adminId: benchmarkAdminId.toString(),
      productId: product._id.toString(),
      size: "M",
      totalStock: 10,
      reservedStock: 0,
    },
  });

  console.log(JSON.stringify({
    userId: benchmarkUserId,
    adminId: benchmarkAdminId.toString(),
    productId: product._id.toString(),
    addressId: address.id,
    initialStock: 10,
  }, null, 2));
} finally {
  await prisma.$disconnect();
  await mongoose.disconnect();
}

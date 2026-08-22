import "../src/config/loadenv.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import prisma from "../src/prisma/client.js";
import { User } from "../src/modules/user/user.model.js";
import { Product } from "../src/modules/product/product.model.js";
import { initializeInventoryService } from "../src/modules/inventory/inventory.service.js";

const fixtureUser = {
  name: "NeuralShop Fixture User",
  email: "fixture@neuralshop.local",
  password: "FixturePassword123!",
};

const products = [
  {
    sku: "FIXTURE-BLACK-WEDDING-M",
    name: "Black Wedding Jacket",
    description: "A black formal jacket for wedding and evening occasions.",
    price: 7499,
    images: ["https://images.unsplash.com/photo-1598808503746-f34c53b9323e"],
    category: "apparel",
    subCategory: "formal-wear",
    sizes: [
      { size: "M", stock: 10 },
      { size: "L", stock: 8 },
    ],
    rating: 4.8,
    reviewCount: 42,
    bestseller: true,
    tags: ["black", "wedding", "formal"],
  },
  {
    sku: "FIXTURE-WHITE-SHIRT-M",
    name: "White Formal Shirt",
    description: "A crisp white shirt for work, events, and formal styling.",
    price: 2499,
    images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf"],
    category: "apparel",
    subCategory: "shirts",
    sizes: [
      { size: "M", stock: 12 },
      { size: "L", stock: 10 },
    ],
    rating: 4.6,
    reviewCount: 31,
    bestseller: false,
    tags: ["white", "formal", "shirt"],
  },
  {
    sku: "FIXTURE-BLACK-SHOES-M",
    name: "Black Formal Shoes",
    description: "Polished black shoes designed for formal occasions.",
    price: 3999,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff"],
    category: "footwear",
    subCategory: "formal-shoes",
    sizes: [
      { size: "M", stock: 9 },
      { size: "L", stock: 7 },
    ],
    rating: 4.7,
    reviewCount: 27,
    bestseller: true,
    tags: ["black", "formal", "shoes"],
  },
];

const run = async () => {
  await connectDB();
  const password = await bcrypt.hash(fixtureUser.password, 10);
  const user = await User.findOneAndUpdate(
    { email: fixtureUser.email },
    { ...fixtureUser, password, role: "admin", emailVerified: true },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const seededProducts = [];
  for (const fixture of products) {
    const product = await Product.findOneAndUpdate(
      { sku: fixture.sku },
      { ...fixture, owner: user._id },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    );
    seededProducts.push(product);
    for (const size of fixture.sizes) {
      await initializeInventoryService(
        String(user._id),
        String(product._id),
        size.size,
        size.stock,
      );
    }
  }

  const address = await prisma.address.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      userId: String(user._id),
      label: "Fixture Home",
      street: "1 NeuralShop Lane",
      city: "Bengaluru",
      state: "Karnataka",
      zipCode: "560001",
      country: "India",
      isDefault: true,
    },
  });

  console.log(
    JSON.stringify(
      {
        user: {
          id: String(user._id),
          email: fixtureUser.email,
          password: fixtureUser.password,
        },
        products: seededProducts.map((product) => ({
          id: String(product._id),
          sku: product.sku,
          name: product.name,
        })),
        addressId: address.id,
      },
      null,
      2,
    ),
  );
};

try {
  await run();
} finally {
  await mongoose.disconnect().catch(() => {});
  await prisma.$disconnect().catch(() => {});
}

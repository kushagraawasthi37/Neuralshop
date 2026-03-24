import redis from "redis";

// 🛒 Redis Cart Manager
// Cart is stored in Redis for performance, not in MongoDB or PostgreSQL

class CartManager {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    this.client.on("error", (err) => {
      console.error("❌ Redis Client Error:", err);
    });

    this.connect();
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
      console.log("✅ Redis Cart Manager Connected");
    }
  }

  // 🛒 Get cart for user
  async getCart(userId) {
    const cart = await this.client.get(`cart:${userId}`);
    return cart ? JSON.parse(cart) : { items: [], total: 0 };
  }

  // ➕ Add item to cart
  async addToCart(userId, productId, quantity, price) {
    const cart = await this.getCart(userId);

    const existingItem = cart.items.find(
      (item) => item.productId === productId,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, price });
    }

    cart.total = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    await this.client.set(`cart:${userId}`, JSON.stringify(cart), {
      EX: 7 * 24 * 60 * 60, // Expire in 7 days
    });

    return cart;
  }

  // ➖ Remove item from cart
  async removeFromCart(userId, productId) {
    const cart = await this.getCart(userId);

    cart.items = cart.items.filter((item) => item.productId !== productId);

    cart.total = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    if (cart.items.length === 0) {
      await this.client.del(`cart:${userId}`);
    } else {
      await this.client.set(`cart:${userId}`, JSON.stringify(cart), {
        EX: 7 * 24 * 60 * 60,
      });
    }

    return cart;
  }

  // 🗑️ Clear cart
  async clearCart(userId) {
    await this.client.del(`cart:${userId}`);
  }

  // 📦 Update item quantity
  async updateQuantity(userId, productId, quantity) {
    const cart = await this.getCart(userId);

    const item = cart.items.find((item) => item.productId === productId);

    if (item) {
      if (quantity <= 0) {
        cart.items = cart.items.filter((item) => item.productId !== productId);
      } else {
        item.quantity = quantity;
      }
    }

    cart.total = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    if (cart.items.length === 0) {
      await this.client.del(`cart:${userId}`);
    } else {
      await this.client.set(`cart:${userId}`, JSON.stringify(cart), {
        EX: 7 * 24 * 60 * 60,
      });
    }

    return cart;
  }
}

export const cartManager = new CartManager();

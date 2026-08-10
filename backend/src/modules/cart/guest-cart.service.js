import prisma from "../../prisma/client.js";
import { mergeCartService } from "./cart.service.js";

// ============================================
// CREATE GUEST CART (persistent storage)
// ============================================
export const createGuestCartService = async (sessionId, cartItems = []) => {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const guestCart = await prisma.guestCart.create({
      data: {
        sessionId,
        items: cartItems,
        total: calculateCartTotal(cartItems),
        expiresAt,
      },
    });

    return guestCart;
  } catch (error) {
    throw error;
  }
};

// ============================================
// GET GUEST CART
// ============================================
export const getGuestCartService = async (sessionId) => {
  try {
    const guestCart = await prisma.guestCart.findUnique({
      where: { sessionId },
    });

    // Check if cart has expired
    if (guestCart && guestCart.expiresAt < new Date()) {
      // Delete expired cart
      await prisma.guestCart.delete({ where: { sessionId } });
      return null;
    }

    return guestCart;
  } catch (error) {
    throw error;
  }
};

// ============================================
// UPDATE GUEST CART
// ============================================
export const updateGuestCartService = async (sessionId, cartItems) => {
  try {
    const guestCart = await prisma.guestCart.update({
      where: { sessionId },
      data: {
        items: cartItems,
        total: calculateCartTotal(cartItems),
        updatedAt: new Date(),
      },
    });

    return guestCart;
  } catch (error) {
    throw error;
  }
};

// ============================================
// ADD ITEM TO GUEST CART
// ============================================
export const addToGuestCartService = async (sessionId, item) => {
  try {
    let guestCart = await prisma.guestCart.findUnique({
      where: { sessionId },
    });

    if (!guestCart) {
      guestCart = await createGuestCartService(sessionId, [item]);
    } else {
      const items = Array.isArray(guestCart.items) ? guestCart.items : [];
      const existingIndex = items.findIndex(
        (i) => i.productId === item.productId && i.size === item.size,
      );

      if (existingIndex > -1) {
        items[existingIndex].quantity += item.quantity;
      } else {
        items.push(item);
      }

      guestCart = await updateGuestCartService(sessionId, items);
    }

    return guestCart;
  } catch (error) {
    throw error;
  }
};

// ============================================
// REMOVE ITEM FROM GUEST CART
// ============================================
export const removeFromGuestCartService = async (
  sessionId,
  productId,
  size,
) => {
  try {
    const guestCart = await prisma.guestCart.findUnique({
      where: { sessionId },
    });

    if (!guestCart) {
      throw new Error("Guest cart not found");
    }

    const items = (
      Array.isArray(guestCart.items) ? guestCart.items : []
    ).filter((item) => !(item.productId === productId && item.size === size));

    return await updateGuestCartService(sessionId, items);
  } catch (error) {
    throw error;
  }
};

// ============================================
// CLEAR GUEST CART
// ============================================
export const clearGuestCartService = async (sessionId) => {
  try {
    const guestCart = await prisma.guestCart.update({
      where: { sessionId },
      data: {
        items: [],
        total: 0,
      },
    });

    return guestCart;
  } catch (error) {
    throw error;
  }
};

// ============================================
// DELETE GUEST CART
// ============================================
export const deleteGuestCartService = async (sessionId) => {
  try {
    await prisma.guestCart.delete({
      where: { sessionId },
    });

    return { message: "Guest cart deleted" };
  } catch (error) {
    throw error;
  }
};

// ============================================
// MIGRATE GUEST CART TO USER CART (After login)
// ============================================
export const migrateGuestCartToUserService = async (sessionId, userId) => {
  try {
    const guestCart = await prisma.guestCart.findUnique({
      where: { sessionId },
    });

    if (!guestCart || !guestCart.items.length) {
      return { message: "No items to migrate" };
    }

    const cart = await mergeCartService(userId, {
      items: guestCart.items,
    });

    // Delete guest cart after migration
    await deleteGuestCartService(sessionId);

    return {
      message: "Guest cart migrated to user cart",
      items: guestCart.items,
    };
  } catch (error) {
    throw error;
  }
};

// ============================================
// CLEANUP EXPIRED GUEST CARTS (Background job)
// ============================================
export const cleanupExpiredGuestCartsService = async () => {
  try {
    const result = await prisma.guestCart.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return {
      message: "Expired guest carts cleaned up",
      count: result.count,
    };
  } catch (error) {
    throw error;
  }
};

// ============================================
// HELPER: Calculate cart total
// ============================================
function calculateCartTotal(items) {
  return Array.isArray(items)
    ? items.reduce((total, item) => total + item.quantity * item.price, 0)
    : 0;
}

import { ApiError } from "../../utils/api-error.js";
import { transitionCheckoutState } from "../order/checkout-state.js";

export const deductReservedStockInTransaction = async (tx, items) => {
  for (const item of items) {
    const updated = await tx.$queryRaw`
      UPDATE "Inventory"
      SET "totalStock" = "totalStock" - ${item.quantity},
          "reservedStock" = "reservedStock" - ${item.quantity}
      WHERE "adminId" = ${item.sellerId}
        AND "productId" = ${item.productId}
        AND "size" = ${item.size}
        AND "reservedStock" >= ${item.quantity}
      RETURNING "id"
    `;
    if (!updated?.length) {
      throw new ApiError(
        409,
        "Insufficient reserved stock or inventory not found",
        [],
        "payment",
      );
    }
  }
};

export const applyPaymentSuccessTransaction = async (
  tx,
  payment,
  razorpayPaymentId,
) => {
  const paymentUpdate = await tx.payment.updateMany({
    where: { id: payment.id, status: "pending" },
    data: { status: "success", razorpayPaymentId },
  });
  if (paymentUpdate.count !== 1) return false;
  await deductReservedStockInTransaction(tx, payment.order.items);
  await tx.order.update({
    where: { id: payment.orderId },
    data: {
      checkoutState: transitionCheckoutState(
        payment.order.checkoutState,
        "PAID",
      ),
    },
  });
  return true;
};

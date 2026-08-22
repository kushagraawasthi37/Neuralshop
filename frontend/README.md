# Frontend README

The frontend is a React application for NeuralShop that supports browsing, cart management, checkout, order tracking, and AI commerce interaction. It uses React Router for navigation, TanStack Query for server state, and Zustand for auth state and local store data.

## Scope & Limitations

- The frontend includes real checkout and payment UX, but payment success is gated on backend confirmation.
- There is no automated UI test suite yet.
- The app depends on the backend being running and configured correctly.
- Kafka and Elasticsearch health are backend concerns; the frontend only reflects the application-level state it receives from the API layer.

## Component Structure

The application bootstraps from `src/App.jsx` and lazily loads route-level pages. The key structure is:

- `src/pages/` — product, cart, checkout, auth, admin, order, agent pages
- `src/components/` — layout, landing, product cards, forms, and UI blocks
- `src/api/` — Axios wrappers for backend endpoints
- `src/store/` — client state such as auth state
- `src/hooks/` — behavior tracking, session helpers, cursor logic
- `src/lib/` — payment polling and utility functions

## State Management

The frontend uses:

- TanStack Query for API data such as cart, orders, and address queries
- Zustand for auth session state
- local component state for multi-step flows such as checkout and address entry

This separation keeps the UI responsive while still relying on the backend as the authoritative source for order, payment, and inventory state.

## Local Setup

### Prerequisites

- Node.js 20+
- npm 10+
- the backend running locally on a configured port, usually 8000
- valid frontend environment variables if used by the build

### Install and run

```bash
cd frontend
npm install
npm run dev
```

The dev server usually runs on:

- http://localhost:5173

### Production build

```bash
cd frontend
npm run build
npm run preview
```

## Checkout and Payment UI Design

The checkout flow is implemented in `src/pages/CheckoutPage.jsx` and is deliberately designed around backend state rather than a browser-only success signal.

### Payment flow

1. User creates an order with a delivery address.
2. Frontend calls the backend payment initiation endpoint.
3. Razorpay checkout opens with the returned order metadata.
4. The browser callback triggers a success handler, but the frontend does not treat that as final proof.
5. The app calls `ordersApi.waitForPaymentConfirmation(orderId)`, which polls the backend until the payment status is confirmed as successful.
6. Only then does the app navigate to the success or confirmation screen.

This avoids the critical false-positive behavior where the user sees success before the backend confirms the financial state.

## Payment Status Polling

The frontend polling logic is defined in `src/lib/paymentStatus.js`.

```js
export const waitForPaymentConfirmation = async (
  getPayment,
  { attempts = 15, intervalMs = 1000 } = {},
) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const latestPayment = await getPayment();
    if (CONFIRMED_STATUSES.has(String(latestPayment?.status).toLowerCase())) {
      return latestPayment;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error("Payment confirmation pending");
};
```

This is important because backend payment workflows are authoritative while the browser callback is only a user-level signal.

## UI states

The checkout page manages these states:

- pending address validation
- payment initialization failure
- payment modal dismissal/cancelled flow
- payment pending confirmation
- successful checkout confirmation

The app shows a different outcome depending on whether the backend confirms the payment or the user closes the payment modal.

## API Integration Pattern

The frontend uses a thin API layer in `src/api/`:

- `ordersApi.create` creates an order
- `ordersApi.pay` starts Razorpay payment
- `ordersApi.getPayment` polls backend payment state
- `cartApi` handles cart operations
- `userApi` handles auth and address flows

This keeps the app aligned to the backend contract and improves consistency across screens.

## Important Implementation Notes

### 1) Local backend required

The frontend does not contain its own mock payment or order store; it depends on the backend for real cart, order, and payment APIs.

### 2) Payment success is backend-gated

The UI waits for actual backend confirmation before redirecting to the order completion screen. This is analogous to a production-safe commerce flow and is materially better than callback-only success logic.

### 3) Agent page is part of storefront UX

The AI shopping agent page is a UI wrapper around the backend agent flow. The frontend asks the backend to plan actions and returns the product recommendations or checkout guidance from the agent service.

## Known Limitations

- No automated frontend test suite has been added yet.
- Payment UX is implemented, but large-scale browser automation or e2e validation has not been added.
- The app assumes a live backend and valid env credentials.

## Verification and Debugging

The frontend runs against the backend service as a live API dependency. The payment flow is validated through backend state checks and payment-status polling rather than browser-only success assumptions.

## Related Files

- `src/App.jsx`
- `src/pages/CheckoutPage.jsx`
- `src/lib/paymentStatus.js`
- `src/api/orders.js`
- `src/api/cart.js`
- `src/store/authStore.js`
- `src/hooks/useBehaviorTracker.js`

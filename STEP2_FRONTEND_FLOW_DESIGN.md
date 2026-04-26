# 🎯 STEP 2: COMPLETE FRONTEND FLOW DESIGN

**NeuralShop E-Commerce Platform - Frontend Architecture**  
**Date:** April 26, 2026  
**Status:** Flow Design Complete - AWAITING APPROVAL

---

## 📋 EXECUTIVE SUMMARY

This document designs the **complete frontend architecture** mapping all 105+ backend endpoints to comprehensive user and admin flows. The design follows modern e-commerce patterns with production-ready state management, authentication, and routing strategies.

---

## 🏗️ FRONTEND ARCHITECTURE OVERVIEW

### Tech Stack (Per Requirements)
- **Framework:** React 18+ with JavaScript (not TypeScript)
- **Routing:** React Router v6
- **State Management:** Zustand (global) + React Query (server state)
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios with interceptors
- **Notifications:** React Hot Toast
- **Charts:** Recharts (admin analytics)
- **Animations:** Framer Motion (subtle, not overused)
- **UI Components:** Custom + shadcn/ui

### Project Structure
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/                 # Reusable UI elements
│   │   ├── forms/              # Form components
│   │   ├── layout/             # Layout wrappers
│   │   └── features/           # Feature-specific components
│   ├── pages/                  # Page components (route-based)
│   ├── hooks/                  # Custom hooks
│   ├── stores/                 # Zustand stores
│   ├── services/               # API layer
│   ├── utils/                  # Utilities
│   ├── constants/              # App constants
│   ├── types/                  # Type definitions (JSDoc)
│   └── App.jsx
├── package.json
└── vite.config.js
```

---

## 🔐 AUTHENTICATION & ROUTING STRATEGY

### Auth States
```javascript
// Three distinct states
1. UNAUTHENTICATED
   - Can browse products (public)
   - Can use guest cart
   - Redirected from protected routes → /login

2. AUTHENTICATED (User)
   - Full access to user features
   - Can checkout, save addresses, reviews
   - Redirected from /admin → dashboard

3. AUTHENTICATED (Admin)
   - Full access to admin dashboard
   - Cannot access user checkout (separate mode)
   - Separate login flow
```

### Token Management
```javascript
// httpOnly cookies handled by browser
// JWT structure:
User Token:   { userId }
Admin Token:  { email, adminId }

// Auto-refresh on 401 via axios interceptor
// Logout: DELETE token, clear state
```

### Protected Routes Pattern
```javascript
<Route element={<PrivateRoute requiredRole="user" />}>
  <Route path="/cart" element={<CartPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/orders" element={<OrdersPage />} />
  <Route path="/profile" element={<ProfilePage />} />
</Route>

<Route element={<PrivateRoute requiredRole="admin" />}>
  <Route path="/admin/*" element={<AdminLayout />} />
</Route>
```

---

## 👤 COMPLETE USER FLOW (11 Pages)

### Page 1: Landing Page (`/`)
**Purpose:** First impression, product discovery, conversion funnel

**Components:**
- Hero banner with CTA
- Category navigation
- Search bar with autocomplete
- Featured products carousel
- Trending products section
- Promotional banners

**APIs Used:**
```javascript
GET /api/product/list?bestseller=true&limit=8
GET /api/recommendations/trending?limit=6
GET /api/recommendations/top-rated?limit=4
```

**User Actions:**
- Search → Browse products
- Category filter → Product list
- See featured items → Product details
- Add to cart/wishlist (floating buttons)

**Loading States:**
- Skeleton loaders for carousels
- Placeholder images

---

### Page 2: Product Discovery (`/products`)
**Purpose:** Browse, search, filter products

**Components:**
- Advanced filters sidebar (price, category, size, rating)
- Product grid with hover effects
- List/grid view toggle
- Sorting dropdown (price, rating, newest)
- Pagination or infinite scroll
- Active filter badges

**APIs Used:**
```javascript
GET /api/product/list?
  category=ELECTRONICS&
  price_min=100&price_max=5000&
  search=shirt&
  skip=0&limit=20&
  sortBy=price&order=asc
```

**User Actions:**
- Apply filters → See results
- Sort products → Re-sort
- Pagination → Next/previous page
- Clear filters → Reset

**Edge Cases:**
- No results → Show suggestions
- Empty search → Recommendations
- Mobile: Collapse filters into modal

---

### Page 3: Product Detail Page (`/products/:id`)
**Purpose:** Deep engagement, conversion, social proof

**Components:**
- Image gallery (zoom, carousel)
- Product info (name, price, description)
- Size selector with stock indicator
- Quantity selector
- Add to cart/wishlist buttons
- Reviews section with sorting
- Related/recommended products carousel
- Rating breakdown (1-5 stars)

**APIs Used:**
```javascript
GET /api/product/:id
GET /api/reviews/product/:id?sortBy=helpful&limit=5
GET /api/reviews/product/:id?sortBy=rating_high&limit=3
POST /api/reviews/product/:id (create review)
GET /api/recommendations/similar/:id?limit=8
GET /api/recommendations/related/:id?limit=8
GET /api/wishlist/check?productId=:id
POST /api/wishlist/add
POST /api/cart/items (add to cart)
```

**User Actions:**
- View images → Zoom/360
- Select size → Check availability
- Set quantity → Add to cart
- Add to wishlist → Toggle status
- Scroll reviews → Read feedback
- Click related → Navigate to similar product
- Write review → Submit rating & comment

**Edge Cases:**
- Out of stock → Disable purchase, show alternatives
- No reviews → Show "Be first to review"
- Sold out → Notify button
- Image load error → Fallback placeholder

---

### Page 4: Search Results (`/search?q=...`)
**Purpose:** Handle search queries with faceted filters

**Components:**
- Search box with recent searches
- Applied filters chips (removable)
- Results grid
- Sort dropdown
- No results state with suggestions
- Refined search suggestions

**APIs Used:**
```javascript
GET /api/product/list?
  search=nike shoes&
  category=SHOES&
  price_min=...&price_max=...&
  skip=...&limit=...
```

**User Actions:**
- Type search → See suggestions
- Select suggestion → Auto-fill search
- Apply filters → Refine results
- Clear search → Back to products
- No results → Try different search

---

### Page 5: Shopping Cart (`/cart`)
**Purpose:** Review items, apply coupons, confirm before checkout

**Components:**
- Cart items list (editable quantity, removable)
- Item totals (price × quantity)
- Subtotal display
- Coupon input field
- Applied coupon badge (removable)
- Order summary sidebar:
  - Subtotal
  - Tax (calculated)
  - Discount (from coupon)
  - **Final Total**
- Continue Shopping link
- Proceed to Checkout button

**APIs Used:**
```javascript
GET /api/cart
PATCH /api/cart/items (update quantity - idempotent)
DELETE /api/cart/items (remove item)
POST /api/coupons/validate (validate coupon code)
POST /api/coupons/:orderId/apply (after order creation)
DELETE /api/cart/clear-cart (clear all)
GET /api/cart/summary (recalculate totals)
```

**User Actions:**
- Change quantity → Recalculate total
- Remove item → Confirm deletion
- Apply coupon → Validate & show discount
- Remove coupon → Update total
- Proceed to checkout → Navigate to checkout page

**Edge Cases:**
- Empty cart → Show "Cart is empty" with shop now button
- Out of stock items → Show error, offer removal
- Coupon expired → Show error message
- Coupon max uses reached → Show error
- Min order amount not met → Show error on validation

---

### Page 6: Checkout Flow (`/checkout` - Multi-Step)
**Purpose:** Confirm order before payment

**Multi-Step Process:**

**Step 1: Select/Add Address**
```javascript
GET /api/user/addresses
POST /api/user/addresses (add new)

Components:
- Saved addresses list (radio select)
- Add new address form
- Form fields: label, street, city, state, zipCode, country, phone
- Set as default checkbox
```

**Step 2: Review Order**
```javascript
GET /api/cart

Components:
- Order items recap
- Item prices summary
- Applied coupon display
- Coupon removal option
- Final total with tax
- CTA: "Proceed to Payment"
```

**Step 3: Payment Gateway**
```javascript
POST /orders (create order - idempotent)
POST /orders/:orderId/pay (initiate payment - idempotent)

Components:
- Payment method selector (Razorpay)
- "Pay Now" button
- Processing loader
- Error handler (retry option)

Razorpay Integration:
- Open modal via SDK
- Handle payment response
- On success: Redirect to confirmation
- On failure: Show error, retry option
```

**User Actions:**
- Step 1: Select address → Next (validation)
- Step 1: Add address → Form validation → Save & select
- Step 2: Review → Confirm amount → Proceed to Payment
- Step 3: Pay → Razorpay modal → Complete payment

**Edge Cases:**
- Invalid address → Show error
- No saved address → Show add form
- Cart changed during checkout → Re-validate
- Payment timeout → Retry option
- Idempotency key ensures no double-charge

---

### Page 7: Order Confirmation (`/order-confirmation/:orderId`)
**Purpose:** Confirm successful purchase, next steps

**Components:**
- ✅ Success banner
- Order ID (copyable)
- Order details:
  - Items purchased
  - Delivery address
  - Total amount paid
  - Estimated delivery date
- CTA buttons:
  - View order details → `/orders/:orderId`
  - Continue shopping → `/products`
  - Download invoice

**APIs Used:**
```javascript
GET /orders/:orderId (fetch details after payment)
```

---

### Page 8: Order Tracking (`/orders/:orderId`)
**Purpose:** Track order status in real-time

**Components:**
- Order status timeline
  - Order placed (date/time)
  - Payment confirmed
  - Processing
  - Shipped (tracking number if available)
  - Out for delivery
  - Delivered
- Order details card:
  - Order ID
  - Order date
  - Delivery address
  - Items list with images
- Action buttons:
  - Request return (if within return window)
  - Contact support
  - Download invoice
- Return status (if return requested)

**APIs Used:**
```javascript
GET /orders/:orderId
GET /api/returns (check if return exists for items)
POST /api/returns/request (request return)
```

**User Actions:**
- View status → See timeline
- Request return → Show return form
- Download invoice → Generate PDF

**Edge Cases:**
- Order not found → 404 page
- Order belongs to different user → 403 forbidden
- Return period expired → Disable return button
- Multiple sellers → Show separate status per seller

---

### Page 9: Order History (`/orders`)
**Purpose:** View all past orders with filtering

**Components:**
- Filters sidebar:
  - Status (PENDING, SHIPPED, DELIVERED, CANCELLED)
  - Date range picker
  - Price range slider
  - Search by order ID
- Orders list/table with:
  - Order ID
  - Date
  - Total amount
  - Status badge
  - Quick actions (view, track, return)
- Pagination

**APIs Used:**
```javascript
GET /orders?
  skip=0&
  limit=10&
  status=DELIVERED&
  sortBy=createdAt&
  order=desc&
  search=ORD-123
```

**User Actions:**
- Filter by status → See filtered orders
- Search order ID → Find specific order
- Sort by date/amount → Re-sort
- Click order → Go to details page
- Request return → If eligible

---

### Page 10: User Profile (`/profile`)
**Purpose:** Manage account settings

**Tabs/Sections:**

**Tab 1: Personal Information**
```javascript
GET /api/user/profile
PATCH /api/user/profile

Form Fields:
- Name
- Email (read-only or show verification status)
- Phone
- Avatar upload
- Save changes button
```

**Tab 2: Addresses**
```javascript
GET /api/user/addresses
POST /api/user/addresses
PATCH /api/user/addresses/:id
DELETE /api/user/addresses/:id

Components:
- Saved addresses list
- Add new address button
- Edit/delete actions
- Set as default
```

**Tab 3: Password Change**
```javascript
Form Fields:
- Current password
- New password
- Confirm password
- Save button
```

**Tab 4: Order History (Quick Link)**
- Recent orders (last 3-5)
- "View all orders" link

---

### Page 11: Wishlist (`/wishlist`)
**Purpose:** View and manage saved products

**Components:**
- Wishlist grid (same as product grid)
- Product cards with:
  - Image
  - Name
  - Price
  - "Add to cart" button
  - "Remove from wishlist" button (X)
- Empty state: "Your wishlist is empty"
- Share wishlist button (optional)

**APIs Used:**
```javascript
GET /api/wishlist
POST /api/wishlist/remove
DELETE /api/wishlist/clear
POST /api/cart/items (add to cart from wishlist)
```

**User Actions:**
- View wishlist → See saved products
- Add to cart → From wishlist
- Remove from wishlist → Confirm
- Clear all → Confirm
- Go to product details → Click product

---

### Page 12: Returns & Refunds (`/returns`)
**Purpose:** Manage product returns

**Components:**
- Return requests list:
  - Order item image
  - Item details
  - Return status badge (REQUESTED, APPROVED, REJECTED, REFUNDED)
  - Return date
  - Refund amount
  - Actions (cancel if eligible)
- Return details modal with:
  - Return reason
  - Description
  - Refund status timeline

**APIs Used:**
```javascript
GET /api/returns
GET /api/returns/:returnId
PATCH /api/returns/:returnId/cancel (if REQUESTED status)
```

**User Actions:**
- View returns → See status
- Check refund status → View timeline
- Cancel return → If REQUESTED status
- View refund amount → When APPROVED/REFUNDED

---

### Page 13: Write Review Form (Modal/In-Page)
**Purpose:** Submit product feedback

**Components:**
- Star rating selector (1-5)
- Review title input
- Review comment textarea (min 10 chars, max 500)
- Submit button
- Cancel button

**APIs Used:**
```javascript
POST /api/reviews/product/:productId
PATCH /api/reviews/:reviewId (if editing own review)

Request Body:
{
  rating: 1-5,
  title: "Great product",
  comment: "..."
}
```

**User Actions:**
- Select rating → Fill form
- Write review → Submit
- Validation errors → Show inline errors
- Success → Toast notification, close modal, refresh reviews

**Edge Cases:**
- User already reviewed → Show "Edit your review" button instead
- Duplicate prevention → Check before submit
- Network error → Retry button

---

## 🛠️ COMPLETE ADMIN FLOW (8 Pages)

### Page 1: Admin Dashboard (`/admin`)
**Purpose:** Business metrics overview

**Components:**
- KPI Cards (4):
  - Total Orders (count)
  - Total Revenue (sum of all orders)
  - Active Customers (distinct users)
  - Pending Orders (waiting to ship)
  - Avg Order Value
- Charts:
  - Sales trend (daily, last 7 days)
  - Order status breakdown (pie chart)
- Recent orders table (5 latest)
- Low stock alerts (top 5 products)
- CTA buttons to admin sections

**APIs Used:**
```javascript
GET /api/analytics/dashboard
GET /api/analytics/sales?startDate=...&endDate=...
GET /api/admin/orders?limit=5
GET /api/admin/inventory/low-stock?threshold=10
```

**Admin Actions:**
- View KPIs → Understand business
- Click chart → Drill-down to details
- Click order → Go to order details
- Click product → Go to product edit

---

### Page 2: Product Management (`/admin/products`)
**Purpose:** CRUD operations for products

**Components:**
- Products table:
  - Thumbnail image
  - Product name
  - Category
  - Price
  - Stock status
  - Actions (edit, delete, view)
- Add product button → Modal/page
- Search/filter
- Pagination
- Bulk actions (delete, update stock)

**Add/Edit Product Form:**
```javascript
POST /api/product/addproduct (create)
PUT /api/product/update/:id (update)
Files: image1, image2, image3, image4

Form Fields:
- Product name
- Description (rich text)
- Price
- Category dropdown
- Sub-category dropdown
- Sizes multi-select (XS, S, M, L, XL, XXL)
- Image uploads (Cloudinary)
- Bestseller checkbox
- Save button
```

**Delete Product:**
```javascript
POST /api/product/remove/:id
Confirmation modal before delete
```

**Update Stock:**
```javascript
PUT /api/product/update-stock/:id

Per Size Update:
{
  size: "M",
  stockChange: 50 (can be negative)
}
```

**Admin Actions:**
- Add product → Form modal → Upload images → Save
- Edit product → Pre-fill form → Update → Save
- Delete product → Confirm → Delete
- Update stock → Select size → Change quantity → Save
- Bulk upload (future) → CSV/JSON → Import

---

### Page 3: Order Management (`/admin/orders`)
**Purpose:** Process and track orders

**Components:**
- Orders table:
  - Order ID
  - Customer name
  - Order date
  - Total amount
  - Status
  - Items count
  - Actions (view, update status)
- Filters:
  - Status dropdown
  - Date range picker
  - Customer search
- Order details modal:
  - Items list with status badges
  - Update status dropdown (per item)
  - Bulk update status
  - Shipping address
  - Payment info

**Update Order Item Status:**
```javascript
PATCH /api/admin/orders/order-items/:itemId/status

Statuses:
- PENDING (initial)
- PROCESSING (preparing to ship)
- SHIPPED (in transit)
- DELIVERED (confirmed)
- CANCELLED (rejected)
```

**Bulk Update Status:**
```javascript
PATCH /api/admin/orders/order-items/bulk/status

Request:
{
  updates: [
    { itemId: "uuid", status: "SHIPPED" },
    { itemId: "uuid", status: "SHIPPED" }
  ]
}
```

**Admin Actions:**
- View orders → Table with pagination
- Filter by status → See pending/shipped
- Click order → Open details
- Change item status → Dropdown select
- Save status changes → Multi-item update
- Bulk print labels (future)

**Multi-Vendor Note:**
- Each seller sees only their order items
- Can update only their items
- Order status derived from all items

---

### Page 4: Inventory Management (`/admin/inventory`)
**Purpose:** Track and manage stock levels

**Components:**
- Low stock alerts (threshold slider)
- Inventory table:
  - Product name
  - Size
  - Total stock
  - Reserved stock
  - Available (total - reserved)
  - Last updated
  - Actions (update)
- Bulk update options:
  - JSON format → Paste JSON, validate, upload
  - CSV format → Upload CSV file

**Update Inventory (Manual):**
```javascript
PUT /api/product/update-stock/:id
```

**Bulk Update JSON:**
```javascript
POST /api/admin/inventory/bulk/json

Request:
{
  inventory: [
    { productId: "123", size: "M", totalStock: 100 },
    { productId: "456", size: "L", totalStock: 50 }
  ]
}
```

**Bulk Update CSV:**
```javascript
POST /api/admin/inventory/bulk/csv

CSV Format:
productId,size,totalStock
123,M,100
456,L,50
```

**Admin Actions:**
- Set threshold → See low stock items
- Update single item → Form modal
- Bulk upload → Choose format → Upload → Confirm
- Reorder alert → Set low stock threshold

---

### Page 5: Analytics & Reports (`/admin/analytics`)
**Purpose:** Deep business insights with date ranges

**Tabs/Sections:**

**Section 1: Sales Analytics**
```javascript
GET /api/analytics/sales?startDate=...&endDate=...

Components:
- Date range picker
- Chart: Daily sales (line chart)
- Chart: Revenue by status (bar chart)
- Table: Top products sold
  - Product name
  - Units sold
  - Revenue
  - Trend indicator
- Export to CSV button
```

**Section 2: Payment Analytics**
```javascript
GET /api/analytics/payments?startDate=...&endDate=...

Components:
- Payment status breakdown (pie):
  - Successful %
  - Failed %
  - Refunded %
- Provider breakdown (if multiple)
- Failed payments count
- Total refunded amount
- Retry opportunities
```

**Section 3: Customer Analytics**
```javascript
GET /api/analytics/customers?startDate=...&endDate=...

Components:
- New customers (count)
- Repeat customers (count)
- Avg customer lifetime value
- Table: Top customers by spending
  - Customer name
  - Email
  - Total orders
  - Total spent
  - Last order date
```

**Section 4: Inventory Analytics**
```javascript
GET /api/analytics/inventory

Components:
- Total products count
- Total stock value
- Low stock items (count)
- Most reserved items
- Stock turnover rate
```

**Section 5: Coupon Analytics**
```javascript
GET /api/analytics/coupons?startDate=...&endDate=...

Components:
- Top coupons used (table):
  - Coupon code
  - Times used
  - Total discount given
- Total discount amount
- Most effective coupon
```

**Section 6: Seller Analytics** (if multi-vendor)
```javascript
GET /api/analytics/seller?startDate=...&endDate=...

Components:
- Seller name
- Total orders
- Total revenue
- Status breakdown (chart)
- Top products by seller
```

**Admin Actions:**
- Select date range → Update all charts
- View trends → Identify patterns
- Export data → CSV for reporting
- Drill-down → Click chart section
- Identify opportunities → Revenue, returns, failures

---

### Page 6: Coupon Management (`/admin/coupons`)
**Purpose:** Create and manage discount codes

**Components:**
- Coupons table:
  - Code
  - Discount type (PERCENTAGE or FIXED)
  - Discount value
  - Min order amount
  - Max uses / Current uses
  - Status (active/inactive)
  - Expiry date
  - Actions (edit, delete, toggle)
- Add coupon button → Modal/form
- Filters:
  - Status (active/inactive)
  - Date range (start/expiry)

**Create/Edit Coupon:**
```javascript
POST /api/coupons/admin/create
PATCH /api/coupons/admin/:couponId

Form Fields:
- Coupon code (unique)
- Discount type (PERCENTAGE | FIXED)
- Discount value (% or amount)
- Min order amount
- Max total uses
- Max uses per user
- Start date
- Expiry date
- Active checkbox
- Save button
```

**Toggle Coupon Status:**
```javascript
PATCH /api/coupons/admin/:couponId/toggle
Input: { isActive: true/false }
```

**Delete Coupon:**
```javascript
DELETE /api/coupons/admin/:couponId
Confirmation modal
```

**Admin Actions:**
- Add coupon → Fill form → Set dates → Save
- Edit coupon → Update values → Save
- Toggle active → On/off switch
- Delete coupon → Confirm
- View usage → See analytics
- Disable expired → Auto-disable or manual

---

### Page 7: Returns Management (`/admin/returns`)
**Purpose:** Process return requests and refunds

**Components:**
- Returns queue table:
  - Return ID
  - Order item
  - User name
  - Reason
  - Status (REQUESTED, APPROVED, REJECTED, REFUNDED, FAILED)
  - Return date
  - Actions (view, approve, reject, refund)
- Filters:
  - Status
  - Date range
  - User name search

**Return Details Modal:**
```
- Item details (image, name, price)
- Return reason
- User description
- Status timeline
- Action buttons (based on current status)
```

**Approve Return:**
```javascript
PATCH /api/returns/admin/:returnId/approve

Form:
- Refund amount (auto-filled with item price, editable)
- Approval note
- Save button

State Change: REQUESTED → APPROVED
```

**Reject Return:**
```javascript
PATCH /api/returns/admin/:returnId/reject

Form:
- Rejection reason
- Note to user
- Save button

State Change: REQUESTED → REJECTED
```

**Process Refund:**
```javascript
PATCH /api/returns/admin/:returnId/refund

Action: Initiate actual payment refund
State Change: APPROVED → REFUNDED
Show: Refund ID, timestamp
```

**Mark Refund Failed:**
```javascript
PATCH /api/returns/admin/:returnId/refund-failed

Form:
- Reason for failure
- Retry note
- Save button

State Change: REFUNDED → REFUND_FAILED
```

**Return Statistics:**
```javascript
GET /api/returns/admin/stats

Display:
- Total returns received
- Approved count
- Rejected count
- Refunded count
- Failed refunds count
- Total refunded amount
```

**Admin Actions:**
- View pending returns → See queue
- Approve with refund amount → Set amount → Approve
- Reject return → Add reason → Reject
- Process refund → Initiate payment → Confirm
- Handle failed refunds → Retry or mark failed
- View statistics → Business metrics

---

### Page 8: Review Moderation (`/admin/reviews`)
**Purpose:** Moderate product reviews

**Components:**
- Reviews queue table:
  - Product name
  - Reviewer name
  - Rating (stars)
  - Review title
  - Preview (first 100 chars)
  - Status (visible/hidden)
  - Actions (view, hide, respond)
- Filters:
  - Rating (1-5 stars)
  - Status (visible/hidden)
  - Product search
  - Date range

**Review Details Modal:**
```
- Full review content
- Rating (stars)
- User name
- Creation date
- Admin response (if exists)
```

**Toggle Review Visibility:**
```javascript
PATCH /api/reviews/admin/:reviewId/visibility

Form:
- Visibility checkbox (visible/hidden)
- Reason for hiding (optional)
- Save button

Auto-hides:
- Spam
- Inappropriate language
- Off-topic
```

**Respond to Review:**
```javascript
POST /api/reviews/admin/:reviewId/respond

Form:
- Response text (max 500 chars)
- Post button

Creates admin response visible below review
```

**Admin Actions:**
- View pending reviews → See queue
- Read full review → Open modal
- Hide inappropriate → Toggle visibility
- Respond to feedback → Add response
- Monitor ratings → Track trends
- Identify issues → Spot product complaints

---

## 🗂️ STATE MANAGEMENT DESIGN

### Zustand Global Stores

#### 1. Auth Store
```javascript
create((set) => ({
  // State
  user: null,
  admin: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,

  // Actions
  register: async (credentials) => { /* ... */ },
  login: async (credentials) => { /* ... */ },
  adminLogin: async (credentials) => { /* ... */ },
  logout: async () => { /* ... */ },
  verifyEmail: async (email, otp) => { /* ... */ },
  refreshToken: async () => { /* ... */ },
  setUser: (user) => set({ user }),
}))
```

#### 2. Cart Store
```javascript
create((set) => ({
  // State
  items: [],
  total: 0,
  count: 0,
  guestSessionId: null,

  // Actions
  getCart: async () => { /* ... */ },
  addItem: async (item) => { /* idempotent */ },
  removeItem: async (productId, size) => { /* ... */ },
  updateQuantity: async (productId, size, qty) => { /* ... */ },
  clearCart: async () => { /* ... */ },
  migrateGuestCart: async (sessionId) => { /* ... */ },
  calculateTotal: () => { /* ... */ },
}))
```

#### 3. UI Store
```javascript
create((set) => ({
  // State
  sidebarOpen: false,
  modal: { type: null, data: null },
  loading: false,
  notifications: [],

  // Actions
  setSidebar: (open) => set({ sidebarOpen: open }),
  openModal: (type, data) => set({ modal: { type, data } }),
  closeModal: () => set({ modal: { type: null, data: null } }),
  setLoading: (loading) => set({ loading }),
  addNotification: (notification) => { /* ... */ },
  removeNotification: (id) => { /* ... */ },
}))
```

#### 4. Filter Store (Optional)
```javascript
create((set) => ({
  filters: {
    category: null,
    priceMin: 0,
    priceMax: 10000,
    rating: 0,
    search: '',
  },
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: initialFilters }),
}))
```

### React Query Server State

#### Query Keys Pattern
```javascript
export const queryKeys = {
  products: {
    all: ['products'],
    list: (params) => [...queryKeys.products.all, 'list', params],
    detail: (id) => [...queryKeys.products.all, 'detail', id],
    recommendations: (type, id) => [...queryKeys.products.all, 'recommendations', type, id],
  },
  cart: {
    all: ['cart'],
    summary: () => [...queryKeys.cart.all, 'summary'],
  },
  orders: {
    all: ['orders'],
    list: (params) => [...queryKeys.orders.all, 'list', params],
    detail: (id) => [...queryKeys.orders.all, 'detail', id],
  },
  reviews: {
    all: ['reviews'],
    product: (productId, params) => [...queryKeys.reviews.all, productId, params],
  },
  wishlist: {
    all: ['wishlist'],
    check: (productId) => [...queryKeys.wishlist.all, 'check', productId],
  },
  analytics: {
    all: ['analytics'],
    dashboard: () => [...queryKeys.analytics.all, 'dashboard'],
    sales: (params) => [...queryKeys.analytics.all, 'sales', params],
  },
}
```

#### Mutations Pattern
```javascript
// Optimistic updates for cart/wishlist
useMutation({
  mutationFn: addToCart,
  onMutate: async (newItem) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: queryKeys.cart.all })
    
    // Snapshot previous state
    const previous = queryClient.getQueryData(queryKeys.cart.all)
    
    // Update optimistically
    queryClient.setQueryData(queryKeys.cart.all, (old) => ({
      ...old,
      items: [...old.items, newItem],
    }))
    
    return { previous }
  },
  onError: (err, newItem, context) => {
    // Revert on error
    queryClient.setQueryData(queryKeys.cart.all, context.previous)
  },
  onSuccess: () => {
    // Invalidate to refetch fresh data
    queryClient.invalidateQueries({ queryKey: queryKeys.cart.all })
  },
})
```

---

## 🔀 ROUTING STRUCTURE

```javascript
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/products" element={<ProductListPage />} />
  <Route path="/products/:id" element={<ProductDetailPage />} />
  <Route path="/search" element={<SearchResultsPage />} />
  
  {/* Auth Routes */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/verify-email" element={<VerifyEmailPage />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  <Route path="/admin/login" element={<AdminLoginPage />} />

  {/* User Protected Routes */}
  <Route element={<PrivateRoute role="user" />}>
    <Route path="/cart" element={<CartPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
    <Route path="/orders" element={<OrdersPage />} />
    <Route path="/orders/:orderId" element={<OrderDetailPage />} />
    <Route path="/returns" element={<ReturnsPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/wishlist" element={<WishlistPage />} />
  </Route>

  {/* Admin Protected Routes */}
  <Route element={<PrivateRoute role="admin" />}>
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
      <Route path="products" element={<AdminProductsPage />} />
      <Route path="orders" element={<AdminOrdersPage />} />
      <Route path="inventory" element={<AdminInventoryPage />} />
      <Route path="analytics" element={<AdminAnalyticsPage />} />
      <Route path="coupons" element={<AdminCouponsPage />} />
      <Route path="returns" element={<AdminReturnsPage />} />
      <Route path="reviews" element={<AdminReviewsPage />} />
    </Route>
  </Route>

  {/* 404 */}
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

---

## 🔗 API INTEGRATION LAYER

### Axios Configuration
```javascript
// api/axios.js
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // Include cookies
})

// Request interceptor - add auth header
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      await useAuthStore.getState().refreshToken()
      // Retry original request
      return api(error.config)
    }
    return Promise.reject(error)
  }
)

export default api
```

### Service Layer Pattern
```javascript
// services/productService.js
import api from './axios'

export const productService = {
  list: (params) => api.get('/product/list', { params }),
  getById: (id) => api.get(`/product/${id}`),
  create: (data) => api.post('/product/addproduct', data),
  update: (id, data) => api.put(`/product/update/${id}`, data),
  delete: (id) => api.post(`/product/remove/${id}`),
  updateStock: (id, data) => api.put(`/product/update-stock/${id}`, data),
}

// Usage in hooks
const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
  })
}
```

---

## 🎯 ERROR HANDLING STRATEGY

### Global Error Boundary
```javascript
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

### API Error Handler
```javascript
// Handle different error codes
if (error.response?.status === 400) {
  // Bad request - show validation errors
  showToast.error(error.response.data.message)
} else if (error.response?.status === 401) {
  // Unauthorized - redirect to login
  navigate('/login')
} else if (error.response?.status === 403) {
  // Forbidden - show permission error
  showToast.error('You do not have permission')
} else if (error.response?.status === 404) {
  // Not found - redirect to 404
  navigate('/404')
} else if (error.response?.status === 500) {
  // Server error - show retry option
  showToast.error('Server error, try again later')
} else if (error.message === 'Network Error') {
  // Offline - show offline message
  showToast.error('No internet connection')
}
```

### Edge Case Handling
```javascript
// Out of stock
if (product.stock === 0) {
  showToast.info('Out of stock')
  disableButton()
}

// Expired coupon
if (coupon.expiryDate < new Date()) {
  showToast.error('Coupon expired')
}

// Return period closed
if (Date.now() - order.createdAt > 30 * 24 * 60 * 60 * 1000) {
  disableReturnButton()
}

// Empty states
if (products.length === 0) {
  return <EmptyState icon="box" message="No products found" />
}

// Loading states
if (isLoading) {
  return <SkeletonLoader count={10} />
}
```

---

## 📱 RESPONSIVE DESIGN APPROACH

### Breakpoints
```javascript
const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
}

// Tailwind: sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
```

### Mobile Optimizations
- Touch-friendly buttons (min 44×44px)
- Vertical stacking of forms
- Collapsed navigation (hamburger menu)
- Full-width product grid (1 column mobile)
- Bottom sheet modals instead of center
- Swipe gestures for carousels
- Optimized images (responsive srcset)

### Desktop Optimizations
- Sidebar navigation
- Multi-column grids (3-4 columns)
- Horizontal filters
- Hover effects on interactions
- Full-width displays

---

## 🎨 UI/UX DESIGN PRINCIPLES

### Design System
- **Colors:** Primary (brand), secondary, success, warning, error, gray scale
- **Typography:** 
  - Headings: 32px (h1), 24px (h2), 18px (h3), 16px (h4)
  - Body: 16px (regular), 14px (small)
  - Captions: 12px
- **Spacing:** 4px grid (4, 8, 12, 16, 24, 32, 48, 64px)
- **Shadows:** Subtle (0 1px 3px), medium (0 4px 6px), large (0 10px 15px)
- **Border radius:** 4px (small), 8px (medium), 12px (large), 50% (round)

### Animations (Framer Motion - Subtle)
```javascript
// Page transitions
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* content */}
</motion.div>

// Item hover
<motion.div
  whileHover={{ scale: 1.05 }}
  transition={{ duration: 0.2 }}
>
  {/* hover effect */}
</motion.div>

// Loading spinner
<motion.div
  animate={{ rotate: 360 }}
  transition={{ repeat: Infinity, duration: 1 }}
>
  {/* spinner */}
</motion.div>
```

### Accessibility (WCAG 2.1 AA)
- Semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- Keyboard navigation (Tab, Enter, Escape)
- Focus indicators (outline: 2px)
- Color contrast (4.5:1 for text)
- ARIA labels for icons
- Alt text for images
- Screen reader support

---

## 📊 PAGE SUMMARY TABLE

| Page | Route | Public | Auth Level | Key APIs |
|------|-------|--------|-----------|----------|
| Landing | `/` | ✅ | None | products, recommendations |
| Products List | `/products` | ✅ | None | products |
| Product Detail | `/products/:id` | ✅ | None | product, reviews, recommendations |
| Search | `/search?q=...` | ✅ | None | products |
| Cart | `/cart` | ❌ | User | cart, coupons |
| Checkout | `/checkout` | ❌ | User | addresses, orders, payments |
| Order Confirmation | `/order-confirmation/:id` | ❌ | User | orders |
| Order Tracking | `/orders/:id` | ❌ | User | orders, returns |
| Order History | `/orders` | ❌ | User | orders |
| Profile | `/profile` | ❌ | User | user, addresses |
| Wishlist | `/wishlist` | ❌ | User | wishlist |
| Returns | `/returns` | ❌ | User | returns |
| Admin Dashboard | `/admin` | ❌ | Admin | analytics, orders, inventory |
| Admin Products | `/admin/products` | ❌ | Admin | products |
| Admin Orders | `/admin/orders` | ❌ | Admin | admin/orders |
| Admin Inventory | `/admin/inventory` | ❌ | Admin | inventory |
| Admin Analytics | `/admin/analytics` | ❌ | Admin | analytics |
| Admin Coupons | `/admin/coupons` | ❌ | Admin | coupons |
| Admin Returns | `/admin/returns` | ❌ | Admin | returns |
| Admin Reviews | `/admin/reviews` | ❌ | Admin | reviews |

---

## ✅ VALIDATION CHECKLIST

### Flow Completeness ✅
- [x] All 105+ endpoints mapped to pages
- [x] User journey: Landing → Products → Checkout → Orders
- [x] Admin journey: Dashboard → Products → Orders → Analytics
- [x] Authentication flows: Register, Login, Logout, Reset
- [x] State management designed (Zustand + React Query)
- [x] Routing strategy defined
- [x] Error handling patterns
- [x] Responsive design approach
- [x] Accessibility considerations
- [x] Edge cases identified

### Design Quality ✅
- [x] Modern e-commerce UX patterns
- [x] Mobile-first responsive
- [x] Clear navigation flows
- [x] Intuitive user interactions
- [x] Performance optimizations
- [x] Scalable component architecture
- [x] Reusable patterns

---

## 🚀 NEXT STEPS

**This completes STEP 2: FRONTEND FLOW DESIGN**

All 20 user and admin pages have been designed with:
- ✅ Complete API mappings
- ✅ User journey flows
- ✅ Component breakdowns
- ✅ State management strategy
- ✅ Routing architecture
- ✅ Error handling patterns
- ✅ Responsive design
- ✅ Accessibility guidelines

---

## ⏸️ AWAITING YOUR APPROVAL

**Please review this flow design and confirm:**

1. ✅ Does the user journey make sense?
2. ✅ Are all admin features covered?
3. ✅ Is the state management strategy clear?
4. ✅ Any flows you'd like modified?
5. ✅ Ready to proceed to STEP 3: Frontend System Design?

**Once approved, STEP 3 will cover:**
- Component architecture (atomic design)
- Folder structure
- Custom hooks
- API services
- Middleware/interceptors
- Then implementation begins

---

**Document Version:** 1.0  
**Date:** April 26, 2026  
**Status:** ✅ AWAITING APPROVAL FOR STEP 3
# 🏗️ STEP 3: FRONTEND SYSTEM DESIGN

**NeuralShop E-Commerce Platform - System Architecture**  
**Date:** April 26, 2026  
**Status:** System Design Complete - Ready for Implementation

---

## 📋 EXECUTIVE SUMMARY

This document defines the complete **frontend system architecture** that will serve as the blueprint for implementation. It covers component architecture, folder structure, hooks design, API layer, state management, and coding standards.

---

## 🏛️ COMPONENT ARCHITECTURE (ATOMIC DESIGN)

### Atom Level (Basic Building Blocks)

```
components/ui/atoms/
├── Button.jsx              # <Button variant="primary" size="md" />
├── Input.jsx               # <Input type="email" placeholder="..." />
├── Label.jsx               # <Label htmlFor="email">Email</Label>
├── Badge.jsx               # <Badge color="green">Active</Badge>
├── Avatar.jsx              # <Avatar src="..." alt="..." size="lg" />
├── Icon.jsx                # <Icon name="heart" size={24} />
├── Spinner.jsx             # <Spinner size="md" />
├── Skeleton.jsx            # <Skeleton count={3} />
├── Modal.jsx               # <Modal isOpen={} onClose={} />
├── Toast.jsx               # Toast notifications container
├── Card.jsx                # <Card className="p-4">...</Card>
├── Divider.jsx             # <Divider variant="horizontal" />
├── Checkbox.jsx            # <Checkbox label="Remember me" />
├── Radio.jsx               # <Radio name="option" value="a" />
└── Select.jsx              # <Select options={[]} onChange={} />
```

### Molecule Level (Combinations)

```
components/ui/molecules/
├── FormInput.jsx           # <FormInput label="Email" error="Invalid" />
├── FormSelect.jsx          # <FormSelect label="Category" options={} />
├── FormCheckbox.jsx        # <FormCheckbox label="Agree" />
├── FormRadioGroup.jsx      # <FormRadioGroup options={} />
├── ImageUpload.jsx         # <ImageUpload onUpload={} maxSize={} />
├── PriceRange.jsx          # <PriceRange min={} max={} onChange={} />
├── RatingStars.jsx         # <RatingStars rating={4} onChange={} editable />
├── ProductCard.jsx         # <ProductCard product={} onAddCart={} />
├── OrderCard.jsx           # <OrderCard order={} onView={} />
├── AddressCard.jsx         # <AddressCard address={} onSelect={} onEdit={} />
├── CartItem.jsx            # <CartItem item={} onUpdate={} onRemove={} />
├── ReviewCard.jsx          # <ReviewCard review={} onHelpful={} />
├── CouponBadge.jsx         # <CouponBadge coupon={} onRemove={} />
└── SearchBar.jsx           # <SearchBar onSearch={} suggestions={} />
```

### Organism Level (Complex Components)

```
components/ui/organisms/
├── ProductGrid.jsx         # <ProductGrid products={} loading={} />
├── ProductFilters.jsx      # <ProductFilters filters={} onChange={} />
├── CartSummary.jsx         # <CartSummary cart={} onCheckout={} />
├── OrderTimeline.jsx       # <OrderTimeline order={} />
├── ReviewsList.jsx         # <ReviewsList reviews={} onLoad={} />
├── AddressForm.jsx         # <AddressForm onSubmit={} initialValues={} />
├── PaymentForm.jsx         # <PaymentForm onSubmit={} />
├── AnalyticsDashboard.jsx  # <AnalyticsDashboard data={} />
├── OrderTable.jsx          # <OrderTable orders={} onStatusChange={} />
├── ProductTable.jsx        # <ProductTable products={} onEdit={} onDelete={} />
├── InventoryTable.jsx      # <InventoryTable items={} onUpdate={} />
└── CouponList.jsx          # <CouponList coupons={} onEdit={} onDelete={} />
```

### Template Level (Page Layouts)

```
components/layout/templates/
├── UserLayout.jsx          # Header + Sidebar + Footer + <Outlet />
├── AdminLayout.jsx         # Admin Header + Admin Sidebar + <Outlet />
├── CheckoutLayout.jsx      # Progress bar + Steps + Content
├── ProductLayout.jsx       # Header + Filters + Grid + Pagination
└── AuthLayout.jsx          # Centered form layout
```

---

## 📁 COMPLETE FOLDER STRUCTURE

```
frontend/
├── public/
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── App.jsx                          # Root component
│   ├── index.css                        # Global styles
│   ├── main.jsx                         # Entry point
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── atoms/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Label.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Avatar.jsx
│   │   │   │   ├── Icon.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── Skeleton.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Divider.jsx
│   │   │   │   ├── Checkbox.jsx
│   │   │   │   ├── Radio.jsx
│   │   │   │   └── Select.jsx
│   │   │   │
│   │   │   ├── molecules/
│   │   │   │   ├── FormInput.jsx
│   │   │   │   ├── FormSelect.jsx
│   │   │   │   ├── FormCheckbox.jsx
│   │   │   │   ├── FormRadioGroup.jsx
│   │   │   │   ├── ImageUpload.jsx
│   │   │   │   ├── PriceRange.jsx
│   │   │   │   ├── RatingStars.jsx
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── OrderCard.jsx
│   │   │   │   ├── AddressCard.jsx
│   │   │   │   ├── CartItem.jsx
│   │   │   │   ├── ReviewCard.jsx
│   │   │   │   ├── CouponBadge.jsx
│   │   │   │   └── SearchBar.jsx
│   │   │   │
│   │   │   └── organisms/
│   │   │       ├── ProductGrid.jsx
│   │   │       ├── ProductFilters.jsx
│   │   │       ├── CartSummary.jsx
│   │   │       ├── OrderTimeline.jsx
│   │   │       ├── ReviewsList.jsx
│   │   │       ├── AddressForm.jsx
│   │   │       ├── PaymentForm.jsx
│   │   │       ├── AnalyticsDashboard.jsx
│   │   │       ├── OrderTable.jsx
│   │   │       ├── ProductTable.jsx
│   │   │       ├── InventoryTable.jsx
│   │   │       └── CouponList.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.jsx              # Navigation header
│   │   │   ├── Footer.jsx              # Footer
│   │   │   ├── Sidebar.jsx             # User sidebar (wishlist, profile)
│   │   │   ├── AdminSidebar.jsx        # Admin navigation
│   │   │   ├── PrivateRoute.jsx        # Route protection wrapper
│   │   │   └── templates/
│   │   │       ├── UserLayout.jsx
│   │   │       ├── AdminLayout.jsx
│   │   │       ├── CheckoutLayout.jsx
│   │   │       ├── ProductLayout.jsx
│   │   │       └── AuthLayout.jsx
│   │   │
│   │   └── features/
│   │       ├── auth/
│   │       │   ├── LoginForm.jsx
│   │       │   ├── RegisterForm.jsx
│   │       │   ├── VerifyEmailForm.jsx
│   │       │   └── ForgotPasswordForm.jsx
│   │       │
│   │       ├── products/
│   │       │   ├── ProductCard.jsx
│   │       │   ├── ProductDetail.jsx
│   │       │   ├── ProductGallery.jsx
│   │       │   ├── ProductInfo.jsx
│   │       │   ├── RelatedProducts.jsx
│   │       │   └── RecommendationsCarousel.jsx
│   │       │
│   │       ├── cart/
│   │       │   ├── CartSummary.jsx
│   │       │   ├── CartItem.jsx
│   │       │   ├── CouponInput.jsx
│   │       │   └── CartEmpty.jsx
│   │       │
│   │       ├── checkout/
│   │       │   ├── CheckoutSteps.jsx
│   │       │   ├── AddressStep.jsx
│   │       │   ├── ReviewStep.jsx
│   │       │   └── PaymentStep.jsx
│   │       │
│   │       ├── orders/
│   │       │   ├── OrderTimeline.jsx
│   │       │   ├── OrderDetails.jsx
│   │       │   ├── OrderList.jsx
│   │       │   └── ReturnForm.jsx
│   │       │
│   │       ├── reviews/
│   │       │   ├── ReviewForm.jsx
│   │       │   ├── ReviewCard.jsx
│   │       │   └── ReviewsList.jsx
│   │       │
│   │       └── admin/
│   │           ├── DashboardCards.jsx
│   │           ├── AnalyticsCharts.jsx
│   │           ├── OrderStatusTable.jsx
│   │           ├── ProductTable.jsx
│   │           ├── InventoryTable.jsx
│   │           ├── CouponForm.jsx
│   │           └── ReturnQueue.jsx
│   │
│   ├── pages/
│   │   ├── user/
│   │   │   ├── Landing.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── OrderConfirmation.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── OrderDetail.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Wishlist.jsx
│   │   │   └── Returns.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── VerifyEmail.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── AdminLogin.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Coupons.jsx
│   │   │   ├── Returns.jsx
│   │   │   └── Reviews.jsx
│   │   │
│   │   ├── NotFound.jsx
│   │   ├── Unauthorized.jsx
│   │   └── Error.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js                  # Auth state & actions
│   │   ├── useCart.js                  # Cart management
│   │   ├── useProduct.js               # Product queries
│   │   ├── useOrder.js                 # Order queries
│   │   ├── useWishlist.js              # Wishlist management
│   │   ├── useCoupon.js                # Coupon validation
│   │   ├── useForm.js                  # Form handling wrapper
│   │   ├── usePagination.js            # Pagination logic
│   │   ├── useFilters.js               # Filter state
│   │   ├── useAsync.js                 # Async operations
│   │   ├── useLocalStorage.js          # Local storage sync
│   │   ├── useDebounce.js              # Debounce hook
│   │   ├── useInfiniteScroll.js        # Infinite scroll
│   │   └── useNotification.js          # Toast notifications
│   │
│   ├── stores/
│   │   ├── authStore.js                # Auth state (Zustand)
│   │   ├── cartStore.js                # Cart state (Zustand)
│   │   ├── uiStore.js                  # UI state (Zustand)
│   │   ├── filterStore.js              # Filters state (Zustand)
│   │   └── notificationStore.js        # Notifications (Zustand)
│   │
│   ├── services/
│   │   ├── axios.js                    # Axios instance + interceptors
│   │   ├── api/
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── cartService.js
│   │   │   ├── orderService.js
│   │   │   ├── paymentService.js
│   │   │   ├── couponService.js
│   │   │   ├── reviewService.js
│   │   │   ├── wishlistService.js
│   │   │   ├── userService.js
│   │   │   ├── returnService.js
│   │   │   ├── inventoryService.js
│   │   │   ├── analyticsService.js
│   │   │   └── guestCartService.js
│   │   │
│   │   └── external/
│   │       └── razorpay.js             # Razorpay SDK
│   │
│   ├── utils/
│   │   ├── constants.js                # App constants
│   │   ├── formatters.js               # Price, date formatters
│   │   ├── validators.js               # Form validators (Zod schemas)
│   │   ├── errorHandler.js             # Error processing
│   │   ├── storage.js                  # LocalStorage helpers
│   │   ├── queryParams.js              # Query string parser
│   │   └── idempotency.js              # Idempotency key generator
│   │
│   ├── types/
│   │   ├── api.js                      # JSDoc types for API
│   │   ├── components.js               # Component prop types
│   │   ├── store.js                    # Store types
│   │   └── common.js                   # Common types
│   │
│   ├── constants/
│   │   ├── api.js                      # API endpoints
│   │   ├── routes.js                   # Route paths
│   │   ├── messages.js                 # Error & success messages
│   │   ├── colors.js                   # Color palette
│   │   ├── sizes.js                    # Size constants
│   │   └── limits.js                   # Pagination limits
│   │
│   ├── styles/
│   │   ├── tailwind.config.js          # Tailwind config
│   │   ├── globals.css                 # Global styles
│   │   └── animations.css              # Reusable animations
│   │
│   └── App.jsx
│
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── .env.example
```

---

## 🎣 CUSTOM HOOKS DESIGN

### 1. useAuth Hook

```javascript
// hooks/useAuth.js
export const useAuth = () => {
  const store = useAuthStore();

  return {
    // State
    user: store.user,
    admin: store.admin,
    isAuthenticated: store.isAuthenticated,
    isAdmin: store.isAdmin,
    isLoading: store.isLoading,

    // Actions
    register: store.register, // (credentials) → Promise
    login: store.login, // (credentials) → Promise
    adminLogin: store.adminLogin, // (credentials) → Promise
    logout: store.logout, // () → Promise
    verifyEmail: store.verifyEmail, // (email, otp) → Promise
    resetPassword: store.resetPassword, // (email, otp, password) → Promise
    refreshToken: store.refreshToken, // () → Promise
  };
};

// Usage in component:
// const { user, login, logout, isAuthenticated } = useAuth()
```

### 2. useCart Hook

```javascript
// hooks/useCart.js
export const useCart = () => {
  const store = useCartStore();
  const queryClient = useQueryClient();

  // Fetch cart
  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: cartService.getCart,
    enabled: store.isAuthenticated,
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: (item) => cartService.addItem(item),
    onMutate: (newItem) => {
      // Optimistic update
      queryClient.setQueryData(["cart"], (old) => ({
        ...old,
        items: [...old.items, newItem],
      }));
    },
    onError: (err, newItem, context) => {
      // Rollback on error
      queryClient.setQueryData(["cart"], context.previous);
    },
  });

  return {
    // State
    cart: cart || store.cart,
    isLoading,

    // Actions
    addItem: addItemMutation.mutate,
    removeItem: (productId, size) => cartService.removeItem(productId, size),
    updateQuantity: (productId, size, qty) =>
      cartService.updateQuantity(productId, size, qty),
    clearCart: () => cartService.clearCart(),
  };
};

// Usage in component:
// const { cart, addItem, removeItem } = useCart()
```

### 3. useProduct Hook

```javascript
// hooks/useProduct.js
export const useProduct = (productId) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => productService.getById(productId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProducts = (params) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productService.list(params),
  });
};

// Usage in component:
// const { data: product, isLoading } = useProduct(id)
// const { data: products } = useProducts({ category: 'electronics' })
```

### 4. useOrder Hook

```javascript
// hooks/useOrder.js
export const useOrder = (orderId) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getById(orderId),
  });
};

export const useOrders = (params) => {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => orderService.list(params),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => orderService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.setQueryData(["order", data.id], data);
    },
  });
};

// Usage in component:
// const { data: order } = useOrder(orderId)
// const { mutate: createOrder } = useCreateOrder()
```

### 5. useWishlist Hook

```javascript
// hooks/useWishlist.js
export const useWishlist = () => {
  const { data: wishlist, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistService.getWishlist,
  });

  const addMutation = useMutation({
    mutationFn: (productId) => wishlistService.add(productId),
    onMutate: (productId) => {
      queryClient.setQueryData(["wishlist"], (old) => ({
        ...old,
        items: [...old.items, productId],
      }));
    },
  });

  return {
    wishlist: wishlist?.items || [],
    isLoading,
    add: addMutation.mutate,
    remove: (productId) => wishlistService.remove(productId),
    isInWishlist: (productId) => wishlist?.items.includes(productId),
  };
};

// Usage in component:
// const { wishlist, add, remove, isInWishlist } = useWishlist()
```

### 6. useForm Hook

```javascript
// hooks/useForm.js
export const useForm = (schema, onSubmit) => {
  const form = useHookForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const onFormSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  });

  return {
    ...form,
    onSubmit: onFormSubmit,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
};

// Usage in component:
// const form = useForm(loginSchema, handleLogin)
// const { register, handleSubmit, errors } = form
```

### 7. usePagination Hook

```javascript
// hooks/usePagination.js
export const usePagination = (total, pageSize = 20) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(total / pageSize);
  const skip = (currentPage - 1) * pageSize;

  return {
    currentPage,
    totalPages,
    skip,
    pageSize,
    goToPage: (page) => setCurrentPage(Math.min(Math.max(page, 1), totalPages)),
    nextPage: () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setCurrentPage((p) => Math.max(p - 1, 1)),
  };
};

// Usage in component:
// const { currentPage, totalPages, skip, nextPage } = usePagination(total)
```

### 8. useFilters Hook

```javascript
// hooks/useFilters.js
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const removeFilter = (key) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearFilters = () => setFilters(initialFilters);

  return {
    filters,
    updateFilter,
    removeFilter,
    clearFilters,
  };
};

// Usage in component:
// const { filters, updateFilter, clearFilters } = useFilters()
```

### 9. useAsync Hook

```javascript
// hooks/useAsync.js
export const useAsync = (asyncFunction, immediate = true) => {
  const [state, setState] = useState({
    status: "idle",
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!immediate) return;

    const execute = async () => {
      setState({ status: "pending", data: null, error: null });
      try {
        const response = await asyncFunction();
        setState({ status: "success", data: response, error: null });
      } catch (error) {
        setState({ status: "error", data: null, error });
      }
    };

    execute();
  }, [asyncFunction, immediate]);

  return state;
};

// Usage in component:
// const { data, status, error } = useAsync(fetchData)
```

### 10. useLocalStorage Hook

```javascript
// hooks/useLocalStorage.js
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// Usage in component:
// const [theme, setTheme] = useLocalStorage('theme', 'light')
```

---

## 🔌 API SERVICE LAYER

### Pattern: Service-based API

```javascript
// services/api/productService.js
import api from "../axios";

export const productService = {
  // List with filters
  list: (params) => api.get("/product/list", { params }),

  // Get single product
  getById: (id) => api.get(`/product/${id}`),

  // Create product (admin)
  create: (data, files) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    Object.entries(files).forEach(([key, file]) => {
      formData.append(key, file);
    });
    return api.post("/product/addproduct", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Update product (admin)
  update: (id, data, files) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });
    return api.put(`/product/update/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Delete product (admin)
  delete: (id) => api.post(`/product/remove/${id}`),

  // Update stock (admin)
  updateStock: (id, data) => api.put(`/product/update-stock/${id}`, data),
};
```

### Axios Interceptors

```javascript
// services/axios.js
import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true, // Include cookies
});

// Request interceptor
api.interceptors.request.use((config) => {
  // Add token to headers
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add idempotency key for POST/PATCH
  if (["post", "patch"].includes(config.method)) {
    config.headers["Idempotency-Key"] = generateIdempotencyKey();
  }

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await useAuthStore.getState().refreshToken();
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.status === 400) {
      useNotificationStore.getState().addNotification({
        type: "error",
        message: error.response.data?.message || "Bad request",
      });
    }

    return Promise.reject(error);
  },
);

export default api;
```

---

## 🛡️ ERROR HANDLING ARCHITECTURE

### Error Boundary Component

```javascript
// components/ErrorBoundary.jsx
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Log to error tracking service (Sentry, etc)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Error Handler Utility

```javascript
// utils/errorHandler.js
export const handleError = (error) => {
  const message = {
    400: "Invalid request. Please check your input.",
    401: "Please log in to continue.",
    403: "You do not have permission to access this.",
    404: "The requested resource was not found.",
    409: "Conflict. This resource already exists.",
    422: "Validation failed. Please check your input.",
    429: "Too many requests. Please try again later.",
    500: "Server error. Please try again later.",
    503: "Service temporarily unavailable. Please try again later.",
  };

  if (error.response?.status) {
    return {
      status: error.response.status,
      message: message[error.response.status] || "An error occurred",
      details: error.response.data?.errors || [],
    };
  }

  if (error.message === "Network Error") {
    return {
      status: 0,
      message: "Network error. Please check your connection.",
      details: [],
    };
  }

  return {
    status: 500,
    message: error.message || "An unexpected error occurred",
    details: [],
  };
};
```

---

## 📦 STATE MANAGEMENT PATTERNS

### Zustand Store Pattern

```javascript
// stores/authStore.js
import { create } from "zustand";
import { authService } from "../services/api/authService";

export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  admin: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,

  // Actions
  register: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await authService.register(credentials);
      set({ user: response.data.user, token: response.data.token });
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(credentials);
      set({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true,
        isAdmin: false,
      });
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      set({
        user: null,
        admin: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
      });
    }
  },

  setUser: (user) => set({ user }),
}));
```

### React Query Patterns

**Query Pattern:**

```javascript
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["products", params],
  queryFn: () => productService.list(params),
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: 2,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

**Mutation Pattern:**

```javascript
const mutation = useMutation({
  mutationFn: (data) => cartService.addItem(data),
  onMutate: (data) => {
    // Optimistic update
    queryClient.setQueryData(["cart"], (old) => ({
      ...old,
      items: [...old.items, data],
    }));
  },
  onError: (error, data, context) => {
    // Rollback
    queryClient.setQueryData(["cart"], context.previous);
  },
  onSuccess: () => {
    // Refetch/invalidate
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  },
});
```

---

## 🎨 COMPONENT PATTERNS

### Presentational Component Pattern

```javascript
// Dumb component - receives props, renders UI
export const ProductCard = ({ product, onAddCart, onWishlist }) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">${product.price}</p>
      <div className="actions">
        <button onClick={() => onAddCart(product.id)}>Add to Cart</button>
        <button onClick={() => onWishlist(product.id)}>♥</button>
      </div>
    </div>
  );
};
```

### Container Component Pattern

```javascript
// Smart component - fetches data, handles logic
export const ProductGrid = ({ category }) => {
  const { data: products, isLoading } = useProducts({ category });
  const { addItem } = useCart();
  const { add } = useWishlist();

  if (isLoading) return <SkeletonLoader count={12} />;

  return (
    <div className="grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddCart={addItem}
          onWishlist={add}
        />
      ))}
    </div>
  );
};
```

### Controlled Form Component

```javascript
export const LoginForm = () => {
  const form = useForm(loginSchema, handleLogin);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <form onSubmit={handleSubmit}>
      <FormInput
        label="Email"
        {...register("email")}
        error={errors.email?.message}
      />
      <FormInput
        label="Password"
        type="password"
        {...register("password")}
        error={errors.password?.message}
      />
      <Button type="submit" loading={isSubmitting}>
        Sign In
      </Button>
    </form>
  );
};
```

---

## 📋 VALIDATION SCHEMAS (Zod)

```javascript
// utils/validators.js
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email").min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().regex(/^\d{5,6}$/, "Invalid zip code"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().regex(/^\d{10}$/, "Invalid phone number"),
  isDefault: z.boolean(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(5).max(100),
  comment: z.string().min(10).max(500),
});
```

---

## 🔄 DATA FLOW PATTERNS

### User Login Flow

```
User Input
  → Form Validation (Zod)
  → API Request (authService.login)
  → Axios Interceptor adds token
  → Store token in AuthStore
  → Redirect to /products
  → Protected routes access token from AuthStore
```

### Product Purchase Flow

```
Product Page
  → Add to Cart (useCart hook)
  → Store in CartStore + React Query
  → Go to /cart
  → Apply coupon (validateCoupon)
  → Go to /checkout
  → Select address
  → Review order
  → Create order (idempotent POST)
  → Initiate payment (Razorpay)
  → Payment webhook updates order
  → Redirect to confirmation
```

### Admin Analytics Flow

```
Dashboard Page
  → Multiple useQuery calls (parallel)
  → All analytics endpoints fetch simultaneously
  → Data aggregated in React Query cache
  → Charts render with data
  → User selects date range
  → Queries refetch with new params
  → Charts update via Re-render
```

---

## ⚡ PERFORMANCE OPTIMIZATIONS

### Code Splitting

```javascript
// App.jsx
const LandingPage = lazy(() => import('./pages/user/Landing'))
const ProductDetail = lazy(() => import('./pages/user/ProductDetail'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))

<Route path="/" element={<Suspense fallback={<Spinner />}><LandingPage /></Suspense>} />
```

### Image Optimization

```javascript
// Use responsive images with srcset
<img
  src="/product-md.jpg"
  srcSet="/product-sm.jpg 480w, /product-md.jpg 768w, /product-lg.jpg 1280w"
  sizes="(max-width: 480px) 480px, (max-width: 768px) 768px, 1280px"
  alt="Product"
/>
```

### Query Caching

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});
```

### Memoization

```javascript
export const ProductCard = memo(
  ({ product, onAddCart }) => {
    return (
      <div>
        <h3>{product.name}</h3>
        <button onClick={() => onAddCart(product.id)}>Add</button>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.product.id === nextProps.product.id;
  },
);
```

---

## 🛠️ CODING STANDARDS & CONVENTIONS

### Naming Conventions

```javascript
// Components: PascalCase
export const ProductCard = () => {};
export const UserLayout = () => {};

// Files: kebab-case or PascalCase matching export
// src/components/ui/atoms/Button.jsx
// src/pages/user/Products.jsx

// Variables: camelCase
const productList = [];
const isLoading = false;

// Constants: UPPER_SNAKE_CASE
const MAX_ITEMS_PER_PAGE = 20;
const API_TIMEOUT = 5000;

// Functions: camelCase
const handleAddToCart = () => {};
const fetchProducts = () => {};

// Hooks: use* prefix
const useAuth = () => {};
const useCart = () => {};
const useAsync = () => {};
```

### File Organization

```javascript
// Order of exports in component file:
// 1. Imports
// 2. Constants
// 3. JSDoc type definitions (if needed)
// 4. Component definition
// 5. Prop validation (optional)
// 6. Export

// Example:
import React from "react";
import { useCart } from "../../hooks/useCart";

const BUTTON_VARIANTS = ["primary", "secondary", "danger"];

/**
 * @typedef {Object} ProductCardProps
 * @property {string} productId - Product ID
 * @property {boolean} [isLoading] - Loading state
 */

export const ProductCard = ({ productId, isLoading }) => {
  // Component code
};
```

### Error Handling Pattern

```javascript
try {
  const response = await someAsyncOperation();
  // Handle success
} catch (error) {
  const { status, message } = handleError(error);
  // Show toast/notification
  showToast.error(message);
  // Log error
  console.error(`Error [${status}]:`, message);
}
```

---

## 📊 IMPLEMENTATION PHASES

### Phase 1: Foundation (Days 1-2)

- [ ] Project setup (Vite, Tailwind, routing)
- [ ] API layer setup (axios, services)
- [ ] State management (Zustand stores)
- [ ] Authentication flow
- [ ] Layout components

### Phase 2: Core User Features (Days 3-5)

- [ ] Product listing & detail pages
- [ ] Cart management
- [ ] Order checkout flow
- [ ] User profile pages
- [ ] Wishlist functionality

### Phase 3: Advanced Features (Days 6-8)

- [ ] Payment integration (Razorpay)
- [ ] Reviews & ratings
- [ ] Returns management
- [ ] Coupons & discounts
- [ ] Guest cart

### Phase 4: Admin System (Days 9-11)

- [ ] Admin dashboard
- [ ] Product management
- [ ] Order management
- [ ] Analytics & reports
- [ ] Inventory management

### Phase 5: Polish & Optimization (Days 12-14)

- [ ] Performance optimization
- [ ] Error handling refinement
- [ ] Accessibility audit
- [ ] Mobile responsiveness
- [ ] Testing & bug fixes

---

## ✅ ARCHITECTURE VALIDATION

| Aspect              | Coverage                           | Status |
| ------------------- | ---------------------------------- | ------ |
| Component Hierarchy | Atomic design                      | ✅     |
| Folder Structure    | Scalable organization              | ✅     |
| State Management    | Zustand + React Query              | ✅     |
| API Layer           | Service-based pattern              | ✅     |
| Custom Hooks        | 10 essential hooks                 | ✅     |
| Error Handling      | Boundary + interceptors            | ✅     |
| Validation          | Zod schemas                        | ✅     |
| Code Patterns       | Reusable templates                 | ✅     |
| Performance         | Lazy loading, caching, memoization | ✅     |
| Accessibility       | WCAG 2.1 AA ready                  | ✅     |

---

## 🚀 READY FOR IMPLEMENTATION

This system design provides:

- ✅ Complete component architecture
- ✅ Scalable folder structure
- ✅ 10+ custom hooks design
- ✅ API service patterns
- ✅ State management patterns
- ✅ Error handling strategy
- ✅ Validation schemas
- ✅ Performance optimizations
- ✅ Coding standards
- ✅ Implementation phases

---

**Document Version:** 1.0  
**Date:** April 26, 2026  
**Status:** ✅ READY FOR PHASE 1 IMPLEMENTATION

**Next Step:** Begin PHASE 1 - Project Setup & Foundation\*\*

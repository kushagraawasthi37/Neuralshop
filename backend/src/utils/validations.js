import { body, param, query } from "express-validator";

// ========== AUTH VALIDATIONS ==========
export const authValidations = {
  registration: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain uppercase, lowercase, and number"),
  ],

  login: [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("password").notEmpty().withMessage("Password is required"),
  ],

  googleLogin: [
    body("idToken").trim().notEmpty().withMessage("Firebase ID token is required"),
  ],

  verifyEmail: [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),

    body("otp")
      .notEmpty()
      .withMessage("OTP is required")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits")
      .isNumeric()
      .withMessage("OTP must be numeric"),
  ],

  requestPasswordReset: [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
  ],

  resetPassword: [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),

    body("otp")
      .notEmpty()
      .withMessage("OTP is required")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits")
      .isNumeric()
      .withMessage("OTP must be numeric"),

    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain uppercase, lowercase, and number"),
  ],
};

// ========== PRODUCT VALIDATIONS ==========
export const productValidations = {
  addProduct: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Product name is required")
      .isLength({ min: 3 })
      .withMessage("Product name must be at least 3 characters"),

    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),

    body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),

    body("category").trim().notEmpty().withMessage("Category is required"),

    body("subCategory")
      .trim()
      .notEmpty()
      .withMessage("Sub-category is required"),

    body("sizes")
      .notEmpty()
      .withMessage("Sizes are required")
      .custom((value) => {
        try {
          JSON.parse(value);
          return true;
        } catch {
          throw new Error("Sizes must be valid JSON");
        }
      }),

    body("bestseller")
      .optional()
      .isBoolean()
      .withMessage("Bestseller must be a boolean"),
  ],

  removeProduct: [
    param("id")
      .notEmpty()
      .withMessage("Product ID is required")
      .isMongoId()
      .withMessage("Invalid product ID"),
  ],

  listProduct: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),

    query("search")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Search query cannot be empty"),

    query("category")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Category cannot be empty"),

    query("subCategory")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Sub-category cannot be empty"),

    query("priceMin")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price min must be a positive number"),

    query("priceMax")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price max must be a positive number"),

    query("ratingMin")
      .optional()
      .isFloat({ min: 0, max: 5 })
      .withMessage("Rating min must be between 0 and 5"),

    query("bestseller")
      .optional()
      .isBoolean()
      .withMessage("Bestseller must be a boolean"),

    query("sort")
      .optional()
      .isIn(["price_asc", "price_desc", "newest", "rating"])
      .withMessage(
        "Sort must be one of: price_asc, price_desc, newest, rating",
      ),

    query("sortBy")
      .optional()
      .isIn(["price", "createdAt", "rating", "name"])
      .withMessage("sortBy must be one of: price, createdAt, rating, name"),

    query("order")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Order must be asc or desc"),

    query("skip")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Skip must be a non-negative integer"),

    query().custom((value, { req }) => {
      const { priceMin, priceMax } = req.query;
      if (priceMin !== undefined && priceMax !== undefined) {
        if (parseFloat(priceMin) > parseFloat(priceMax)) {
          throw new Error("Price min cannot be greater than price max");
        }
      }
      return true;
    }),
  ],

  browseProducts: [
    query("skip")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Skip must be a non-negative integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],

  getProductById: [
    param("id")
      .notEmpty()
      .withMessage("Product ID is required")
      .isMongoId()
      .withMessage("Invalid product ID"),
  ],

  updateProduct: [
    param("id")
      .notEmpty()
      .withMessage("Product ID is required")
      .isMongoId()
      .withMessage("Invalid product ID"),

    body("name")
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage("Product name must be at least 3 characters"),

    body("description")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),

    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),

    body("category")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Category is required"),

    body("subCategory")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Sub-category is required"),

    body("sizes")
      .optional()
      .custom((value) => {
        if (!value) return true;
        try {
          JSON.parse(value);
          return true;
        } catch {
          throw new Error("Sizes must be valid JSON");
        }
      }),

    body("bestseller")
      .optional()
      .isBoolean()
      .withMessage("Bestseller must be a boolean"),
  ],

  updateStock: [
    param("id")
      .notEmpty()
      .withMessage("Product ID is required")
      .isMongoId()
      .withMessage("Invalid product ID"),

    body("size")
      .notEmpty()
      .withMessage("Size is required")
      .isIn(["XS", "S", "M", "L", "XL", "XXL"])
      .withMessage("Invalid size"),

    body("stockChange")
      .notEmpty()
      .withMessage("Stock change is required")
      .isInt()
      .withMessage("Stock change must be an integer"),
  ],
};

// ========== CART VALIDATIONS ==========
export const cartValidations = {
  addItem: [
    body("productId")
      .notEmpty()
      .withMessage("productId is required")
      .isString()
      .withMessage("productId must be a string"),

    body("size")
      .notEmpty()
      .withMessage("size is required")
      .isIn(["XS", "S", "M", "L", "XL", "XXL"])
      .withMessage("size must be one of: XS, S, M, L, XL, XXL"),

    body("quantity")
      .notEmpty()
      .withMessage("quantity is required")
      .isInt({ min: 1 })
      .withMessage("quantity must be a positive integer"),

    body("priceAtAdd")
      .notEmpty()
      .withMessage("priceAtAdd is required")
      .isFloat({ min: 0 })
      .withMessage("priceAtAdd must be a non-negative number"),

    body("name").optional().isString().withMessage("name must be a string"),
    body("image").optional().isString().withMessage("image must be a string"),
  ],

  updateItem: [
    body("productId")
      .notEmpty()
      .withMessage("productId is required")
      .isString()
      .withMessage("productId must be a string"),

    body("size")
      .notEmpty()
      .withMessage("size is required")
      .isIn(["XS", "S", "M", "L", "XL", "XXL"])
      .withMessage("size must be one of: XS, S, M, L, XL, XXL"),

    body("quantity")
      .notEmpty()
      .withMessage("quantity is required")
      .isInt({ min: 0 })
      .withMessage("quantity must be zero or a positive integer"),
  ],

  removeItem: [
    body("productId")
      .notEmpty()
      .withMessage("productId is required")
      .isString()
      .withMessage("productId must be a string"),

    body("size")
      .notEmpty()
      .withMessage("size is required")
      .isIn(["XS", "S", "M", "L", "XL", "XXL"])
      .withMessage("size must be one of: XS, S, M, L, XL, XXL"),
  ],
};

// ========== ORDER VALIDATIONS ==========
export const orderValidations = {
  placeOrder: [
    body("addressId")
      .notEmpty()
      .withMessage("Address ID is required")
      .isUUID()
      .withMessage("Invalid address ID"),
  ],

  updateStatus: [
    body("orderId")
      .notEmpty()
      .withMessage("Order ID is required")
      .isMongoId()
      .withMessage("Invalid order ID"),

    body("status")
      .trim()
      .notEmpty()
      .withMessage("Status is required")
      .isIn(["Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"])
      .withMessage("Invalid order status"),
  ],
};

// ========== USER VALIDATIONS ==========
export const userValidations = {
  // ========== PROFILE VALIDATIONS ==========
  getUserProfile: [
    // No validation needed for GET request
  ],

  updateProfile: [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),

    body("phone")
      .optional()
      .trim()
      .isMobilePhone()
      .withMessage("Invalid phone number"),

    body("profilePicture")
      .optional()
      .trim()
      .isURL()
      .withMessage("Profile picture must be a valid URL"),
  ],

  // ========== ADDRESS VALIDATIONS ==========
  getUserAddresses: [
    // No validation needed for GET request
  ],

  createAddress: [
    body("label")
      .trim()
      .notEmpty()
      .withMessage("Label is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Label must be between 2 and 50 characters"),

    body("street")
      .trim()
      .notEmpty()
      .withMessage("Street is required")
      .isLength({ min: 5, max: 100 })
      .withMessage("Street must be between 5 and 100 characters"),

    body("city")
      .trim()
      .notEmpty()
      .withMessage("City is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("City must be between 2 and 50 characters"),

    body("state")
      .trim()
      .notEmpty()
      .withMessage("State is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("State must be between 2 and 50 characters"),

    body("zipCode")
      .trim()
      .notEmpty()
      .withMessage("Zip code is required")
      .matches(/^\d{5,6}$/)
      .withMessage("Zip code must be 5-6 digits"),

    body("country")
      .trim()
      .notEmpty()
      .withMessage("Country is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Country must be between 2 and 50 characters"),

    body("phone")
      .optional()
      .trim()
      .isMobilePhone()
      .withMessage("Invalid phone number"),

    body("isDefault")
      .optional()
      .isBoolean()
      .withMessage("isDefault must be a boolean"),
  ],

  updateAddress: [
    param("addressId")
      .notEmpty()
      .withMessage("Address ID is required")
      .isUUID()
      .withMessage("Invalid address ID"),

    body("label")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Label must be between 2 and 50 characters"),

    body("street")
      .optional()
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage("Street must be between 5 and 100 characters"),

    body("city")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("City must be between 2 and 50 characters"),

    body("state")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("State must be between 2 and 50 characters"),

    body("zipCode")
      .optional()
      .trim()
      .matches(/^\d{5,6}$/)
      .withMessage("Zip code must be 5-6 digits"),

    body("country")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Country must be between 2 and 50 characters"),

    body("phone")
      .optional()
      .trim()
      .isMobilePhone()
      .withMessage("Invalid phone number"),

    body("isDefault")
      .optional()
      .isBoolean()
      .withMessage("isDefault must be a boolean"),
  ],

  deleteAddress: [
    param("addressId")
      .notEmpty()
      .withMessage("Address ID is required")
      .isUUID()
      .withMessage("Invalid address ID"),
  ],

  getUserDefaultAddress: [
    // No validation needed for GET request
  ],
};

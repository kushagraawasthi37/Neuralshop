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
      .withMessage("Invalid email format"),

    body("password").notEmpty().withMessage("Password is required"),
  ],

  googleLogin: [
    body("name").trim().notEmpty().withMessage("Name is required"),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
  ],
<<<<<<< HEAD

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
      .withMessage("Invalid email format"),

      
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
=======
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
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
  ],
};

// ========== CART VALIDATIONS ==========
export const cartValidations = {
  addToCart: [
    body("itemId")
      .notEmpty()
      .withMessage("Item ID is required")
      .isMongoId()
      .withMessage("Invalid item ID"),

    body("size")
      .trim()
      .notEmpty()
      .withMessage("Size is required")
      .isLength({ min: 1 })
      .withMessage("Size cannot be empty"),
  ],

  updateCart: [
    body("itemId")
      .notEmpty()
      .withMessage("Item ID is required")
      .isMongoId()
      .withMessage("Invalid item ID"),

    body("size").trim().notEmpty().withMessage("Size is required"),

    body("quantity")
      .notEmpty()
      .withMessage("Quantity is required")
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),
  ],
};

// ========== ORDER VALIDATIONS ==========
export const orderValidations = {
  placeOrder: [
    body("amount")
      .notEmpty()
      .withMessage("Amount is required")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),

    body("address")
      .notEmpty()
      .withMessage("Address is required")
      .isObject()
      .withMessage("Address must be an object"),

    body("address.street")
      .trim()
      .notEmpty()
      .withMessage("Street address is required"),

    body("address.city").trim().notEmpty().withMessage("City is required"),

    body("address.state").trim().notEmpty().withMessage("State is required"),

    body("address.zipCode")
      .trim()
      .notEmpty()
      .withMessage("Zip code is required"),

    body("address.country")
      .trim()
      .notEmpty()
      .withMessage("Country is required"),
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
  updateProfile: [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),

    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Invalid email format"),

    body("phone")
      .optional()
      .trim()
      .isMobilePhone()
      .withMessage("Invalid phone number"),
  ],
};

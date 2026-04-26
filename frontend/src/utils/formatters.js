/**
 * Utility functions for formatting data
 */

// Currency formatting
export const formatPrice = (price, currency = "INR", locale = "en-IN") => {
  if (price === null || price === undefined) return "₹0";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

// Date formatting
export const formatDate = (date, options = {}) => {
  if (!date) return "";

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat("en-IN", defaultOptions).format(
    new Date(date),
  );
};

export const formatDateTime = (date) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export const formatRelativeTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now - targetDate;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }
};

// Number formatting
export const formatNumber = (number, options = {}) => {
  if (number === null || number === undefined) return "0";

  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  };

  return new Intl.NumberFormat("en-IN", defaultOptions).format(number);
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return "0%";

  return `${formatNumber(value, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
};

// Text formatting
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const titleCase = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
};

export const truncate = (str, maxLength = 100, suffix = "...") => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

export const slugify = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Phone number formatting
export const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Indian phone number format
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.length === 13 && cleaned.startsWith("091")) {
    return `+91 ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  }

  return phone;
};

// Address formatting
export const formatAddress = (address) => {
  if (!address) return "";

  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ].filter(Boolean);

  return parts.join(", ");
};

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Order status formatting
export const formatOrderStatus = (status) => {
  if (!status) return "";

  const statusMap = {
    pending: "Pending",
    processing: "Processing",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
    refunded: "Refunded",
  };

  return statusMap[status.toLowerCase()] || capitalize(status);
};

// Payment status formatting
export const formatPaymentStatus = (status) => {
  if (!status) return "";

  const statusMap = {
    pending: "Pending",
    completed: "Completed",
    failed: "Failed",
    refunded: "Refunded",
    cancelled: "Cancelled",
  };

  return statusMap[status.toLowerCase()] || capitalize(status);
};

// Product availability formatting
export const formatAvailability = (stock, threshold = 10) => {
  if (stock === 0) return "Out of Stock";
  if (stock <= threshold) return `Only ${stock} left`;
  return "In Stock";
};

// Rating formatting
export const formatRating = (rating, maxRating = 5) => {
  if (rating === null || rating === undefined) return "No rating";

  const stars =
    "★".repeat(Math.floor(rating)) + "☆".repeat(maxRating - Math.floor(rating));
  return `${stars} (${rating.toFixed(1)})`;
};

// URL formatting
export const formatUrl = (url) => {
  if (!url) return "";

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }

  return url;
};

// ID formatting (for order IDs, product IDs, etc.)
export const formatId = (id, prefix = "") => {
  if (!id) return "";

  const formattedId = String(id).toUpperCase();
  return prefix ? `${prefix}${formattedId}` : formattedId;
};

// Auth Validation - Validates auth requests
export const validateRegistration = (name, email, password) => {
  const errors = {};

  if (!name || name.trim().length === 0) {
    errors.name = "Name is required";
  }

  if (!email || email.trim().length === 0) {
    errors.email = "Email is required";
  }

  if (!password || password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLogin = (email, password) => {
  const errors = {};

  if (!email || email.trim().length === 0) {
    errors.email = "Email is required";
  }

  if (!password || password.length === 0) {
    errors.password = "Password is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

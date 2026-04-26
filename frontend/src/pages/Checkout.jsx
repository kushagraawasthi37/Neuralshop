import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore } from "../../stores/cartStore.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useUiStore } from "../../stores/uiStore.js";
import { ROUTES } from "../../constants/routes.js";
import { MESSAGES } from "../../constants/messages.js";
import Button from "../../components/ui/atoms/Button.jsx";
import Input from "../../components/ui/atoms/Input.jsx";
import Label from "../../components/ui/atoms/Label.jsx";
import Select from "../../components/ui/atoms/Select.jsx";
import Card from "../../components/ui/molecules/Card.jsx";
import Spinner from "../../components/ui/atoms/Spinner.jsx";
import { formatPrice } from "../../utils/formatters.js";

// Validation schemas
const shippingSchema = z.object({
  firstName: z.string().min(1, MESSAGES.VALIDATION.REQUIRED),
  lastName: z.string().min(1, MESSAGES.VALIDATION.REQUIRED),
  email: z
    .string()
    .min(1, MESSAGES.VALIDATION.REQUIRED)
    .email(MESSAGES.VALIDATION.EMAIL),
  phone: z.string().min(10, MESSAGES.VALIDATION.PHONE),
  address: z.string().min(1, MESSAGES.VALIDATION.REQUIRED),
  city: z.string().min(1, MESSAGES.VALIDATION.REQUIRED),
  state: z.string().min(1, MESSAGES.VALIDATION.REQUIRED),
  zipCode: z.string().min(5, MESSAGES.VALIDATION.ZIP_CODE),
  country: z.string().min(1, MESSAGES.VALIDATION.REQUIRED),
});

const paymentSchema = z.object({
  cardNumber: z.string().min(16, MESSAGES.VALIDATION.CARD_NUMBER),
  expiryDate: z.string().min(5, MESSAGES.VALIDATION.EXPIRY_DATE),
  cvv: z.string().min(3, MESSAGES.VALIDATION.CVV),
  nameOnCard: z.string().min(1, MESSAGES.VALIDATION.REQUIRED),
});

/**
 * Checkout page component - Handles order checkout process
 */
const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useUiStore();
  const queryClient = useQueryClient();

  const { fetchCart, createOrder } = useCartStore();

  const [currentStep, setCurrentStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [shippingData, setShippingData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  // Fetch cart data
  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: fetchCart,
    enabled: !!user?.id,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      queryClient.invalidateQueries(["cart"]);
      showSuccess("Order placed successfully!");
      navigate(`${ROUTES.ORDER_CONFIRMATION}/${order.id}`);
    },
    onError: () => {
      showError(MESSAGES.ERROR.PLACE_ORDER);
    },
  });

  // Shipping form
  const shippingForm = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
    },
  });

  // Payment form
  const paymentForm = useForm({
    resolver: zodResolver(paymentSchema),
  });

  const handleShippingSubmit = (data) => {
    setShippingData(data);
    setCurrentStep(2);
  };

  const handlePaymentSubmit = (data) => {
    setPaymentData(data);
    setCurrentStep(3);
  };

  const handlePlaceOrder = () => {
    if (!shippingData || !paymentData || !cart) return;

    createOrderMutation.mutate({
      shipping: shippingData,
      payment: paymentData,
      items: cart.items,
    });
  };

  const goToStep = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to proceed with checkout.
          </p>
          <Button as={Link} to={ROUTES.LOGIN}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout</h1>
          <p className="text-gray-600 mb-6">
            Your cart is empty. Add some items to proceed.
          </p>
          <Button as={Link} to={ROUTES.PRODUCTS}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const cartItems = cart.items || [];
  const subtotal = cart.subtotal || 0;
  const tax = cart.tax || 0;
  const shipping = cart.shipping || 0;
  const total = cart.total || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[
            { step: 1, label: "Shipping" },
            { step: 2, label: "Payment" },
            { step: 3, label: "Review" },
          ].map(({ step, label }) => (
            <React.Fragment key={step}>
              <button
                onClick={() => goToStep(step)}
                disabled={step > currentStep}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium ${
                  step < currentStep
                    ? "bg-primary-600 border-primary-600 text-white"
                    : step === currentStep
                      ? "border-primary-600 text-primary-600"
                      : "border-gray-300 text-gray-300"
                }`}
              >
                {step < currentStep ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step
                )}
              </button>
              <span
                className={`text-sm font-medium ${
                  step <= currentStep ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {label}
              </span>
              {step < 3 && <div className="w-12 h-px bg-gray-300"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Information */}
          {currentStep === 1 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Shipping Information
              </h2>

              <form
                onSubmit={shippingForm.handleSubmit(handleShippingSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" required>
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      {...shippingForm.register("firstName")}
                      error={!!shippingForm.formState.errors.firstName}
                    />
                    {shippingForm.formState.errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {shippingForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName" required>
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      {...shippingForm.register("lastName")}
                      error={!!shippingForm.formState.errors.lastName}
                    />
                    {shippingForm.formState.errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {shippingForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" required>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...shippingForm.register("email")}
                    error={!!shippingForm.formState.errors.email}
                  />
                  {shippingForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {shippingForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" required>
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...shippingForm.register("phone")}
                    error={!!shippingForm.formState.errors.phone}
                  />
                  {shippingForm.formState.errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {shippingForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address" required>
                    Street Address
                  </Label>
                  <Input
                    id="address"
                    {...shippingForm.register("address")}
                    error={!!shippingForm.formState.errors.address}
                  />
                  {shippingForm.formState.errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {shippingForm.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" required>
                      City
                    </Label>
                    <Input
                      id="city"
                      {...shippingForm.register("city")}
                      error={!!shippingForm.formState.errors.city}
                    />
                    {shippingForm.formState.errors.city && (
                      <p className="mt-1 text-sm text-red-600">
                        {shippingForm.formState.errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="state" required>
                      State
                    </Label>
                    <Input
                      id="state"
                      {...shippingForm.register("state")}
                      error={!!shippingForm.formState.errors.state}
                    />
                    {shippingForm.formState.errors.state && (
                      <p className="mt-1 text-sm text-red-600">
                        {shippingForm.formState.errors.state.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="zipCode" required>
                      ZIP Code
                    </Label>
                    <Input
                      id="zipCode"
                      {...shippingForm.register("zipCode")}
                      error={!!shippingForm.formState.errors.zipCode}
                    />
                    {shippingForm.formState.errors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">
                        {shippingForm.formState.errors.zipCode.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="country" required>
                    Country
                  </Label>
                  <Select
                    id="country"
                    {...shippingForm.register("country")}
                    error={!!shippingForm.formState.errors.country}
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                  </Select>
                  {shippingForm.formState.errors.country && (
                    <p className="mt-1 text-sm text-red-600">
                      {shippingForm.formState.errors.country.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="submit" size="lg">
                    Continue to Payment
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Step 2: Payment Information */}
          {currentStep === 2 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Payment Information
              </h2>

              <form
                onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)}
                className="space-y-6"
              >
                <div>
                  <Label htmlFor="nameOnCard" required>
                    Name on Card
                  </Label>
                  <Input
                    id="nameOnCard"
                    {...paymentForm.register("nameOnCard")}
                    error={!!paymentForm.formState.errors.nameOnCard}
                  />
                  {paymentForm.formState.errors.nameOnCard && (
                    <p className="mt-1 text-sm text-red-600">
                      {paymentForm.formState.errors.nameOnCard.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cardNumber" required>
                    Card Number
                  </Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    {...paymentForm.register("cardNumber")}
                    error={!!paymentForm.formState.errors.cardNumber}
                  />
                  {paymentForm.formState.errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {paymentForm.formState.errors.cardNumber.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate" required>
                      Expiry Date
                    </Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      {...paymentForm.register("expiryDate")}
                      error={!!paymentForm.formState.errors.expiryDate}
                    />
                    {paymentForm.formState.errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {paymentForm.formState.errors.expiryDate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cvv" required>
                      CVV
                    </Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      {...paymentForm.register("cvv")}
                      error={!!paymentForm.formState.errors.cvv}
                    />
                    {paymentForm.formState.errors.cvv && (
                      <p className="mt-1 text-sm text-red-600">
                        {paymentForm.formState.errors.cvv.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back to Shipping
                  </Button>
                  <Button type="submit" size="lg">
                    Review Order
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Step 3: Review Order */}
          {currentStep === 3 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Review Your Order
              </h2>

              {/* Shipping Info */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Shipping Address
                </h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-900">
                    {shippingData.firstName} {shippingData.lastName}
                  </p>
                  <p className="text-gray-600">{shippingData.address}</p>
                  <p className="text-gray-600">
                    {shippingData.city}, {shippingData.state}{" "}
                    {shippingData.zipCode}
                  </p>
                  <p className="text-gray-600">{shippingData.country}</p>
                  <p className="text-gray-600">{shippingData.email}</p>
                  <p className="text-gray-600">{shippingData.phone}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Payment Method
                </h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-900">{paymentData.nameOnCard}</p>
                  <p className="text-gray-600">
                    **** **** **** {paymentData.cardNumber.slice(-4)}
                  </p>
                  <p className="text-gray-600">
                    Expires {paymentData.expiryDate}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Order Items
                </h3>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 bg-gray-50 p-4 rounded-md"
                    >
                      <img
                        src={
                          item.product?.images?.[0] ||
                          "/images/placeholder-product.jpg"
                        }
                        alt={item.product?.name}
                        className="w-16 h-16 object-center object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {item.product?.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                          {item.size && ` • Size: ${item.size}`}
                          {item.color && ` • Color: ${item.color}`}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                >
                  Back to Payment
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  size="lg"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Subtotal ({cartItems.length} items):
                </span>
                <span className="text-gray-900">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-gray-900">{formatPrice(shipping)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="text-gray-900">{formatPrice(tax)}</span>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-medium">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-primary-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-green-50 rounded-md">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    Secure checkout with SSL encryption
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

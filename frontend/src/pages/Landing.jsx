import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useProductStore } from "../../stores/productStore.js";
import { useUiStore } from "../../stores/uiStore.js";
import { ROUTES } from "../../constants/routes.js";
import { MESSAGES } from "../../constants/messages.js";
import Button from "../../components/ui/atoms/Button.jsx";
import Card from "../../components/ui/molecules/Card.jsx";
import Spinner from "../../components/ui/atoms/Spinner.jsx";
import { formatPrice } from "../../utils/formatters.js";

/**
 * Landing page component - Main homepage showcasing products and platform features
 */
const Landing = () => {
  const { fetchFeaturedProducts } = useProductStore();
  const { showError } = useUiStore();
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);

  // Fetch featured products
  const {
    data: featuredProducts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["featured-products"],
    queryFn: fetchFeaturedProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (error) {
      showError(MESSAGES.ERROR.FETCH_PRODUCTS);
    }
  }, [error, showError]);

  const handleHeroImageLoad = () => {
    setHeroImageLoaded(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Discover Amazing Products from Trusted Vendors
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-primary-100">
                Shop from a curated collection of high-quality products. Fast
                shipping, secure payments, and exceptional customer service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  as={Link}
                  to={ROUTES.PRODUCTS}
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-50"
                >
                  Shop Now
                </Button>
                <Button
                  as={Link}
                  to={ROUTES.ABOUT}
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary-600"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              {!heroImageLoaded && (
                <div className="w-full h-96 bg-gray-300 animate-pulse rounded-lg"></div>
              )}
              <img
                src="/images/hero-shopping.jpg"
                alt="Shopping experience"
                className={`w-full h-auto rounded-lg shadow-2xl transition-opacity duration-500 ${
                  heroImageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={handleHeroImageLoad}
                onError={() => setHeroImageLoaded(true)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose NeuralShop?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best online shopping experience
              with our innovative platform and dedicated service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Fast Shipping
              </h3>
              <p className="text-gray-600">
                Quick and reliable delivery to get your orders to you as soon as
                possible.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure Payments
              </h3>
              <p className="text-gray-600">
                Your payment information is protected with industry-standard
                security measures.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                24/7 Support
              </h3>
              <p className="text-gray-600">
                Our customer support team is always ready to help you with any
                questions or concerns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600">
              Discover our most popular and highly-rated products
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          ) : featuredProducts?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <Card key={product.id} className="group cursor-pointer">
                  <Link to={`${ROUTES.PRODUCTS}/${product.id}`}>
                    <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-t-lg overflow-hidden">
                      <img
                        src={
                          product.images?.[0] ||
                          "/images/placeholder-product.jpg"
                        }
                        alt={product.name}
                        className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src = "/images/placeholder-product.jpg";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-lg font-semibold text-primary-600">
                        {formatPrice(product.price)}
                      </p>
                      {product.rating && (
                        <div className="flex items-center mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.rating)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-1 text-sm text-gray-500">
                            ({product.reviewCount || 0})
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No featured products available at the moment.
              </p>
            </div>
          )}

          <div className="text-center mt-8">
            <Button as={Link} to={ROUTES.PRODUCTS} variant="outline" size="lg">
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of satisfied customers and discover your next
            favorite product today.
          </p>
          <Button
            as={Link}
            to={ROUTES.REGISTER}
            size="lg"
            className="bg-white text-primary-600 hover:bg-gray-50"
          >
            Create Free Account
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;

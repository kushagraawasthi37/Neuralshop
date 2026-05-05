import { lazy, Suspense } from "react";

// 🔥 Lazy load ALL non-critical sections
import HeroSection from "../components/landing/HeroSection";
const MarqueeStrip = lazy(() => import("../components/landing/MarqueeStrip"));
const CategoryBento = lazy(() => import("../components/landing/CategoryBento"));
const FeaturedProducts = lazy(
  () => import("../components/landing/FeaturedProducts"),
);
const StorySection = lazy(() => import("../components/landing/StorySection"));
const TrendingSection = lazy(
  () => import("../components/landing/TrendingSection"),
);
const Newsletter = lazy(() => import("../components/landing/Newsletter"));

// Minimal skeleton — no heavy loader, respects reduced motion
const SectionSkeleton = () => (
  <div
    style={{
      height: "clamp(200px,30vw,300px)",
      opacity: 0.15,
      background:
        "linear-gradient(180deg, transparent, rgba(201,169,110,0.03), transparent)",
    }}
  />
);

export default function LandingPage() {
  return (
    <main>
      <HeroSection />

      {/* ⚡ Fold 1 */}
      <Suspense fallback={<SectionSkeleton />}>
        <MarqueeStrip />
        <CategoryBento />
      </Suspense>

      {/* ⚡ Fold 2 */}
      <Suspense fallback={<SectionSkeleton />}>
        <FeaturedProducts />
        <StorySection />
      </Suspense>

      {/* ⚡ Fold 3 */}
      <Suspense fallback={<SectionSkeleton />}>
        <TrendingSection />
        <Newsletter />
      </Suspense>
    </main>
  );
}

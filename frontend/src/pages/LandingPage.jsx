import HeroSection from '../components/landing/HeroSection'
import MarqueeStrip from '../components/landing/MarqueeStrip'
import CategoryBento from '../components/landing/CategoryBento'
import FeaturedProducts from '../components/landing/FeaturedProducts'
import StorySection from '../components/landing/StorySection'
import TrendingSection from '../components/landing/TrendingSection'
import Newsletter from '../components/landing/Newsletter'

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <MarqueeStrip />
      <CategoryBento />
      <FeaturedProducts />
      <StorySection />
      <TrendingSection />
      <Newsletter />
    </main>
  )
}

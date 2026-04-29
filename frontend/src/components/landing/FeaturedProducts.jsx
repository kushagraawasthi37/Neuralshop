import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '../../api/products'
import ProductCard from '../ui/ProductCard'
import ProductCardSkeleton from '../ui/ProductCardSkeleton'
import { useReveal } from '../../hooks/useReveal'

export default function FeaturedProducts() {
  const scrollRef = useRef(null)
  const headerRef = useReveal()

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', 'bestseller'],
    queryFn: () => productApi.list({ bestseller: true, limit: 8 }),
    select: (res) => res.data?.products || [],
  })

  const scroll = (dir) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir * 640, behavior: 'smooth' })
  }

  return (
    <section id="featured" style={{ position: 'relative', padding: '140px 52px', background: '#0d0c0b' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div ref={headerRef} className="reveal" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 60 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 30, height: 1, background: '#c9a96e' }} />
              <span style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a96e' }}>Neural Picks</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 300, color: '#f0e6d0', lineHeight: 1.1 }}>
              Objects of <em style={{ fontStyle: 'italic', color: 'rgba(240,230,208,0.4)' }}>distinction</em>
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => scroll(-1)} style={{ width: 44, height: 44, border: '1px solid rgba(201,169,110,0.2)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#c9a96e'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.2)'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <button onClick={() => scroll(1)} style={{ width: 44, height: 44, border: '1px solid rgba(201,169,110,0.2)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#c9a96e'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.2)'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <Link to="/collections" style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.5)', textDecoration: 'none', borderBottom: '1px solid rgba(201,169,110,0.2)', paddingBottom: 4, transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#c9a96e'; e.currentTarget.style.borderColor = '#c9a96e' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,230,208,0.5)'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.2)' }}>
              View All
            </Link>
          </div>
        </div>

        {error && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(240,230,208,0.4)', fontSize: 14 }}>
            Unable to load products. Please try again later.
          </div>
        )}

        <div ref={scrollRef} style={{ overflowX: 'auto', scrollbarWidth: 'none', display: 'flex', gap: 20, paddingBottom: 20, scrollSnapType: 'x mandatory' }}>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : (data || []).map(product => <ProductCard key={product._id || product.id} product={product} />)
          }
        </div>
      </div>
    </section>
  )
}

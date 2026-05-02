import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '../../api/products'
import { useReveal } from '../../hooks/useReveal'

function formatPrice(price) {
  return '₹' + Number(price).toLocaleString('en-IN')
}

export default function TrendingSection() {
  const headerRef = useReveal()
  const navigate = useNavigate()
  const [featured, setFeatured] = useState(null)

  const { data: trending, isLoading } = useQuery({
    queryKey: ['trending', 6],
    queryFn: () => productApi.trending({ limit: 6 }),
    select: (res) => res.data?.data || [],
  })

  const products = trending || []
  const featuredProduct = featured || (products.length > 0 ? products[0] : null)

  return (
    <section id="trending" className="landing-section" style={{ background: '#0d0c0b' }}>
      <div className="landing-inner">
        <div ref={headerRef} className="reveal" style={{ marginBottom: 'clamp(32px,5vw,60px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 30, height: 1, background: '#c9a96e' }} />
            <span style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a96e' }}>Right Now</span>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 4vw, 60px)', fontWeight: 300, color: '#f0e6d0', lineHeight: 1.1 }}>
            What's <em style={{ fontStyle: 'italic', color: 'rgba(240,230,208,0.4)' }}>trending</em>
          </h2>
        </div>

        <div className="trending-two-col">
          {/* Trending list */}
          <div>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ padding: '24px 0', borderBottom: '1px solid rgba(201,169,110,0.08)', display: 'flex', gap: 24, alignItems: 'center' }}>
                  <div className="skeleton" style={{ width: 50, height: 40 }} />
                  <div className="skeleton" style={{ width: 72, height: 72, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ width: '60%', height: 18, marginBottom: 6 }} />
                    <div className="skeleton" style={{ width: '40%', height: 11 }} />
                  </div>
                  <div className="skeleton" style={{ width: 60, height: 16 }} />
                </div>
              ))
              : products.map((p, i) => (
                <div
                  key={p._id || p.id}
                  onClick={() => { setFeatured(p); navigate(`/product/${p._id || p.id}`) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '24px 0', borderBottom: '1px solid rgba(201,169,110,0.08)', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'all 0.3s', paddingLeft: featuredProduct?._id === p._id ? 16 : 0 }}
                  onMouseEnter={e => { setFeatured(p); e.currentTarget.style.paddingLeft = '16px' }}
                  onMouseLeave={e => { e.currentTarget.style.paddingLeft = '0' }}
                >
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: 'rgba(201,169,110,0.15)', minWidth: 50, lineHeight: 1, transition: 'color 0.3s' }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ width: 72, height: 72, background: '#1a1916', border: '1px solid rgba(201,169,110,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {p.images?.[0] || p.image1
                      ? <img src={p.images?.[0] || p.image1} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,0.3)" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="12" cy="10" r="3"/><path d="M6 21v-1a6 6 0 0112 0v1"/></svg>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#f0e6d0', marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(240,230,208,0.35)', letterSpacing: '0.08em' }}>{p.category}</div>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: '#c9a96e' }}>{formatPrice(p.price)}</div>
                </div>
              ))
            }
          </div>

          {/* Featured card */}
          <div className="trending-sticky">
            {featuredProduct && (
              <div onClick={() => navigate(`/product/${featuredProduct._id || featuredProduct.id}`)} style={{ cursor: 'pointer' }}>
                <div style={{ width: '100%', aspectRatio: '3/4', background: '#1a1916', border: '1px solid rgba(201,169,110,0.1)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {featuredProduct.images?.[0] || featuredProduct.image1
                    ? <img src={featuredProduct.images?.[0] || featuredProduct.image1} alt={featuredProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (
                      <svg viewBox="0 0 100 140" fill="none" stroke="rgba(201,169,110,0.15)" strokeWidth="0.5" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                        <rect x="20" y="30" width="60" height="80" rx="1"/>
                        <line x1="0" y1="70" x2="100" y2="70"/>
                        <circle cx="50" cy="70" r="20"/>
                      </svg>
                    )
                  }
                  <div style={{ position: 'absolute', top: 20, left: 20, background: '#c9a96e', color: '#0d0c0b', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', fontWeight: 500 }}>Trending</div>
                </div>
                <div style={{ padding: '28px 0' }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.35)', marginBottom: 8 }}>{featuredProduct.category}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#f0e6d0', marginBottom: 8 }}>{featuredProduct.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: '#c9a96e' }}>{formatPrice(featuredProduct.price)}</div>
                    <span style={{ fontSize: 12, color: 'rgba(240,230,208,0.4)', letterSpacing: '0.08em' }}>View Details →</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReveal } from '../../hooks/useReveal'
import watchImg from '../../../assets/watch.png'
import perfumeImg from '../../../assets/perfumes.png'
import jewelleryImg from '../../../assets/Jewellery.png'
import clothesImg from '../../../assets/clothes.png'
import techImg from '../../../assets/electronics.png'

const categories = [
  { tag: 'Flagship', name: 'Rare\nTimepieces', count: '240 pieces', color: '#c9a96e', query: 'watches', large: true, image: watchImg },
  { tag: 'Curated', name: 'Fragrance\nAtelier', count: '88 pieces', color: '#4a5c47', query: 'fragrance', image: perfumeImg },
  { tag: 'New', name: 'Tech\nArtifacts', count: '156 pieces', color: '#8b6340', query: 'tech', image: techImg },
  { tag: 'Limited', name: 'Clothes', count: '112 pieces', color: '#2a4a47', query: 'leather', image: clothesImg },
  { tag: 'Rare', name: 'Fine\nJewellery', count: '64 pieces', color: '#a07840', query: 'jewellery', image: jewelleryImg },
]

function CatCard({ cat, index, onClick }) {
  const innerRef = useRef(null)
  const hoverRef = useRef(null)
  const arrowRef = useRef(null)
  const arrowSvgRef = useRef(null)
  const textRef = useRef(null)

  return (
    <div
      onClick={onClick}
      className={cat.large ? 'cat-bento-large' : 'cat-bento-small'}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', background: '#1a1916' }}
      onMouseEnter={() => {
        if (innerRef.current) innerRef.current.style.transform = 'scale(1.04)'
        if (hoverRef.current) hoverRef.current.style.opacity = '1'
        if (arrowRef.current) {
          arrowRef.current.style.background = '#c9a96e'
          arrowRef.current.style.borderColor = '#c9a96e'
        }
        if (arrowSvgRef.current) arrowSvgRef.current.setAttribute('stroke', '#0d0c0b')
        if (textRef.current) textRef.current.style.transform = 'translateX(0)'
      }}
      onMouseLeave={() => {
        if (innerRef.current) innerRef.current.style.transform = 'scale(1)'
        if (hoverRef.current) hoverRef.current.style.opacity = '0'
        if (arrowRef.current) {
          arrowRef.current.style.background = 'transparent'
          arrowRef.current.style.borderColor = 'rgba(201,169,110,0.3)'
        }
        if (arrowSvgRef.current) arrowSvgRef.current.setAttribute('stroke', 'rgba(201,169,110,0.6)')
        if (textRef.current) textRef.current.style.transform = 'translateX(-14px)'
      }}
    >
      <div ref={innerRef} style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a1916 0%, #252320 100%)', transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)' }}>
        {cat.image ? (
          <img
            src={cat.image}
            alt={cat.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.45 }}
          />
        ) : (
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }} viewBox="0 0 400 600" fill="none" stroke={cat.color}>
            <circle cx="200" cy="300" r="200"/><circle cx="200" cy="300" r="150"/><circle cx="200" cy="300" r="100"/>
            <line x1="0" y1="300" x2="400" y2="300"/><line x1="200" y1="0" x2="200" y2="600"/>
          </svg>
        )}
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,12,11,0.95) 0%, rgba(13,12,11,0.3) 55%, rgba(13,12,11,0.5) 100%)', zIndex: 2 }} />
      <div ref={hoverRef} style={{ position: 'absolute', inset: 0, background: 'rgba(201,169,110,0.05)', zIndex: 3, opacity: 0, transition: 'opacity 0.4s', border: '1px solid rgba(201,169,110,0.2)' }} />
      <div
        ref={textRef}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, padding: 36, zIndex: 10,
          transform: 'translateX(-14px)',
          transition: 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1)',
          animation: `catTextIn 0.8s cubic-bezier(0.23,1,0.32,1) ${0.15 + index * 0.09}s both`,
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 10 }}>{cat.tag}</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: cat.large ? 42 : 28, fontWeight: 300, color: '#f0e6d0', lineHeight: 1.1, marginBottom: 8, whiteSpace: 'pre-line' }}>{cat.name}</div>
        <div style={{ fontSize: 12, color: 'rgba(240,230,208,0.4)' }}>{cat.count}</div>
        <div
          ref={arrowRef}
          style={{ width: 40, height: 40, border: '1px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 20, transition: 'all 0.3s', background: 'transparent' }}
        >
          <svg ref={arrowSvgRef} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,0.6)" strokeWidth="1.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default function CategoryBento() {
  const sectionRef = useReveal()
  const navigate = useNavigate()

  return (
    <section id="categories" className="landing-section" style={{ position: 'relative', background: 'linear-gradient(to bottom, #0d0c0b 0%, #111009 100%)', overflow: 'hidden' }}>
      <div className="landing-inner">
        <div className="reveal" ref={sectionRef} style={{ marginBottom: 'clamp(40px, 6vw, 80px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 30, height: 1, background: '#c9a96e' }} />
            <span style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a96e' }}>Discover by World</span>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 300, color: '#f0e6d0', lineHeight: 1.1 }}>
            Enter a <em style={{ fontStyle: 'italic', color: 'rgba(240,230,208,0.4)' }}>universe</em><br />crafted for you
          </h2>
        </div>

        <div className="cat-bento-grid">
          {categories.map((cat, i) => (
            <CatCard key={cat.query} cat={cat} index={i} onClick={() => navigate(`/collections?category=${cat.query}`)} />
          ))}
        </div>
        <style>{`
          @keyframes catTextIn {
            from { transform: translateX(-32px); opacity: 0; }
            to   { transform: translateX(-14px); opacity: 1; }
          }
        `}</style>
      </div>
    </section>
  )
}

import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReveal } from '../../hooks/useReveal'

const categories = [
  { tag: 'Flagship', name: 'Rare\nTimepieces', count: '240 pieces', color: '#c9a96e', query: 'watches', large: true },
  { tag: 'Curated', name: 'Fragrance\nAtelier', count: '88 pieces', color: '#4a5c47', query: 'fragrance' },
  { tag: 'New', name: 'Tech\nArtifacts', count: '156 pieces', color: '#8b6340', query: 'tech' },
  { tag: 'Limited', name: 'Leather\nGoods', count: '112 pieces', color: '#2a4a47', query: 'leather' },
  { tag: 'Rare', name: 'Fine\nJewellery', count: '64 pieces', color: '#a07840', query: 'jewellery' },
]

function CatCard({ cat, onClick }) {
  const innerRef = useRef(null)
  const hoverRef = useRef(null)

  return (
    <div
      onClick={onClick}
      className={cat.large ? 'cat-bento-large' : 'cat-bento-small'}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', background: '#1a1916' }}
      onMouseEnter={() => {
        if (innerRef.current) innerRef.current.style.transform = 'scale(1.04)'
        if (hoverRef.current) hoverRef.current.style.opacity = '1'
      }}
      onMouseLeave={() => {
        if (innerRef.current) innerRef.current.style.transform = 'scale(1)'
        if (hoverRef.current) hoverRef.current.style.opacity = '0'
      }}
    >
      <div ref={innerRef} style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a1916 0%, #252320 100%)', transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }} viewBox="0 0 400 600" fill="none" stroke={cat.color}>
          <circle cx="200" cy="300" r="200"/><circle cx="200" cy="300" r="150"/><circle cx="200" cy="300" r="100"/>
          <line x1="0" y1="300" x2="400" y2="300"/><line x1="200" y1="0" x2="200" y2="600"/>
        </svg>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,12,11,0.9) 0%, transparent 50%)', zIndex: 2 }} />
      <div ref={hoverRef} style={{ position: 'absolute', inset: 0, background: 'rgba(201,169,110,0.05)', zIndex: 3, opacity: 0, transition: 'opacity 0.4s', border: '1px solid rgba(201,169,110,0.2)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 36, zIndex: 10 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 10 }}>{cat.tag}</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: cat.large ? 42 : 28, fontWeight: 300, color: '#f0e6d0', lineHeight: 1.1, marginBottom: 8, whiteSpace: 'pre-line' }}>{cat.name}</div>
        <div style={{ fontSize: 12, color: 'rgba(240,230,208,0.4)' }}>{cat.count}</div>
        <div style={{ width: 40, height: 40, border: '1px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 20, transition: 'all 0.3s' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,0.6)" strokeWidth="1.5">
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
          {categories.map((cat) => (
            <CatCard key={cat.query} cat={cat} onClick={() => navigate(`/collections?category=${cat.query}`)} />
          ))}
        </div>
      </div>
    </section>
  )
}

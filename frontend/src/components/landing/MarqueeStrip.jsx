const items = ['Neural Intelligence', 'Rare Objects', 'Verified Excellence', 'Curated Desire', 'Multi-Vendor Mastery', 'Elevated Commerce']
const doubled = [...items, ...items]

export default function MarqueeStrip() {
  return (
    <div style={{ padding: '28px 0', background: '#c9a96e', overflow: 'hidden', display: 'flex' }}>
      <div style={{ display: 'flex', gap: 48, whiteSpace: 'nowrap', animation: 'marqueeScroll 25s linear infinite' }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 300, color: '#0d0c0b', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 24 }}>
            {item}
            <span style={{ width: 4, height: 4, background: 'rgba(13,12,11,0.4)', borderRadius: '50%', display: 'inline-block' }} />
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

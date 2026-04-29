/* Split-screen layout — fills exactly the remaining viewport after auth nav */
export default function AuthLayout({ eyebrow = 'Neural Commerce', title, titleAccent, body, features, leftGlow = '#c9a96e', leftGlow2 = '#4a5c47', leftBg, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%', overflow: 'hidden' }}>

      {/* ── Left decorative panel ── */}
      <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '48px 52px', background: '#1a1916' }}>
        <div style={{ position: 'absolute', inset: 0, background: leftBg || 'linear-gradient(135deg,#1a1916 0%,#0d0c0b 60%,#1a1410 100%)' }} />
        <div style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', filter: 'blur(120px)', background: `rgba(${hexToRgb(leftGlow)},0.08)`, top: '8%', left: '-10%', animation: 'floatGlow 12s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', filter: 'blur(100px)', background: `rgba(${hexToRgb(leftGlow2)},0.1)`, bottom: '12%', right: '-5%', animation: 'floatGlow 9s ease-in-out infinite reverse', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201,169,110,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,169,110,0.03) 1px,transparent 1px)', backgroundSize: '80px 80px', animation: 'gridScroll 20s linear infinite', pointerEvents: 'none' }} />
        {/* Corner marks */}
        <div style={{ position: 'absolute', top: 20, left: 20, width: 20, height: 20, borderTop: '1px solid rgba(201,169,110,0.2)', borderLeft: '1px solid rgba(201,169,110,0.2)' }} />
        <div style={{ position: 'absolute', bottom: 20, right: 20, width: 20, height: 20, borderBottom: '1px solid rgba(201,169,110,0.2)', borderRight: '1px solid rgba(201,169,110,0.2)' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 24, height: 1, background: '#c9a96e', display: 'inline-block' }} />
            {eyebrow}
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(32px, 3vw, 44px)', fontWeight: 300, lineHeight: 1.05, color: '#f0e6d0', marginBottom: 16 }}>
            {title}
            {titleAccent && <><br /><em style={{ color: '#c9a96e', fontStyle: 'italic' }}>{titleAccent}</em></>}
          </div>
          {body && (
            <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(240,230,208,0.55)', maxWidth: 360, marginBottom: 28 }}>{body}</p>
          )}
          {features && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'rgba(240,230,208,0.38)', letterSpacing: '0.04em' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#c9a96e', flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>

        <style>{`
          @keyframes floatGlow{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-30px) scale(1.08)}}
          @keyframes gridScroll{from{background-position:0 0}to{background-position:0 80px}}
        `}</style>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e0d0b', position: 'relative', padding: '32px 52px' }}>
        <div style={{ position: 'absolute', left: 0, top: '10%', bottom: '10%', width: 1, background: 'linear-gradient(to bottom, transparent, rgba(201,169,110,0.18), transparent)' }} />
        <div style={{ width: '100%', maxWidth: 400 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

/* Centred layout for OTP / logout / success pages */
export function AuthCenter({ children }) {
  return (
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e0d0b', position: 'relative', padding: '32px 40px' }}>
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', filter: 'blur(140px)', background: 'rgba(201,169,110,0.05)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201,169,110,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(201,169,110,0.02) 1px,transparent 1px)', backgroundSize: '80px 80px', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  )
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

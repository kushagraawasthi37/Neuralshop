import { Link } from 'react-router-dom'

const footerLinks = {
  Shop: [['Collections', '/collections'], ['New Arrivals', '/products?sort=newest'], ['Bestsellers', '/collections?filter=bestseller'], ['Trending', '/collections?filter=trending']],
  Help: [['Track Order', '/account/orders'], ['Returns', '/account/returns'], ['FAQ', '/faq'], ['Contact', '/contact']],
  Company: [['About', '/about'], ['Journal', '/journal'], ['Careers', '/careers'], ['Press', '/press']],
}

export default function Footer() {
  return (
    <footer style={{ padding: '80px 52px 40px', background: '#0d0c0b', borderTop: '1px solid rgba(201,169,110,0.08)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 60, maxWidth: 1400, margin: '0 auto', marginBottom: 60 }}>
        {/* Brand */}
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: '#f0e6d0', marginBottom: 16, letterSpacing: '0.1em' }}>
            Neural<span style={{ color: '#c9a96e' }}>·</span>Shop
          </div>
          <p style={{ fontSize: 13, color: 'rgba(240,230,208,0.35)', lineHeight: 1.6, marginBottom: 32, maxWidth: 280 }}>
            Where neural intelligence meets human taste. Commerce elevated to an art form.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'X', path: 'M4 4l16 16M4 20L20 4' },
              { label: 'IG', path: 'M4 4h16v16H4z M12 8a4 4 0 100 8 4 4 0 000-8z M16.5 7.5v.001' },
              { label: 'In', path: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z M2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z' },
            ].map(({ label, path }) => (
              <button key={label} style={{ width: 36, height: 36, border: '1px solid rgba(201,169,110,0.15)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a96e'; e.currentTarget.style.background = 'rgba(201,169,110,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.15)'; e.currentTarget.style.background = 'transparent' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,230,208,0.4)" strokeWidth="1.5">
                  <path d={path}/>
                </svg>
              </button>
            ))}
          </div>
        </div>

        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h4 style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 24 }}>{heading}</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {links.map(([label, path]) => (
                <li key={label}>
                  <Link to={path} style={{ fontSize: 13, color: 'rgba(240,230,208,0.4)', textDecoration: 'none', transition: 'color 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f0e6d0'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,230,208,0.4)'}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, borderTop: '1px solid rgba(201,169,110,0.06)', maxWidth: 1400, margin: '0 auto' }}>
        <span style={{ fontSize: 12, color: 'rgba(240,230,208,0.25)', letterSpacing: '0.05em' }}>
          © 2026 NeuralShop. All rights reserved.
        </span>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Cookies', '/cookies']].map(([label, path]) => (
            <Link key={label} to={path} style={{ fontSize: 12, color: 'rgba(240,230,208,0.25)', textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(240,230,208,0.5)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,230,208,0.25)'}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}

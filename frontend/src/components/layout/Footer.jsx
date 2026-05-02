import { Link } from 'react-router-dom'

const footerLinks = {
  Shop: [['Collections', '/collections'], ['New Arrivals', '/products?sort=newest'], ['Bestsellers', '/collections?filter=bestseller'], ['Trending', '/collections?filter=trending']],
  Help: [['Track Order', '/account/orders'], ['Returns', '/account/returns'], ['FAQ', '/faq'], ['Contact', '/contact']],
  Company: [['About', '/about'], ['Journal', '/journal'], ['Careers', '/careers'], ['Press', '/press']],
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
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
              <button key={label} className="site-footer__social-btn"
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
                  <Link to={path} className="site-footer__link"
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

      <div className="site-footer__bottom">
        <span style={{ fontSize: 12, color: 'rgba(240,230,208,0.25)', letterSpacing: '0.05em' }}>
          © 2026 NeuralShop. All rights reserved.
        </span>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Cookies', '/cookies']].map(([label, path]) => (
            <Link key={label} to={path} className="site-footer__legal-link"
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

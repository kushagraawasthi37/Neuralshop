import { Link } from "react-router-dom";

const footerLinks = {
  Shop: [
    ["Collections", "/collections"],
    ["New Arrivals", "/collections?sort=newest"],
    ["Bestsellers", "/collections?filter=bestseller"],
    ["Trending", "/collections?filter=trending"],
  ],
  Help: [
    ["Track Order", "/account/orders"],
    ["Returns", "/account/returns"],
    ["FAQ", "/faq"],
    ["Contact", "/contact"],
  ],
  Company: [
    ["About", "/about"],
    ["Journal", "/journal"],
    ["Careers", "/careers"],
    ["Press", "/press"],
  ],
};

const socials = [
  {
    label: "X",
    path: "M4 4l16 16M4 20L20 4",
  },
  {
    label: "Instagram",
    path: "M4 4h16v16H4z M12 8a4 4 0 100 8 4 4 0 000-8z M16.5 7.5v.001",
  },
  {
    label: "LinkedIn",
    path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z M2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z",
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        {/* Brand column */}
        <div className="site-footer__brand">
          <div className="site-footer__logo">
            Neural<span style={{ color: "#c9a96e" }}>·</span>Shop
          </div>
          <p className="site-footer__tagline">
            Where neural intelligence meets human taste. Commerce elevated to an
            art form.
          </p>
          <div className="site-footer__socials">
            {socials.map(({ label, path }) => (
              <button
                key={label}
                className="site-footer__social-btn"
                aria-label={label}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(240,230,208,0.4)"
                  strokeWidth="1.5"
                >
                  <path d={path} />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading} className="site-footer__col">
            <h4 className="site-footer__col-heading">{heading}</h4>
            <ul className="site-footer__col-links">
              {links.map(([label, path]) => (
                <li key={label}>
                  <Link to={path} className="site-footer__link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="site-footer__bottom">
        <span className="site-footer__copyright">
          © 2026 NeuralShop. All rights reserved.
        </span>
        <div className="site-footer__legal">
          {[
            ["Privacy", "/privacy"],
            ["Terms", "/terms"],
            ["Cookies", "/cookies"],
          ].map(([label, path]) => (
            <Link key={label} to={path} className="site-footer__legal-link">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

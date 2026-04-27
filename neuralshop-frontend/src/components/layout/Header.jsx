import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const logoutPath = location.pathname.startsWith("/admin")
    ? "/admin/logout"
    : "/logout";

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/40 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-xl font-bold tracking-wide text-white">
          Neural<span className="text-blue-500">Shop</span>
        </h1>

        {/* Nav Links */}
        <nav className="hidden md:flex gap-8 text-white/80">
          <a href="#" className="hover:text-white transition">
            Home
          </a>
          <a href="#" className="hover:text-white transition">
            Products
          </a>
          <a href="#" className="hover:text-white transition">
            About
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4 text-white">
          <Link to="/cart" className="hover:scale-110 transition">
            🛒
          </Link>
          <Link
            to={logoutPath}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
          >
            Logout
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

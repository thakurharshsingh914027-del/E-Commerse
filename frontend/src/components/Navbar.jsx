import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const navClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"
  }`;

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-slate-50/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-hero px-3 py-2 text-sm font-black uppercase tracking-[0.22em] text-white">
            AI
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">ai-product-recommendation-ecommerce</p>
            <p className="text-lg font-bold text-slate-950">SmartCart</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>
          <NavLink to="/products" className={navClass}>
            Products
          </NavLink>
          <NavLink to="/orders" className={navClass}>
            Orders
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="relative rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-accent px-2 py-0.5 text-xs text-white">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{user.role}</p>
              </div>
              <button type="button" onClick={logout} className="btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

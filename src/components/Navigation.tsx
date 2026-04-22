import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag, Menu, X, User } from "lucide-react";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const bgClass = scrolled || !isHome
    ? "bg-white/90 backdrop-blur-md border-b border-black/5"
    : "bg-transparent";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${bgClass}`}>
        <div className="w-full px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left - Links */}
            <div className="hidden lg:flex items-center gap-8">
              <Link to="/shop" className="nav-link text-black">Shop</Link>
              <Link to="/booking" className="nav-link text-black">Book</Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Center - Logo */}
            <Link
              to="/"
              className="absolute left-1/2 -translate-x-1/2 font-serif text-lg lg:text-xl tracking-[0.2em] font-medium text-black"
            >
              KNOTXANDKRAFTS
            </Link>

            {/* Right - Links */}
            <div className="hidden lg:flex items-center gap-8">
              {isAdmin && (
                <Link to="/admin" className="nav-link text-black">Admin</Link>
              )}
              {user ? (
                <>
                  <Link to="/account" className="nav-link text-black flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {user.name}
                  </Link>
                  <button onClick={logout} className="nav-link text-black">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="nav-link text-black">Account</Link>
              )}
              <Link to="/cart" className="nav-link text-black flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                ({totalItems})
              </Link>
            </div>

            {/* Mobile right */}
            <div className="flex lg:hidden items-center gap-4">
              <Link to="/cart" className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-black text-white text-[10px] flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-6 lg:hidden">
          <div className="flex flex-col gap-6 pt-8">
            <Link to="/shop" className="text-2xl font-serif">Shop</Link>
            <Link to="/booking" className="text-2xl font-serif">Book</Link>
            {isAdmin && (
              <Link to="/admin" className="text-2xl font-serif">Admin</Link>
            )}
            {user ? (
              <>
                <Link to="/account" className="text-2xl font-serif">My Account</Link>
                <button onClick={logout} className="text-2xl font-serif text-left">Logout</button>
              </>
            ) : (
              <Link to="/login" className="text-2xl font-serif">Account</Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

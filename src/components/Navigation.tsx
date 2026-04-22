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

  const bgClass =
    scrolled || !isHome
      ? "bg-white/90 backdrop-blur-md border-b border-black/5"
      : "bg-transparent";

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${bgClass}`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-10 lg:px-16">
          {/* Left - Links */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/shop" className="nav-link">
              Shop
            </Link>
            <Link to="/booking" className="nav-link">
              Book
            </Link>
            <Link to="/gallery" className="nav-link">
              Gallery
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Center - Logo */}
          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 font-serif text-lg tracking-[0.25em] text-black md:text-xl"
          >
            KNOTXANDKRAFTS
          </Link>

          {/* Right - Links */}
          <div className="hidden items-center gap-6 md:flex">
            {isAdmin && (
              <Link to="/admin" className="nav-link">
                Admin
              </Link>
            )}

            {user ? (
              <>
                <Link to="/account" className="nav-link">
                  {user.name}
                </Link>
                <button type="button" onClick={logout} className="nav-link">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/account" className="nav-link">
                Account
              </Link>
            )}

            <Link to="/cart" className="relative nav-link flex items-center gap-2">
              <ShoppingBag size={16} />
              <span>({totalItems})</span>
            </Link>
          </div>

          {/* Mobile right */}
          <div className="flex items-center gap-3 md:hidden">
            <Link to="/account" aria-label="Account">
              <User size={18} />
            </Link>

            <Link to="/cart" className="relative" aria-label="Cart">
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t border-black/5 bg-white px-6 py-6 md:hidden">
            <nav className="flex flex-col gap-5">
              <Link to="/shop" className="nav-link">
                Shop
              </Link>
              <Link to="/booking" className="nav-link">
                Book
              </Link>
              <Link to="/gallery" className="nav-link">
                Gallery
              </Link>

              {isAdmin && (
                <Link to="/admin" className="nav-link">
                  Admin
                </Link>
              )}

              {user ? (
                <>
                  <Link to="/account" className="nav-link">
                    My Account
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-left nav-link"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/account" className="nav-link">
                  Account
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

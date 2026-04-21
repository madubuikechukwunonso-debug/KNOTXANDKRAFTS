import { Link } from "react-router";
import { Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#f6f6f6] border-t border-black/5 py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row justify-between gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="font-serif text-2xl tracking-[0.15em]">
              KNOTXANDKRAFTS
            </Link>
            <p className="mt-4 text-black/40 text-sm max-w-xs leading-relaxed">
              Luxury hair braiding and curated hair care products.
              Crafted with intention, delivered with care.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-16">
            <div>
              <h4 className="text-xs uppercase tracking-widest font-medium mb-4">Explore</h4>
              <ul className="space-y-3">
                <li><Link to="/shop" className="text-sm text-black/50 hover:text-black transition-colors">Shop</Link></li>
                <li><Link to="/booking" className="text-sm text-black/50 hover:text-black transition-colors">Book</Link></li>
                <li><Link to="/account" className="text-sm text-black/50 hover:text-black transition-colors">Account</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-medium mb-4">Company</h4>
              <ul className="space-y-3">
                <li><span className="text-sm text-black/50 cursor-pointer hover:text-black transition-colors">About</span></li>
                <li><span className="text-sm text-black/50 cursor-pointer hover:text-black transition-colors">Careers</span></li>
                <li><span className="text-sm text-black/50 cursor-pointer hover:text-black transition-colors">Press</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-medium mb-4">Connect</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-black/50 hover:text-black transition-colors flex items-center gap-2">
                    <Instagram className="w-4 h-4" /> Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-black/50 hover:text-black transition-colors flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-black/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-black/30">
            &copy; {new Date().getFullYear()} KNOTXANDKRAFTS. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-black/30 cursor-pointer hover:text-black/50 transition-colors">Privacy</span>
            <span className="text-xs text-black/30 cursor-pointer hover:text-black/50 transition-colors">Terms</span>
            <span className="text-xs text-black/30 cursor-pointer hover:text-black/50 transition-colors">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

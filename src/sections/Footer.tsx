import { Link } from "react-router";
import { Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black px-6 py-16 text-white md:px-10 lg:px-16">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-2">
          <h2 className="font-serif text-3xl tracking-[0.2em]">
            KNOTXANDKRAFTS
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/65">
            Luxury hair braiding and curated hair care products. Crafted with
            intention, delivered with care.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="mb-4 text-xs uppercase tracking-[0.3em] text-white/55">
            Explore
          </h3>
          <div className="flex flex-col gap-3 text-sm text-white/80">
            <Link to="/shop" className="transition-opacity hover:opacity-60">
              Shop
            </Link>
            <Link to="/booking" className="transition-opacity hover:opacity-60">
              Book
            </Link>
            <Link to="/gallery" className="transition-opacity hover:opacity-60">
              Gallery
            </Link>
            <Link to="/account" className="transition-opacity hover:opacity-60">
              Account
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-xs uppercase tracking-[0.3em] text-white/55">
            Connect
          </h3>
          <div className="flex flex-col gap-3 text-sm text-white/80">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-60"
            >
              <Instagram size={16} />
              Instagram
            </a>

            <a
              href="mailto:hello@knotxandkrafts.com"
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-60"
            >
              <Mail size={16} />
              Contact
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mx-auto mt-14 flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.25em] text-white/45 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} KNOTXANDKRAFTS. All rights reserved.</p>

        <div className="flex gap-5">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Cookies</span>
        </div>
      </div>
    </footer>
  );
}

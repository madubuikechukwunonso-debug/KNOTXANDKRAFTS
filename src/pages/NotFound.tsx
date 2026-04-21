import { Link } from "react-router";
import Navigation from "@/components/Navigation";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <h1 className="font-serif text-6xl lg:text-8xl font-light mb-4">404</h1>
        <p className="text-black/50 text-sm mb-8">Page not found</p>
        <Link
          to="/"
          className="text-sm uppercase tracking-widest border-b border-black pb-1 hover:opacity-60 transition-opacity"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

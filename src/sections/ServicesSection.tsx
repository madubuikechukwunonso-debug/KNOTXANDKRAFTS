import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

export default function ServicesSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="w-full">
      <div className="flex flex-col lg:flex-row min-h-[600px] lg:min-h-[700px]">
        {/* Left - Text Panel */}
        <div
          className={`w-full lg:w-1/2 bg-black text-white flex items-center justify-center p-12 lg:p-20 transition-all duration-1000 ${
            visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
          }`}
        >
          <div className="max-w-md">
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light leading-tight mb-6">
              Book Your
              <br />
              Session
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              Experience the art of bespoke braiding in our luxury salon.
              Our master stylists create personalized braided masterpieces
              tailored to your unique style and hair texture. From consultation
              to completion, every detail is crafted with precision and care.
            </p>
            <Link
              to="/booking"
              className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-sm uppercase tracking-widest font-medium hover:bg-white/90 transition-all duration-300 group"
            >
              View Availability
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right - Image Panel */}
        <div
          className={`w-full lg:w-1/2 overflow-hidden transition-all duration-1000 delay-200 ${
            visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
          }`}
        >
          <div className="w-full h-full min-h-[400px] lg:min-h-0 group">
            <img
              src="/images/services/braiding-service.jpg"
              alt="Luxury braiding service"
              className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

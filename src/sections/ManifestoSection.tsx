import { useEffect, useRef, useState } from "react";

export default function ManifestoSection() {
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
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="w-full bg-white py-24 lg:py-40">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <p
          className={`font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-snug lg:leading-tight text-black/90 transition-all duration-1000 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Every strand tells a story. We weave tradition with modern elegance,
          creating bespoke braided masterpieces that honor your unique texture
          and spirit.
        </p>
        <div
          className={`mt-12 transition-all duration-1000 delay-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="w-16 h-px bg-black/20 mx-auto" />
        </div>
      </div>
    </section>
  );
}

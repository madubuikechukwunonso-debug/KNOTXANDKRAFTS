import { Link } from "react-router";
import { galleryImages } from "@/lib/galleryImages";
import { ArrowRight } from "lucide-react";

export default function HomeGallerySection() {
  const featuredImages = galleryImages.slice(0, 4);

  return (
    <section className="bg-[#f7f3ee] px-6 py-20 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-black/45">
              Gallery
            </p>
            <h2 className="font-serif text-4xl leading-tight text-black md:text-5xl">
              A closer look at the craft
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-black/65 md:text-base">
              Explore selected braid looks from our collection of luxury,
              detail-focused styling. Every finish is designed to feel polished,
              soft, and intentional.
            </p>
          </div>

          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 self-start border border-black px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-black transition-all duration-300 hover:bg-black hover:text-white"
          >
            View Full Gallery
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredImages.map((image, index) => (
            <Link
              key={image.id}
              to="/gallery"
              className={`group relative overflow-hidden bg-neutral-200 ${
                index === 0 || index === 3 ? "sm:aspect-[3/4]" : "sm:aspect-[4/5]"
              } aspect-[4/5]`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-90" />

              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/70">
                  {image.category}
                </p>
                <p className="mt-2 font-serif text-2xl">Signature Style</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

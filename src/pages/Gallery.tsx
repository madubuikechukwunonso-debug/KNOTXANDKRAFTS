import { useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/sections/Footer";
import { galleryImages } from "@/lib/galleryImages";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Knotless", value: "knotless" },
  { label: "Stitch", value: "stitch" },
  { label: "Creative", value: "creative" },
  { label: "Luxury", value: "luxury" },
] as const;

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]["value"]>("all");

  const filteredImages = useMemo(() => {
    if (activeFilter === "all") return galleryImages;
    return galleryImages.filter((image) => image.category === activeFilter);
  }, [activeFilter]);

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-[#f8f5f0] pt-28 text-black">
        <section className="px-6 pb-10 pt-8 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-black/45">
              KNOTXANDKRAFTS
            </p>

            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <h1 className="font-serif text-5xl leading-[0.95] md:text-7xl">
                  Gallery
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-black/65 md:text-base">
                  A curated visual archive of braid artistry, texture,
                  precision, and finish. Browse featured looks and explore the
                  styles shaping the KNOTXANDKRAFTS experience.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {FILTERS.map((filter) => {
                const isActive = filter.value === activeFilter;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                    className={`px-4 py-2 text-[11px] uppercase tracking-[0.28em] transition-all duration-300 ${
                      isActive
                        ? "bg-black text-white"
                        : "border border-black/15 bg-white text-black/65 hover:border-black/35 hover:text-black"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-6 pb-20 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredImages.map((image, index) => (
                <article
                  key={image.id}
                  className={`group overflow-hidden bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] ${
                    index % 5 === 0 ? "sm:col-span-2 lg:col-span-2" : ""
                  }`}
                >
                  <div className={`${index % 5 === 0 ? "aspect-[16/10]" : "aspect-[4/5]"} overflow-hidden`}>
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-black/45">
                      {image.category}
                    </p>
                    <h2 className="mt-2 font-serif text-2xl text-black">
                      Braided Editorial Look
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-black/60">
                      Precision styling, clean parting, and a polished finish
                      designed to feel luxurious and camera-ready.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

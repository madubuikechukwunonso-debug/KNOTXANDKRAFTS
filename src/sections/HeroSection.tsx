import { useEffect, useMemo, useState } from "react";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  const videos = useMemo(
    () => [
      "/videos/1.webm",
      "/videos/2.webm",
      "/videos/3.webm",
      "/videos/4.webm",
    ],
    [],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* Video grid background */}
      <div
        className={`absolute inset-0 grid grid-cols-2 grid-rows-2 transition-opacity duration-1000 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        {videos.map((src, index) => (
          <div
            key={src}
            className="relative h-full w-full overflow-hidden bg-neutral-900"
          >
            <video
              className="h-full w-full object-cover scale-[1.03]"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster=""
            >
              <source src={src} type="video/webm" />
            </video>

            {/* Per-tile shading for luxury/editorial feel */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Soft tile vignette */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.38) 100%)",
              }}
            />

            {/* Subtle tile borders */}
            <div className="pointer-events-none absolute inset-0 border border-white/5" />

            {/* Optional slight variation overlay */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: index % 2 === 0 ? 0.18 : 0.1,
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.18), transparent 35%, rgba(0,0,0,0.28))",
              }}
            />
          </div>
        ))}
      </div>

      {/* Main cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/55" />

      {/* Center focus vignette behind the write-up */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.28) 35%, rgba(0,0,0,0.58) 100%)",
        }}
      />

      {/* Hero text */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="px-6 text-center">
          <h1
            className="font-serif text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[120px] font-light tracking-tight leading-none"
            style={{
              textShadow:
                "0 0 40px rgba(0,0,0,0.82), 0 2px 10px rgba(0,0,0,0.55)",
            }}
          >
            THE ART OF
            <br />
            BRAIDING
          </h1>

          <p
            className="mt-6 text-white/80 text-sm sm:text-base uppercase tracking-[0.3em] font-light"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
          >
            Luxury Hair Craft Since 2023
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="text-white/60 text-xs uppercase tracking-widest">
          Scroll
        </span>
        <div className="h-8 w-px animate-pulse bg-white/40" />
      </div>
    </section>
  );
}

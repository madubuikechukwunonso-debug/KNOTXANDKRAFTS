import { useEffect, useRef, useState } from "react";
import { trpc } from "@/providers/trpc";

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { data: heroImages } = trpc.heroImage.list.useQuery();
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const progressRef = useRef(0);
  const currentIndexRef = useRef(0);
  const nextIndexRef = useRef(1);

  useEffect(() => {
    if (!heroImages || heroImages.length === 0) return;

    const loadImages = async () => {
      const imgs: HTMLImageElement[] = [];
      for (const hi of heroImages) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = hi.url;
        });
        imgs.push(img);
      }
      imagesRef.current = imgs;
      setLoaded(true);
    };

    loadImages();
  }, [heroImages]);

  useEffect(() => {
    if (!loaded || !canvasRef.current || imagesRef.current.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let autoProgress = 0;
    let direction = 1;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drawGrid = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / 180);
      const rows = Math.ceil(h / 220);
      const cellW = w / cols;
      const cellH = h / rows;

      const currentImg = imagesRef.current[currentIndexRef.current];
      const nextImg = imagesRef.current[nextIndexRef.current];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cellW;
          const y = r * cellH;
          const threshold = (r * cols + c) / (rows * cols);

          const useNext = autoProgress > threshold;
          const srcImg = useNext ? nextImg : currentImg;
          if (!srcImg || !srcImg.complete) continue;

          const scale = 0.85;
          const imgAspect = srcImg.width / srcImg.height;
          const cellAspect = cellW / cellH;
          let sx = 0, sy = 0, sw = srcImg.width, sh = srcImg.height;

          if (imgAspect > cellAspect) {
            sw = srcImg.height * cellAspect;
            sx = (srcImg.width - sw) / 2 + (c - cols / 2) * sw * 0.05;
          } else {
            sh = srcImg.width / cellAspect;
            sy = (srcImg.height - sh) / 2 + (r - rows / 2) * sh * 0.05;
          }

          const pad = cellW * (1 - scale) / 2;

          ctx.save();
          ctx.beginPath();
          ctx.rect(x + pad, y + pad, cellW - pad * 2, cellH - pad * 2);
          ctx.clip();

          try {
            ctx.drawImage(
              srcImg,
              Math.max(0, sx), Math.max(0, sy), sw, sh,
              x + pad, y + pad, cellW - pad * 2, cellH - pad * 2,
            );
          } catch { /* skip failed draws */ }

          const vignette = Math.sin((c / cols) * Math.PI) * Math.sin((r / rows) * Math.PI) * 0.15;
          ctx.fillStyle = `rgba(0,0,0,${vignette})`;
          ctx.fillRect(x + pad, y + pad, cellW - pad * 2, cellH - pad * 2);

          ctx.restore();
        }
      }
    };

    const animate = () => {
      autoProgress += 0.008 * direction;
      if (autoProgress >= 1) {
        autoProgress = 0;
        currentIndexRef.current = nextIndexRef.current;
        nextIndexRef.current = (nextIndexRef.current + 1) % imagesRef.current.length;
      }
      progressRef.current = autoProgress;
      drawGrid();
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [loaded]);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 1s" }}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      {/* Hero text */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center px-6">
          <h1
            className="font-serif text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[120px] font-light tracking-tight leading-none"
            style={{ textShadow: "0 0 40px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.5)" }}
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-white/60 text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-white/40 animate-pulse" />
      </div>
    </section>
  );
}

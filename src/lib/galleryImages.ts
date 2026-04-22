export type GalleryImage = {
  id: number;
  src: string;
  alt: string;
  category: "knotless" | "stitch" | "creative" | "luxury";
};

export const galleryImages: GalleryImage[] = [
  {
    id: 1,
    src: "/images/hero/hero-1.jpg",
    alt: "Luxury braided hairstyle showcase 1",
    category: "luxury",
  },
  {
    id: 2,
    src: "/images/hero/hero-2.jpg",
    alt: "Luxury braided hairstyle showcase 2",
    category: "knotless",
  },
  {
    id: 3,
    src: "/images/hero/hero-3.jpg",
    alt: "Luxury braided hairstyle showcase 3",
    category: "creative",
  },
  {
    id: 4,
    src: "/images/hero/hero-4.jpg",
    alt: "Luxury braided hairstyle showcase 4",
    category: "stitch",
  },
  {
    id: 5,
    src: "/images/hero/hero-5.jpg",
    alt: "Luxury braided hairstyle showcase 5",
    category: "knotless",
  },
  {
    id: 6,
    src: "/images/hero/hero-6.jpg",
    alt: "Luxury braided hairstyle showcase 6",
    category: "creative",
  },
  {
    id: 7,
    src: "/images/hero/hero-7.jpg",
    alt: "Luxury braided hairstyle showcase 7",
    category: "stitch",
  },
  {
    id: 8,
    src: "/images/hero/hero-8.jpg",
    alt: "Luxury braided hairstyle showcase 8",
    category: "luxury",
  },
];

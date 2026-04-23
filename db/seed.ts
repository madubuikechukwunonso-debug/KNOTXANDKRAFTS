import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL");
}

const pool = createPool(databaseUrl);

const db = drizzle(pool, { schema, mode: "default" });

async function seed() {
  console.log("Seeding products...");

  await db.insert(schema.products).values([
    {
      name: "Botanical Hair Growth Oil",
      description:
        "A luxurious blend of natural oils formulated to nourish the scalp and stimulate healthy hair growth. Perfect for maintaining braids and protecting natural hair.",
      price: 3499,
      image: "/images/products/hair-oil.jpg",
      category: "hair-care",
      inventory: 50,
      featured: 1,
    },
    {
      name: "Noire Velour Edge Control",
      description:
        "Professional-grade edge control with a strong yet flexible hold. Keeps edges sleek and smooth all day without flaking or residue.",
      price: 1899,
      image: "/images/products/edge-control.jpg",
      category: "styling",
      inventory: 75,
      featured: 1,
    },
    {
      name: "Silk Satin Bonnet",
      description:
        "Premium champagne gold silk satin bonnet designed to protect your braids and natural hair while you sleep. Reduces frizz and preserves style.",
      price: 2499,
      image: "/images/products/satin-bonnet.jpg",
      category: "accessories",
      inventory: 40,
      featured: 1,
    },
    {
      name: "Aurum Nourish Leave-In Conditioner",
      description:
        "Lightweight leave-in conditioner that hydrates and detangles. Infused with gold-standard ingredients for silky, manageable hair.",
      price: 2899,
      image: "/images/products/leave-in.jpg",
      category: "hair-care",
      inventory: 60,
      featured: 1,
    },
    {
      name: "Aurum Botanica Scalp Elixir",
      description:
        "Luxury scalp treatment with botanical extracts. Soothes irritated scalp, reduces dryness, and promotes healthy hair follicles.",
      price: 4299,
      image: "/images/products/scalp-oil.jpg",
      category: "hair-care",
      inventory: 30,
      featured: 0,
    },
    {
      name: "Rose Gold Detangling Set",
      description:
        "Elegant wide-tooth comb and paddle brush set in rose gold finish. Designed to gently detangle braided and natural hair without breakage.",
      price: 3499,
      image: "/images/products/brush-set.jpg",
      category: "tools",
      inventory: 25,
      featured: 0,
    },
  ]);

  console.log("Seeding hero images...");

  await db.insert(schema.heroImages).values([
    {
      url: "/images/hero/hero-1.jpg",
      alt: "Knotless braids with gold accessories",
      sortOrder: 0,
      active: 1,
    },
    {
      url: "/images/hero/hero-2.jpg",
      alt: "Elegant cornrow styling",
      sortOrder: 1,
      active: 1,
    },
    {
      url: "/images/hero/hero-3.jpg",
      alt: "Goddess locs braiding",
      sortOrder: 2,
      active: 1,
    },
    {
      url: "/images/hero/hero-4.jpg",
      alt: "Box braids with gold cuffs",
      sortOrder: 3,
      active: 1,
    },
    {
      url: "/images/hero/hero-5.jpg",
      alt: "Braiding hair extensions",
      sortOrder: 4,
      active: 1,
    },
    {
      url: "/images/hero/hero-6.jpg",
      alt: "Fulani braids with beads",
      sortOrder: 5,
      active: 1,
    },
    {
      url: "/images/hero/hero-7.jpg",
      alt: "Senegalese twists",
      sortOrder: 6,
      active: 1,
    },
    {
      url: "/images/hero/hero-8.jpg",
      alt: "Braiding salon session",
      sortOrder: 7,
      active: 1,
    },
  ]);

  console.log("Seed complete!");
  await pool.end();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  pool.end().catch(() => {});
  process.exit(1);
});

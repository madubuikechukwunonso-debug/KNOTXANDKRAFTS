import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/hooks/useCart";
import Navigation from "@/components/Navigation";
import Footer from "@/sections/Footer";
import { ShoppingBag, Check } from "lucide-react";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Hair Care", value: "hair-care" },
  { label: "Styling", value: "styling" },
  { label: "Accessories", value: "accessories" },
  { label: "Tools", value: "tools" },
];

export default function Shop() {
  const [category, setCategory] = useState("");
  const [addedId, setAddedId] = useState<number | null>(null);
  const { data: products } = trpc.product.list.useQuery(
    category ? { category } : undefined,
  );
  const { addItem } = useCart();

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handleAdd = (product: NonNullable<typeof products>[0]) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image || "",
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-24 lg:pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light mb-4">
              Shop
            </h1>
            <p className="text-black/50 text-sm max-w-lg">
              Premium hair care products curated by our master stylists.
              Each product is selected for quality, effectiveness, and luxury.
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-4 mb-12">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`text-xs uppercase tracking-widest px-4 py-2 border transition-all ${
                  category === cat.value
                    ? "bg-black text-white border-black"
                    : "border-black/10 text-black/50 hover:border-black/30"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Products */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {products?.map((product) => (
              <div key={product.id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f6f6f6] mb-4">
                  <img
                    src={product.image || "/images/products/hair-oil.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <button
                    onClick={() => handleAdd(product)}
                    className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                      addedId === product.id
                        ? "bg-green-500 text-white"
                        : "bg-white text-black opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white"
                    }`}
                  >
                    {addedId === product.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <ShoppingBag className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <h3 className="text-sm font-medium">{product.name}</h3>
                <p className="text-sm text-black/50 mt-1">
                  {formatPrice(product.price)}
                </p>
              </div>
            ))}
          </div>

          {products?.length === 0 && (
            <div className="text-center py-20">
              <p className="text-black/40">No products found</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

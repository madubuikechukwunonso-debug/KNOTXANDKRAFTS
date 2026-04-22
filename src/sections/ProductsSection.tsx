import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag } from "lucide-react";

export default function ProductsSection() {
  const { data: products } = trpc.product.list.useQuery({ featured: true });
  const { addItem } = useCart();
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
      { threshold: 0.15 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <section ref={ref} className="w-full bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light">
            Curated Essentials
          </h2>
          <p className="mt-4 text-black/50 text-sm uppercase tracking-widest">
            Premium hair care products
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products?.map((product, i) => (
            <div
              key={product.id}
              className={`group transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              <Link to="/shop" className="block">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f6f6f6] mb-4">
                  <img
                    src={product.image || "/images/products/hair-oil.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      addItem({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        image: product.image || "",
                      });
                    }}
                    className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:bg-black hover:text-white"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-sm font-medium text-black group-hover:opacity-60 transition-opacity">
                  {product.name}
                </h3>
                <p className="text-sm text-black/50 mt-1">
                  {formatPrice(product.price)}
                </p>
              </Link>
            </div>
          ))}
        </div>

        {/* View All */}
        <div
          className={`text-center mt-16 transition-all duration-1000 delay-700 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <Link
            to="/shop"
            className="inline-block text-sm uppercase tracking-widest font-medium border-b border-black pb-1 hover:opacity-60 transition-opacity"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}

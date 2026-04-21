import { Link } from "react-router";
import { useCart } from "@/hooks/useCart";
import Navigation from "@/components/Navigation";
import Footer from "@/sections/Footer";
import { Minus, Plus, X, ArrowLeft, ShoppingBag } from "lucide-react";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-24 lg:pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>

          <h1 className="font-serif text-4xl sm:text-5xl font-light mb-10">
            Shopping Cart
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-12 h-12 text-black/10 mx-auto mb-4" />
              <p className="text-black/40 text-lg mb-4">Your cart is empty</p>
              <Link
                to="/shop"
                className="inline-block text-sm uppercase tracking-widest border-b border-black pb-1 hover:opacity-60 transition-opacity"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Items */}
              <div className="flex-1">
                <div className="space-y-6">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-4 pb-6 border-b border-black/5"
                    >
                      <div className="w-24 h-32 bg-[#f6f6f6] flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-medium">{item.name}</h3>
                          <p className="text-sm text-black/50 mt-1">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 border border-black/10">
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1)
                              }
                              className="p-2 hover:bg-black/5 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                              className="p-2 hover:bg-black/5 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="p-2 text-black/30 hover:text-black transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="w-full lg:w-80">
                <div className="bg-[#f6f6f6] p-6 lg:p-8">
                  <h2 className="text-xs uppercase tracking-widest font-medium mb-6">
                    Order Summary
                  </h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-black/50">Subtotal</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-black/50">Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>
                  <div className="border-t border-black/10 pt-4 mb-6">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-medium">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                  <Link
                    to="/checkout"
                    className="block w-full bg-black text-white py-4 text-center text-sm uppercase tracking-widest font-medium hover:bg-black/80 transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

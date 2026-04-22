import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Check, ArrowLeft } from "lucide-react";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [submitted, setSubmitted] = useState(false);

  const createOrder = trpc.order.create.useMutation();

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    try {
      await createOrder.mutateAsync({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customerName,
        customerEmail,
        userId: user?.id,
        userType: user?.userType,
      });

      setSubmitted(true);
      clearCart();
    } catch {
      // Order failed
    }
  };

  if (items.length === 0 && !submitted) {
    navigate("/cart");
    return null;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 lg:pt-32 pb-20 px-6">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-4">
              Order Placed
            </h2>
            <p className="text-black/50 text-sm mb-8">
              Thank you for your order! We&apos;ll send a confirmation email shortly.
              Your items will be processed and shipped soon.
            </p>
            <Link
              to="/shop"
              className="inline-block text-sm uppercase tracking-widest border-b border-black pb-1 hover:opacity-60 transition-opacity"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-24 lg:pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to cart
          </Link>

          <h1 className="font-serif text-4xl sm:text-5xl font-light mb-10">
            Checkout
          </h1>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Form */}
            <div className="flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xs uppercase tracking-widest font-medium mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-black/50 mb-1 block">Full Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-black/50 mb-1 block">Email</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest font-medium mb-4">
                    Payment (Mock)
                  </h3>
                  <div className="bg-[#f6f6f6] p-6 text-center">
                    <p className="text-sm text-black/50">
                      This is a demo checkout. No real payment will be processed.
                    </p>
                    <p className="text-xs text-black/30 mt-2">
                      Stripe integration ready for production
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createOrder.isPending}
                  className="w-full bg-black text-white py-4 text-sm uppercase tracking-widest font-medium hover:bg-black/80 transition-colors disabled:opacity-50"
                >
                  {createOrder.isPending ? "Processing..." : `Pay ${formatPrice(totalPrice)}`}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-80">
              <div className="bg-[#f6f6f6] p-6 lg:p-8">
                <h2 className="text-xs uppercase tracking-widest font-medium mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-black/60">
                        {item.name} x {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-black/10 pt-4">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

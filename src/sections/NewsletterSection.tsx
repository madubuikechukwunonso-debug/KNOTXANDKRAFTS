import { useState, useRef, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { ArrowRight, Check } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const subscribe = trpc.subscriber.subscribe.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setEmail("");
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="w-full bg-[#f6f6f6] py-24 lg:py-32">
      <div
        className={`max-w-xl mx-auto px-6 text-center transition-all duration-1000 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light mb-4">
          Join the Inner Circle
        </h2>
        <p className="text-black/50 text-sm mb-10">
          Exclusive offers, styling tips, and early access to new collections.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">Thank you for subscribing</span>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) subscribe.mutate({ email });
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-white border-0 px-6 py-4 text-sm outline-none focus:ring-1 focus:ring-black/20"
              required
            />
            <button
              type="submit"
              disabled={subscribe.isPending}
              className="bg-black text-white px-8 py-4 text-sm uppercase tracking-widest font-medium flex items-center justify-center gap-2 hover:bg-black/80 transition-colors disabled:opacity-50"
            >
              {subscribe.isPending ? "..." : (
                <>
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

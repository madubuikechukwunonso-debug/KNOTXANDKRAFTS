import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import Navigation from "@/components/Navigation";
import Footer from "@/sections/Footer";
import { User, Calendar, ShoppingBag, ArrowLeft, LogOut } from "lucide-react";

export default function Account() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const { data: myBookings } = trpc.booking.myBookings.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: myOrders } = trpc.order.myOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-24 lg:pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-3xl lg:text-4xl font-light">
                {user.name}
              </h1>
              <p className="text-sm text-black/50">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="ml-auto flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Bookings */}
            <div>
              <h2 className="flex items-center gap-2 text-xs uppercase tracking-widest font-medium mb-6">
                <Calendar className="w-4 h-4" />
                My Bookings
              </h2>

              {myBookings && myBookings.length > 0 ? (
                <div className="space-y-4">
                  {myBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-black/5 p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium capitalize">
                          {booking.serviceType.replace(/-/g, " ")}
                        </p>
                        <span
                          className={`text-xs uppercase px-2 py-1 ${
                            booking.status === "confirmed"
                              ? "bg-green-50 text-green-600"
                              : booking.status === "pending"
                                ? "bg-yellow-50 text-yellow-600"
                                : booking.status === "cancelled"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-xs text-black/50">
                        {booking.date} at {booking.time}
                      </p>
                      {booking.notes && (
                        <p className="text-xs text-black/30 mt-2">{booking.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-[#f6f6f6]">
                  <p className="text-sm text-black/40 mb-2">No bookings yet</p>
                  <Link
                    to="/booking"
                    className="text-xs uppercase tracking-widest border-b border-black pb-0.5 hover:opacity-60 transition-opacity"
                  >
                    Book Now
                  </Link>
                </div>
              )}
            </div>

            {/* Orders */}
            <div>
              <h2 className="flex items-center gap-2 text-xs uppercase tracking-widest font-medium mb-6">
                <ShoppingBag className="w-4 h-4" />
                My Orders
              </h2>

              {myOrders && myOrders.length > 0 ? (
                <div className="space-y-4">
                  {myOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-black/5 p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium">
                          Order #{order.id}
                        </p>
                        <span className="text-xs uppercase px-2 py-1 bg-black/5">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-black/50">
                        {formatPrice(order.total)}
                      </p>
                      <p className="text-xs text-black/30 mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-[#f6f6f6]">
                  <p className="text-sm text-black/40 mb-2">No orders yet</p>
                  <Link
                    to="/shop"
                    className="text-xs uppercase tracking-widest border-b border-black pb-0.5 hover:opacity-60 transition-opacity"
                  >
                    Shop Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Footer from "@/sections/Footer";
import { Calendar, Clock, Check, ArrowLeft } from "lucide-react";

const SERVICES = [
  { id: "box-braids", name: "Box Braids", duration: "4-6 hours", price: "$180+" },
  { id: "knotless-braids", name: "Knotless Braids", duration: "5-7 hours", price: "$220+" },
  { id: "cornrows", name: "Cornrows", duration: "1-3 hours", price: "$80+" },
  { id: "goddess-locs", name: "Goddess Locs", duration: "6-8 hours", price: "$280+" },
  { id: "twists", name: "Twists", duration: "3-5 hours", price: "$150+" },
  { id: "braid-touchup", name: "Braid Touch-Up", duration: "1-2 hours", price: "$60+" },
];

export default function Booking() {
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: availableSlots } = trpc.booking.getAvailableSlots.useQuery(
    { date: selectedDate, serviceType: selectedService },
    { enabled: !!selectedDate && !!selectedService },
  );

  const createBooking = trpc.booking.create.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime) return;

    createBooking.mutate({
      customerName,
      customerEmail,
      customerPhone: customerPhone || undefined,
      serviceType: selectedService,
      date: selectedDate,
      time: selectedTime,
      notes: notes || undefined,
      userId: user?.id,
      userType: user?.userType,
    });
  };

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0];

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
              Booking Confirmed
            </h2>
            <p className="text-black/50 text-sm mb-8">
              We&apos;ve received your booking request. Our team will confirm your
              appointment shortly via email.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-widest border-b border-black pb-1 hover:opacity-60 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
            Back
          </Link>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light mb-4">
            Book Appointment
          </h1>
          <p className="text-black/50 text-sm mb-12 max-w-lg">
            Select your preferred service, date, and time. Our team will confirm
            your appointment within 24 hours.
          </p>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Service Selection */}
            <div>
              <h3 className="text-xs uppercase tracking-widest font-medium mb-4">
                1. Select Service
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SERVICES.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => {
                      setSelectedService(service.id);
                      setSelectedTime("");
                    }}
                    className={`p-4 border text-left transition-all ${
                      selectedService === service.id
                        ? "border-black bg-black text-white"
                        : "border-black/10 hover:border-black/30"
                    }`}
                  >
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className={`text-xs mt-1 ${
                      selectedService === service.id ? "text-white/60" : "text-black/40"
                    }`}>
                      {service.duration} &middot; Starting at {service.price}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            {selectedService && (
              <div className="animate-fade-in-up">
                <h3 className="text-xs uppercase tracking-widest font-medium mb-4">
                  2. Select Date
                </h3>
                <div className="relative max-w-xs">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime("");
                    }}
                    min={today}
                    max={maxDate}
                    className="w-full border border-black/10 pl-10 pr-4 py-3 text-sm outline-none focus:border-black transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            {/* Time Selection */}
            {selectedDate && availableSlots && (
              <div className="animate-fade-in-up">
                <h3 className="text-xs uppercase tracking-widest font-medium mb-4">
                  3. Select Time
                </h3>
                {availableSlots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`px-4 py-2 border text-sm transition-all ${
                          selectedTime === slot
                            ? "border-black bg-black text-white"
                            : "border-black/10 hover:border-black/30"
                        }`}
                      >
                        <Clock className="w-3 h-3 inline mr-1" />
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-black/40">
                    No available slots for this date. Please select another date.
                  </p>
                )}
              </div>
            )}

            {/* Contact Info */}
            {selectedTime && (
              <div className="animate-fade-in-up space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-medium mb-4">
                  4. Your Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-black/50 mb-1 block">Name</label>
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
                  <div>
                    <label className="text-xs text-black/50 mb-1 block">Phone (optional)</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-black/50 mb-1 block">Notes (optional)</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
                      placeholder="Any special requests?"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createBooking.isPending}
                  className="w-full sm:w-auto bg-black text-white px-12 py-4 text-sm uppercase tracking-widest font-medium hover:bg-black/80 transition-colors disabled:opacity-50 mt-4"
                >
                  {createBooking.isPending ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

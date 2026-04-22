import {
  CalendarClock,
  Image,
  MessageSquareMore,
  PackageCheck,
  Scissors,
  Send,
} from "lucide-react";
import AdminStatCard from "@/components/admin/AdminStatCard";

export default function AdminOverviewSection() {
  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard
          label="Active Services"
          value="12"
          helper="Services shown on the booking page"
          icon={<Scissors size={18} />}
        />
        <AdminStatCard
          label="Pending Orders"
          value="08"
          helper="Orders waiting for shipping or fulfillment"
          icon={<PackageCheck size={18} />}
        />
        <AdminStatCard
          label="Unread Messages"
          value="05"
          helper="Contact form conversations needing a reply"
          icon={<MessageSquareMore size={18} />}
        />
        <AdminStatCard
          label="Featured Gallery"
          value="03"
          helper="Items currently highlighted on the homepage"
          icon={<Image size={18} />}
        />
        <AdminStatCard
          label="Newsletter Reach"
          value="214"
          helper="Subscribers and customers available to email"
          icon={<Send size={18} />}
        />
        <AdminStatCard
          label="Open Booking Slots"
          value="27"
          helper="Available hours across active staff schedules"
          icon={<CalendarClock size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-black/45">
            Priority Actions
          </p>

          <div className="mt-5 grid gap-4">
            <div className="rounded-2xl bg-[#f8f5f0] p-4">
              <h3 className="font-medium text-black">
                Update the booking service catalog
              </h3>
              <p className="mt-2 text-sm leading-6 text-black/60">
                Add or edit braid services, durations, and prices so the booking
                page always reflects current offers.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8f5f0] p-4">
              <h3 className="font-medium text-black">
                Keep the gallery fresh
              </h3>
              <p className="mt-2 text-sm leading-6 text-black/60">
                Upload new images and videos from recent appointments and choose
                which items should appear on the homepage.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8f5f0] p-4">
              <h3 className="font-medium text-black">
                Stay on top of customer communication
              </h3>
              <p className="mt-2 text-sm leading-6 text-black/60">
                Reply to contact messages, follow up on orders, and send
                newsletters from one dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-black/45">
            Admin Workflow
          </p>

          <ol className="mt-5 space-y-4">
            {[
              "Create or edit services and products from admin.",
              "Sync pricing updates to payment workflows.",
              "Set staff working hours to control booking slots.",
              "Upload gallery media and feature selected work.",
              "Track orders and mark shipped or fulfilled.",
              "Reply to messages and follow up with customers.",
            ].map((item, index) => (
              <li key={item} className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-xs text-white">
                  {index + 1}
                </div>
                <p className="pt-1 text-sm leading-6 text-black/65">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

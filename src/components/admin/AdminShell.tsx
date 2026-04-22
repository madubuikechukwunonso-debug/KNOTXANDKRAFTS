import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  CalendarClock,
  Image,
  LayoutDashboard,
  MessageSquareMore,
  PackageCheck,
  Scissors,
  Send,
  ShoppingBag,
  UserCog,
  Users,
} from "lucide-react";
import AdminHeader from "./AdminHeader";
import AdminSidebar, { type AdminTab, type AdminTabId } from "./AdminSidebar";

type AdminShellProps = {
  activeTab: AdminTabId;
  onChangeTab: (tab: AdminTabId) => void;
  children: ReactNode;
};

export const ADMIN_TABS: AdminTab[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Business snapshot and priority actions",
    icon: LayoutDashboard,
  },
  {
    id: "services",
    label: "Services",
    description: "Create and update booking services",
    icon: Scissors,
  },
  {
    id: "products",
    label: "Products",
    description: "Manage storefront products and pricing",
    icon: ShoppingBag,
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Upload images and videos of your work",
    icon: Image,
  },
  {
    id: "orders",
    label: "Orders",
    description: "Track, fulfill, and ship store orders",
    icon: PackageCheck,
  },
  {
    id: "newsletter",
    label: "Newsletter",
    description: "Send campaigns to individuals or everyone",
    icon: Send,
  },
  {
    id: "users",
    label: "Users",
    description: "View active users and moderate access",
    icon: Users,
  },
  {
    id: "staff",
    label: "Staff",
    description: "Manage admins, workers, and permissions",
    icon: UserCog,
  },
  {
    id: "messages",
    label: "Messages",
    description: "Reply to contact form messages and follow up",
    icon: MessageSquareMore,
  },
  {
    id: "booking",
    label: "Booking Hours",
    description: "Set working days, hours, and availability",
    icon: CalendarClock,
  },
];

function getHeaderCopy(tab: AdminTabId) {
  switch (tab) {
    case "overview":
      return {
        title: "Admin Overview",
        description:
          "A mobile-friendly control center for your shop, bookings, gallery, staff, and client communication.",
      };
    case "services":
      return {
        title: "Services",
        description:
          "Create and edit booking services, pricing, durations, and availability rules.",
      };
    case "products":
      return {
        title: "Products",
        description:
          "Manage shop items, keep pricing current, and prepare for Stripe product syncing.",
      };
    case "gallery":
      return {
        title: "Gallery",
        description:
          "Upload finished work, feature selected items on the homepage, and control gallery ordering.",
      };
    case "orders":
      return {
        title: "Orders",
        description:
          "View customer orders, update shipping state, and mark items fulfilled after dispatch.",
      };
    case "newsletter":
      return {
        title: "Newsletter",
        description:
          "Compose campaigns, search for recipients, or send an email to everyone at once.",
      };
    case "users":
      return {
        title: "Users",
        description:
          "List active users, review access, and block or restore accounts when needed.",
      };
    case "staff":
      return {
        title: "Staff",
        description:
          "Create admins and workers, assign responsibilities, and manage team permissions.",
      };
    case "messages":
      return {
        title: "Messages",
        description:
          "Reply to contact form messages, track follow-ups, and keep client conversations organized.",
      };
    case "booking":
      return {
        title: "Booking Hours",
        description:
          "Control working days and hours so only valid booking slots appear to customers.",
      };
    default:
      return {
        title: "Admin",
        description: "Manage the platform from one responsive workspace.",
      };
  }
}

export default function AdminShell({
  activeTab,
  onChangeTab,
  children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const headerCopy = useMemo(() => getHeaderCopy(activeTab), [activeTab]);

  return (
    <div className="min-h-screen bg-[#f8f5f0] text-black">
      <div className="flex min-h-screen">
        <AdminSidebar
          tabs={ADMIN_TABS}
          activeTab={activeTab}
          onChange={onChangeTab}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader
            title={headerCopy.title}
            description={headerCopy.description}
            onMenuClick={() => setMobileOpen(true)}
          />

          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

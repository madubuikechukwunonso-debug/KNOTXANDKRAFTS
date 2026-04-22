import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import type { AdminTabId } from "@/components/admin/AdminSidebar";
import AdminOverviewSection from "@/sections/admin/AdminOverviewSection";
import AdminModulePlaceholder from "@/sections/admin/AdminModulePlaceholder";

function renderAdminTab(tab: AdminTabId) {
  switch (tab) {
    case "overview":
      return <AdminOverviewSection />;

    case "services":
      return (
        <AdminModulePlaceholder
          eyebrow="Services"
          title="Manage services for booking"
          description="Create braid services, update prices, change durations, and control which services are visible on the booking page."
          bullets={[
            "Create and edit services with title, description, duration, and price.",
            "Hide inactive services without deleting past booking history.",
            "Prepare service records for later payment syncing and booking logic.",
          ]}
        />
      );

    case "products":
      return (
        <AdminModulePlaceholder
          eyebrow="Products"
          title="Manage store products"
          description="Keep the shop current by creating and editing products from admin, including pricing, images, and stock-related notes."
          bullets={[
            "Add product title, description, price, image, and active status.",
            "Reflect price changes safely across checkout flows.",
            "Prepare products for automatic Stripe syncing in the next backend step.",
          ]}
        />
      );

    case "gallery":
      return (
        <AdminModulePlaceholder
          eyebrow="Gallery"
          title="Upload and feature your work"
          description="Use this section to upload images and videos of finished styles, manage captions, and choose what appears on the homepage and gallery page."
          bullets={[
            "Upload image and video gallery items.",
            "Feature selected items on the homepage preview section.",
            "Reorder gallery entries and disable items without losing them.",
          ]}
        />
      );

    case "orders":
      return (
        <AdminModulePlaceholder
          eyebrow="Orders"
          title="Track and fulfill orders"
          description="View incoming shop orders, check customer details, and update shipping state as items move through your workflow."
          bullets={[
            "See pending, shipped, fulfilled, and cancelled orders.",
            "Mark items shipped or fulfilled from admin.",
            "Trigger customer email updates when order status changes.",
          ]}
        />
      );

    case "newsletter":
      return (
        <AdminModulePlaceholder
          eyebrow="Newsletter"
          title="Send updates and campaigns"
          description="Create newsletters for selected recipients or send one message to everyone, with recipient suggestions built into the composer."
          bullets={[
            "Search for individual recipients by email or name.",
            "Use a send-to-everyone option for full campaigns.",
            "Track sent campaigns and recipients over time.",
          ]}
        />
      );

    case "users":
      return (
        <AdminModulePlaceholder
          eyebrow="Users"
          title="Manage active users"
          description="Review active users, moderate account access, and block users when necessary while keeping account history intact."
          bullets={[
            "List recent and active users clearly.",
            "Block and unblock accounts from one place.",
            "Show status, role, and last activity in a mobile-friendly layout.",
          ]}
        />
      );

    case "staff":
      return (
        <AdminModulePlaceholder
          eyebrow="Staff"
          title="Create admins and workers"
          description="Add new team members, assign permissions, and keep the salon workflow organized across admins and workers."
          bullets={[
            "Create additional admins and workers from the dashboard.",
            "Assign roles and control who can access each workflow.",
            "Connect staff members to booking availability and services.",
          ]}
        />
      );

    case "messages":
      return (
        <AdminModulePlaceholder
          eyebrow="Messages"
          title="Reply and follow up"
          description="Keep client communication organized by replying to contact form messages, assigning follow-ups, and tracking conversation status."
          bullets={[
            "Reply to incoming contact messages from admin.",
            "Mark messages as new, in progress, replied, or closed.",
            "Add follow-up notes so conversations are not forgotten.",
          ]}
        />
      );

    case "booking":
      return (
        <AdminModulePlaceholder
          eyebrow="Booking Hours"
          title="Control working days and hours"
          description="Set your own schedule and other staff schedules so the booking page only shows valid working days and time slots."
          bullets={[
            "Choose available days and working hours for each staff member.",
            "Disable days off automatically in the customer booking flow.",
            "Only display booking slots that fall within real availability.",
          ]}
        />
      );

    default:
      return <AdminOverviewSection />;
  }
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTabId>("overview");

  const content = useMemo(() => renderAdminTab(activeTab), [activeTab]);

  return (
    <AdminShell activeTab={activeTab} onChangeTab={setActiveTab}>
      {content}
    </AdminShell>
  );
}

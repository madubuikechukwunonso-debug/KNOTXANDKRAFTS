import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";

export type AdminTabId =
  | "overview"
  | "services"
  | "products"
  | "gallery"
  | "orders"
  | "newsletter"
  | "users"
  | "staff"
  | "messages"
  | "booking";

export type AdminTab = {
  id: AdminTabId;
  label: string;
  description: string;
  icon: LucideIcon;
};

type AdminSidebarProps = {
  tabs: AdminTab[];
  activeTab: AdminTabId;
  onChange: (tab: AdminTabId) => void;
  mobileOpen: boolean;
  onClose: () => void;
};

function SidebarContent({
  tabs,
  activeTab,
  onChange,
  onClose,
}: Omit<AdminSidebarProps, "mobileOpen">) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 lg:px-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-white/45">
            KNOTXANDKRAFTS
          </p>
          <h2 className="mt-2 font-serif text-2xl text-white">Admin</h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 text-white lg:hidden"
          aria-label="Close admin navigation"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onChange(tab.id);
                  onClose();
                }}
                className={`group flex w-full items-start gap-3 rounded-2xl px-4 py-4 text-left transition-all duration-200 ${
                  isActive
                    ? "bg-white text-black shadow-[0_10px_25px_rgba(0,0,0,0.18)]"
                    : "text-white/75 hover:bg-white/8 hover:text-white"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    isActive ? "bg-black text-white" : "bg-white/10 text-white"
                  }`}
                >
                  <Icon size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium">{tab.label}</p>
                  <p
                    className={`mt-1 text-xs leading-5 ${
                      isActive ? "text-black/60" : "text-white/45"
                    }`}
                  >
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 px-5 py-5 lg:px-6">
        <div className="rounded-3xl bg-white/8 p-4 text-white/75">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
            Workflow
          </p>
          <p className="mt-2 text-sm leading-6">
            Manage services, products, bookings, users, messages, newsletters,
            and gallery content from one place.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar({
  tabs,
  activeTab,
  onChange,
  mobileOpen,
  onClose,
}: AdminSidebarProps) {
  return (
    <>
      <aside className="hidden lg:flex lg:w-[320px] lg:shrink-0 lg:flex-col lg:bg-black">
        <SidebarContent
          tabs={tabs}
          activeTab={activeTab}
          onChange={onChange}
          onClose={onClose}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={onClose}
            className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
            aria-label="Close admin menu overlay"
          />
          <aside className="absolute left-0 top-0 h-full w-[88%] max-w-[340px] bg-black shadow-2xl">
            <SidebarContent
              tabs={tabs}
              activeTab={activeTab}
              onChange={onChange}
              onClose={onClose}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}

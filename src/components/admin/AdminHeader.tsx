import { Menu } from "lucide-react";

type AdminHeaderProps = {
  title: string;
  description: string;
  onMenuClick: () => void;
};

export default function AdminHeader({
  title,
  description,
  onMenuClick,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f8f5f0]/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="mb-1 text-[10px] uppercase tracking-[0.32em] text-black/45">
            Admin Dashboard
          </p>
          <h1 className="truncate font-serif text-2xl text-black sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-black/60">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-white text-black lg:hidden"
          aria-label="Open admin navigation"
        >
          <Menu size={18} />
        </button>
      </div>
    </header>
  );
}

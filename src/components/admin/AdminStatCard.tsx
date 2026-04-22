import type { ReactNode } from "react";

type AdminStatCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon: ReactNode;
};

export default function AdminStatCard({
  label,
  value,
  helper,
  icon,
}: AdminStatCardProps) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-black/45">
            {label}
          </p>
          <p className="mt-3 font-serif text-3xl text-black">{value}</p>
          {helper ? (
            <p className="mt-2 text-sm leading-6 text-black/60">{helper}</p>
          ) : null}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
          {icon}
        </div>
      </div>
    </div>
  );
}

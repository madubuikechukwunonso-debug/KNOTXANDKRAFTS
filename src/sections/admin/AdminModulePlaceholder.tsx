type AdminModulePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
};

export default function AdminModulePlaceholder({
  eyebrow,
  title,
  description,
  bullets,
}: AdminModulePlaceholderProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-black/45">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-serif text-3xl text-black">{title}</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-black/65 sm:text-base">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-6">
          <h3 className="font-medium text-black">What this section should do</h3>
          <ul className="mt-4 space-y-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-black" />
                <p className="text-sm leading-6 text-black/65">{bullet}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-dashed border-black/15 bg-[#f8f5f0] p-5 sm:p-6">
          <h3 className="font-medium text-black">Mobile layout notes</h3>
          <div className="mt-4 space-y-3 text-sm leading-6 text-black/60">
            <p>
              Cards stack into a single column on small screens for cleaner
              scanning.
            </p>
            <p>
              Actions should stay thumb-friendly with full-width buttons and
              large tap targets.
            </p>
            <p>
              Dense tables should collapse into card rows on mobile instead of
              forcing horizontal scrolling whenever possible.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

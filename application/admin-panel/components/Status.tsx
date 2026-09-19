export function StatusBadge({ value }: { value: string }) {
  return (
    <span className="inline-block border border-oio-gold/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-oio-gold">
      {value.replaceAll("_", " ")}
    </span>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return <p className="text-sm text-oio-mute">{label}</p>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-oio-mute">{children}</p>;
}

export function ErrorState({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-red-800">{children}</p>;
}

export function Notice({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-oio-ink">{children}</p>;
}

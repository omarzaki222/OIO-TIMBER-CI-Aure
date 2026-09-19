export function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" fill="#1a1714" />
      <path d="M32 10 L54 32 L32 54 L10 32 Z" fill="none" stroke="#c4a35a" strokeWidth="3" />
      <path d="M32 18 L46 32 L32 46 L18 32 Z" fill="#c4a35a" />
    </svg>
  );
}

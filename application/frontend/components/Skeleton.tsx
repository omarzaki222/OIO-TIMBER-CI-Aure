export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-oio-sand ${className}`} aria-hidden />;
}

export function ProductGridSkeleton() {
  return (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="mt-4 h-5 w-2/3" />
        </div>
      ))}
    </div>
  );
}

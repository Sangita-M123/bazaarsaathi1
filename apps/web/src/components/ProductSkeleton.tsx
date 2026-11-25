export function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-slate-200" />
          <div className="mt-4 h-3 w-1/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-5 w-4/5 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 flex gap-2">
            <div className="h-5 w-14 animate-pulse rounded bg-slate-200" />
            <div className="h-5 w-14 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div className="h-6 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-9 w-20 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
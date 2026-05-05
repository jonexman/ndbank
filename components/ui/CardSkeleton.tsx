export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-3 w-32 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function TableSkeleton({ rows = 5, cols = 5 }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, ri) => (
              <tr key={ri} className="border-b border-slate-100 last:border-0">
                {Array.from({ length: cols }).map((_, ci) => (
                  <td key={ci} className="px-6 py-4">
                    <div
                      className="h-4 rounded bg-slate-100 animate-pulse"
                      style={{ width: ci === 0 ? 120 : ci === 1 ? 80 : 100, animationDelay: `${(ri + ci) * 50}ms` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

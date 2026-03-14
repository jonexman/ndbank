import { PageLoader } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
      <div className="mb-8">
        <div className="h-8 w-48 rounded bg-slate-200 animate-pulse" />
        <div className="h-4 w-64 mt-2 rounded bg-slate-100 animate-pulse" />
      </div>
      <PageLoader message="Loading..." />
    </div>
  );
}

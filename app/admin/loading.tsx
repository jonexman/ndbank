import { PageLoader } from "@/components/ui";

export default function AdminLoading() {
  return (
    <div className="p-6 lg:p-8">
      <PageLoader message="Loading..." />
    </div>
  );
}

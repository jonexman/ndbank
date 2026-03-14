import { Spinner } from "./Spinner";

interface PageLoaderProps {
  message?: string;
  subtitle?: string;
}

export function PageLoader({ message = "Loading...", subtitle }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Spinner size="lg" />
      <p className="mt-4 text-base font-medium text-navy">{message}</p>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

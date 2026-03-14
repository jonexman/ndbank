interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div
      className={`inline-block rounded-full border-2 border-primary/20 border-t-primary animate-spin ${sizes[size]} ${className}`}
      style={{ animationDuration: "0.8s" }}
      role="status"
      aria-label="Loading"
    />
  );
}

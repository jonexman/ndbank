import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3 rounded-xl border bg-white text-slate-900
            placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            transition-colors
            ${error ? "border-red-400 focus:ring-red-200 focus:border-red-500" : "border-slate-200"}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {hint && !error && <p className="text-sm text-slate-500">{hint}</p>}
      </div>
    );
  }
);

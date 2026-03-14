"use client";

import { forwardRef } from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onChange, label, hint, disabled }, ref) => {
    return (
      <div className="flex items-start gap-4">
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`
            relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
            transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${checked ? "bg-primary" : "bg-gray-300"}
          `}
        >
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full
              bg-white shadow ring-0 transition duration-200 ease-in-out
              ${checked ? "translate-x-5" : "translate-x-0.5"}
            `}
          />
        </button>
        <div className="flex-1 min-w-0">
          {label && <p className="font-medium text-gray-900">{label}</p>}
          {hint && <p className="text-sm text-gray-500 mt-0.5">{hint}</p>}
        </div>
      </div>
    );
  }
);
Switch.displayName = "Switch";

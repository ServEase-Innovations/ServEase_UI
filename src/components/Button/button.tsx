// src/components/ui/button.tsx
import { cn } from "../utils";

export function Button({ className, children, startIcon, endIcon, disabled, ...props }: any) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-blue-700 border-blue-700 hover:bg-blue-50",
        disabled
          ? "opacity-50 cursor-not-allowed bg-gray-200 border-gray-300 text-gray-500 hover:bg-gray-200"
          : "hover:bg-blue-50",
        className
      )}
      {...props}
    >
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </button>
  );
}

// src/components/ui/button.tsx

import { cn } from "../utils";


export function Button({ className, children, startIcon, endIcon, ...props }: any) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-700 text-blue-700 hover:bg-blue-50",
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


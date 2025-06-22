// src/components/ui/button.tsx

import { cn } from "../utils";


export function Button({ className, ...props }) {
  return (
    <button
      className={cn("px-4 py-2 rounded-xl bg-blue-700 text-white hover:bg-blue-800", className)}
      {...props}
    />
  );
}

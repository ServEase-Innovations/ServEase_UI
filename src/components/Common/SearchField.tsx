import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "../utils";

type SearchFieldProps = Omit<React.ComponentProps<"input">, "type"> & {
  wrapperClassName?: string;
};

const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, wrapperClassName, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-10 w-full items-center gap-2.5 rounded-md border border-input bg-background px-3 shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
          wrapperClassName
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
        <input
          ref={ref}
          type="search"
          className={cn(
            "min-w-0 flex-1 border-0 bg-transparent p-0 text-base text-foreground outline-none placeholder:text-muted-foreground md:text-sm",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

SearchField.displayName = "SearchField";

export { SearchField };

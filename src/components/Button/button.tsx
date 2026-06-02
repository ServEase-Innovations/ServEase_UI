import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        /** Outline primary — matches header / provider cards (sky, not MUI default blue). */
        default:
          "border border-sky-600 text-sky-700 bg-white hover:bg-sky-50",
        destructive:
          "border border-red-600 bg-red-600 text-white hover:bg-red-700",
        outline:
          "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
        secondary:
          "border border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost: "border border-transparent hover:bg-sky-50 text-slate-800",
        link: "border-transparent text-sky-700 underline-offset-4 hover:underline",
        /** Filled CTA — same family as ChatbotButton / ProviderDetails Book now */
        contained:
          "border border-sky-600 bg-sky-600 text-white shadow-md shadow-sky-500/25 hover:bg-sky-500 hover:border-sky-500",
        /** Dialog footers — matches Header location / Notifications dialogs */
        dialogCancel:
          "w-full min-h-11 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 sm:w-auto sm:min-w-[7.5rem]",
        dialogPrimary:
          "w-full min-h-11 border-sky-600 bg-sky-600 text-white shadow-md shadow-sky-500/25 hover:bg-sky-500 hover:border-sky-500 sm:w-auto sm:min-w-[7.5rem]",
        /** Hero CTA — provider card Book now */
        cta:
          "border border-sky-600 bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 text-white font-semibold shadow-lg shadow-sky-500/30 hover:from-sky-400 hover:via-sky-500 hover:to-sky-700",
        /** Live support / success actions */
        success:
          "border border-emerald-600 bg-emerald-600 text-white font-semibold shadow-md hover:bg-emerald-500 hover:border-emerald-500",
        destructiveOutline:
          "border border-red-300 bg-white text-red-700 hover:bg-red-50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

function normalizeVariant(variant?: string | null): ButtonVariant | undefined {
  if (!variant) return undefined;
  if (variant === "outlined") return "outline";
  if (variant === "text") return "ghost";
  if (
    variant === "default" ||
    variant === "destructive" ||
    variant === "outline" ||
    variant === "secondary" ||
    variant === "ghost" ||
    variant === "link" ||
    variant === "contained" ||
    variant === "dialogCancel" ||
    variant === "dialogPrimary" ||
    variant === "cta" ||
    variant === "success" ||
    variant === "destructiveOutline"
  ) {
    return variant;
  }
  return "default";
}

function resolveVariant(
  variant?: string | null,
  color?: string | null
): ButtonVariant | undefined {
  const v = normalizeVariant(variant);
  if (color === "error") {
    if (variant === "outlined" || v === "outline") return "destructiveOutline";
    return "destructive";
  }
  if (color === "success" || color === "primary") {
    if (variant === "outlined" || v === "outline") return v === "outline" ? "outline" : "default";
    return color === "success" ? "success" : "contained";
  }
  return v;
}

function normalizeSize(size?: string | null): ButtonSize | undefined {
  if (!size) return undefined;
  if (size === "small") return "sm";
  if (size === "medium") return "default";
  if (size === "large") return "lg";
  if (size === "default" || size === "sm" || size === "lg" || size === "icon") {
    return size;
  }
  return "default";
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  variant?: string;
  size?: string;
  /** MUI compat — applies `w-full`, not passed to DOM */
  fullWidth?: boolean;
  /** MUI compat — stripped */
  sx?: unknown;
  component?: string;
  color?: string;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      startIcon,
      endIcon,
      fullWidth,
      sx: _sx,
      component: _component,
      color: _color,
      type = "button",
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const v = resolveVariant(variant, _color);
    const s = normalizeSize(size);
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(buttonVariants({ variant: v, size: s, className }), fullWidth && "w-full")}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
        ) : (
          startIcon && <span className="shrink-0">{startIcon}</span>
        )}
        {children}
        {endIcon && !loading && <span className="shrink-0">{endIcon}</span>}
      </Comp>
    );
  }
);
Button.displayName = "Button";

/** MUI `DialogActions` footer — shared across app dialogs */
export const dialogActionsClassName =
  "!m-0 !flex !flex-col-reverse !gap-2 !border-t !border-slate-200 !bg-slate-50/60 !p-3 sm:!flex-row sm:!justify-end sm:!gap-3 sm:!p-4";

export { Button, buttonVariants };

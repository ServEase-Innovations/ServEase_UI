import * as React from "react";
import { Button, type ButtonProps } from "./button";
import { cn } from "../utils";

export type IconButtonProps = Omit<ButtonProps, "size" | "variant"> & {
  variant?: ButtonProps["variant"];
  /** MUI compat — stripped */
  edge?: string;
  /** MUI compat — stripped, always icon size */
  size?: string;
};

/** Lucide-friendly icon-only control (replaces MUI `IconButton`). */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = "ghost",
      asChild,
      sx: _sx,
      edge: _edge,
      size: _size,
      component: _component,
      ...props
    },
    ref
  ) => (
  <Button
    ref={ref}
    type={asChild ? undefined : "button"}
    asChild={asChild}
    variant={variant}
    size="icon"
    className={cn("rounded-lg", className)}
    {...props}
  />
));
IconButton.displayName = "IconButton";

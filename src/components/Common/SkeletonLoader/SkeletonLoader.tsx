/* eslint-disable */
import { CSSProperties } from "react";

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: CSSProperties;
  variant?: "rectangular" | "circular" | "text";
}

export function SkeletonLoader({
  width = "100%",
  height = "1rem",
  className = "",
  style = {},
  variant = "rectangular"
}: SkeletonLoaderProps) {
  const baseStyle: CSSProperties = {
    width,
    height,
    backgroundColor: "#e5e7eb",
    borderRadius: variant === "circular" ? "50%" : "4px",
    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    display: "inline-block",
    ...style
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
      <div 
        className={`skeleton-loader ${className}`} 
        style={baseStyle}
      />
    </>
  );
}
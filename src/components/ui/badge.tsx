import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-neutral-background dark:bg-slate-800 text-neutral-text dark:text-slate-200",
  primary: "bg-primary-light dark:bg-emerald-950/40 text-primary-dark dark:text-emerald-400",
  secondary: "bg-secondary-light dark:bg-amber-950/40 text-secondary-dark dark:text-amber-400",
  verified: "bg-primary text-primary-foreground",
  premium: "bg-secondary text-secondary-foreground",
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

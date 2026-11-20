import Link from "next/link";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-dark",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-dark",
  outline: "border-2 border-primary text-primary dark:text-emerald-400 hover:bg-primary-light dark:hover:bg-emerald-950/30",
  ghost: "text-primary dark:text-emerald-400 hover:bg-primary-light dark:hover:bg-emerald-950/20",
} as const;

export const buttonSizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-body",
  lg: "h-12 px-6 text-base",
} as const;

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    buttonVariants[variant],
    buttonSizes[size],
    className
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={buttonClassName({ variant, size, className })}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export interface ButtonLinkProps {
  href: string;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  className?: string;
  children: React.ReactNode;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClassName({ variant, size, className })}>
      {children}
    </Link>
  );
}

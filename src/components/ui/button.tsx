import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/25 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-app-primary text-white hover:brightness-95",
        secondary: "bg-app-primary-muted text-app-primary hover:bg-app-primary-soft",
        ghost: "text-app-text-secondary hover:bg-app-surface-soft hover:text-app-text",
        outline: "border border-app-border-strong bg-app-surface text-app-text hover:bg-app-surface-soft",
        danger: "bg-app-danger text-white hover:brightness-95",
      },
      size: {
        sm: "h-8 px-2.5 text-xs",
        default: "h-10 px-4",
        lg: "h-10 px-4",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

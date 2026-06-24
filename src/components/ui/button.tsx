import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium leading-tight shadow-sm transition-[background-color,border-color,color,box-shadow,filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
  {
    variants: {
      variant: {
        default:
          "border-app-primary bg-app-primary text-white shadow-app-primary/10 hover:brightness-95 hover:shadow-md active:brightness-90",
        secondary:
          "border-app-primary-soft bg-app-primary-muted text-app-primary shadow-app-primary/5 hover:border-app-primary/30 hover:bg-app-primary-soft",
        outline:
          "border-app-border-strong bg-app-surface text-app-text hover:border-app-primary/40 hover:bg-app-primary-muted/60 hover:text-app-primary",
        ghost:
          "border-transparent bg-transparent text-app-text-secondary shadow-none hover:bg-app-surface-soft hover:text-app-text",
        danger:
          "border-app-danger bg-app-danger text-white shadow-app-danger/10 hover:brightness-95 hover:shadow-md active:brightness-90",
        "danger-outline":
          "border-app-danger/35 bg-app-surface text-app-danger hover:bg-app-danger/10 hover:text-app-danger",
        "danger-ghost":
          "border-transparent bg-transparent text-app-danger shadow-none hover:bg-app-danger/10 hover:text-app-danger",
        success:
          "border-app-success bg-app-success text-white shadow-app-success/10 hover:brightness-95 hover:shadow-md",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4",
        lg: "h-11 px-5 text-sm",
        icon: "h-9 w-9 px-0",
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

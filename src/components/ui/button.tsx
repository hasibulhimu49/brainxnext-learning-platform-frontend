import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * shadcn/ui Button, themed with the BrainXNext `.btn*` component classes (src/index.css).
 * Use `asChild` to render a router <Link> with button styling.
 */
const buttonVariants = cva("btn disabled:pointer-events-none aria-disabled:opacity-55 aria-disabled:hover:translate-y-0", {
  variants: {
    variant: {
      primary: "btn-primary",
      gold: "btn-gold",
      outline: "btn-outline",
      danger: "btn-danger",
      success: "bg-success text-white hover:-translate-y-0.5 hover:text-white",
      ghost: "bg-transparent text-muted hover:text-brand",
      link: "rounded-none bg-transparent p-0 text-brand hover:text-teal",
    },
    size: {
      sm: "px-4 py-2 text-xs",
      md: "px-5 py-2.75 text-[13px]",
      lg: "px-6 py-3 text-sm",
      xl: "px-5 py-3.75 text-[15px]",
      none: "",
    },
    shape: {
      pill: "",
      rounded: "rounded-[13px]",
    },
  },
  defaultVariants: { variant: "primary", size: "lg", shape: "pill" },
});

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ className, variant, size, shape, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, shape }), className)}
      {...(asChild ? {} : { type: type ?? "button" })}
      {...props}
    />
  );
}

export { Button, buttonVariants };

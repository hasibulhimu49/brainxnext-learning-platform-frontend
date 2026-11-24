import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** shadcn/ui Input themed with the design's field styles. `aria-invalid` turns the border red. */
const inputVariants = cva(
  "w-full rounded-[13px] border border-line bg-surface2 font-semibold text-ink transition-[border-color,box-shadow] outline-none placeholder:font-medium placeholder:text-soft focus:border-brand disabled:opacity-60 aria-invalid:border-danger",
  {
    variants: {
      size: {
        md: "px-3.75 py-3.25 text-sm focus:shadow-[0_0_0_3px_rgba(27,111,208,.15)]",
        lg: "px-4 py-3.5 text-[14.5px]",
      },
    },
    defaultVariants: { size: "md" },
  }
);

type InputProps = Omit<ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>;

function Input({ className, size, type = "text", ...props }: InputProps) {
  return <input type={type} data-slot="input" className={cn(inputVariants({ size }), className)} {...props} />;
}

export { Input, inputVariants };

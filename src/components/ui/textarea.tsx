import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { inputVariants } from "./input";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(inputVariants({ size: "md" }), "resize-y", className)} {...props} />;
}

export { Textarea };

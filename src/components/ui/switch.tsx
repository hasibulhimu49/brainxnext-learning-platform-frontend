import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** shadcn/ui Switch drawn like the design's 46×26 pill toggle. */
function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "relative inline-flex h-6.5 w-11.5 flex-none cursor-pointer items-center rounded-full border-0 bg-line transition-[background] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand/40 data-[state=checked]:bg-brand",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="block h-5 w-5 translate-x-0.75 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.25)] transition-transform duration-200 data-[state=checked]:translate-x-5.75"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

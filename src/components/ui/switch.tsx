import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-transparent bg-input transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-foreground shadow-sm transition-transform duration-150 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5 data-[state=checked]:bg-primary-foreground",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

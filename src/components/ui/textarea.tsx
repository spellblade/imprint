import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

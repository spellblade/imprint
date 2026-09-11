import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-none transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <rect
        x="5.5"
        y="5.5"
        width="21"
        height="21"
        rx="10.5"
        fill="none"
        stroke="var(--color-background)"
        strokeWidth="1.4"
      />
      <path
        d="M11 13.2h10M11 16.6h10M11 20h6.5"
        fill="none"
        stroke="var(--color-background)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Logo />
      <span className="font-display text-lg font-medium tracking-tight">
        Imprint
      </span>
    </span>
  );
}

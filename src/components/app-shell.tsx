import { Link, useRouterState } from "@tanstack/react-router";
import { Bookmark, FolderOpen, Stamp } from "lucide-react";
import { Wordmark } from "@/components/logo";
import { cn } from "@/lib/utils";
import { activeProfile, useVaultStore } from "@/lib/store";

const PLAYGROUND_NAV = [
  { to: "/playground", label: "Playground", icon: Stamp },
  { to: "/vault", label: "Vault", icon: FolderOpen },
  { to: "/library", label: "Library", icon: Bookmark },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const profile = useVaultStore(activeProfile);
  const fullName =
    profile?.fields.find((f) => f.key === "fullName")?.value ?? profile?.name;

  const isHome = pathname === "/";
  const isExtension = pathname.startsWith("/extension");
  const isPlayground =
    pathname.startsWith("/playground") ||
    pathname.startsWith("/vault") ||
    pathname.startsWith("/library");

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <Link to="/" className="shrink-0 text-foreground">
            <Wordmark />
          </Link>

          {isPlayground && (
            <nav className="hidden items-center gap-1 md:flex">
              {PLAYGROUND_NAV.map((item) => {
                const active = pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-sm transition-colors duration-150",
                      active
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {isExtension && (
            <p className="text-sm text-muted-foreground">Extension</p>
          )}

          {isPlayground ? (
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="truncate text-sm font-medium">{fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.name} vault
                </p>
              </div>
              <div className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-semibold tracking-wide">
                {(fullName ?? "I")
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </div>
            </div>
          ) : isHome ? (
            <span className="size-9" aria-hidden />
          ) : null}
        </div>
      </header>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          isPlayground && "pb-16 md:pb-0",
        )}
      >
        {children}
      </div>

      {isPlayground && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
          <div className="grid grid-cols-3">
            {PLAYGROUND_NAV.map((item) => {
              const active = pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 text-xs",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

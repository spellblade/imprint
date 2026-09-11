import { Link } from "@tanstack/react-router";
import { ArrowRight, Puzzle, Stamp } from "lucide-react";
import { Logo } from "@/components/logo";

const PATHS = [
  {
    to: "/playground" as const,
    kicker: "On this site",
    title: "Playground",
    body: "Try Imprint on sample job, checkout, clinic, and signup forms. Maya Ellison is already in the vault so you can fill in one pass.",
    action: "Open playground",
    icon: Stamp,
  },
  {
    to: "/extension" as const,
    kicker: "On your browser",
    title: "Extension",
    body: "Install the Chrome or Edge add-on. It scans real pages, asks once for unknown fields, and keeps the vault on your machine.",
    action: "Get the extension",
    icon: Puzzle,
  },
];

export function LandingView() {
  return (
    <main className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgb(244_241_234/0.06),transparent_70%)]"
      />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Logo className="size-8" />
          <p className="text-xs font-medium tracking-[0.16em] uppercase">
            Form stamp
          </p>
        </div>
        <h1 className="font-display mt-6 max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl">
          Fill a form once. Keep the imprint.
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Imprint maps any field to a local identity vault, asks only for what
          it has never seen, and remembers the page for next time. Cards,
          passwords, and legal boxes stay empty.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {PATHS.map((path) => {
            const Icon = path.icon;
            return (
              <Link
                key={path.to}
                to={path.to}
                className="group flex min-h-56 flex-col rounded-2xl bg-card p-6 shadow-[var(--shadow-border)] transition-shadow duration-150 hover:shadow-[var(--shadow-border-hover)] sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                    {path.kicker}
                  </p>
                  <span className="grid size-10 place-items-center rounded-full bg-secondary text-foreground">
                    <Icon className="size-4" />
                  </span>
                </div>
                <h2 className="font-display mt-6 text-3xl font-medium">
                  {path.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {path.body}
                </p>
                <span className="imprint-ink mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md px-6 text-sm font-medium">
                  {path.action}
                  <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        <ul className="mt-12 grid gap-6 text-sm text-muted-foreground sm:grid-cols-3">
          <li>
            <p className="font-medium text-foreground">Two separate vaults</p>
            <p className="mt-1">
              This site stores Maya in the browser. The extension stores yours
              on your computer. They never mix.
            </p>
          </li>
          <li>
            <p className="font-medium text-foreground">Ask once</p>
            <p className="mt-1">
              Unknown custom fields prompt in the panel. Save the answer and
              the next site reuses it.
            </p>
          </li>
          <li>
            <p className="font-medium text-foreground">Nothing sensitive</p>
            <p className="mt-1">
              Card numbers, CVC, passwords, and legal checkboxes are never
              filled.
            </p>
          </li>
        </ul>
      </div>
    </main>
  );
}

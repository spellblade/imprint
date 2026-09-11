import { Check, Chrome, Download, FileArchive, Puzzle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    title: "Download a package",
    body: "ZIP is for Load unpacked. CRX is the signed packed build of the same files.",
  },
  {
    title: "Load it in the browser",
    body: "Chrome or Edge → Extensions → Developer mode. Load unpacked on the unzipped imprint folder, or drop the CRX if your browser allows it.",
  },
  {
    title: "Fill any page",
    body: "Pin Imprint, open a real form, and press Fill. Custom fields prompt once, then live in your vault.",
  },
];

export function ExtensionView() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        Browser extension
      </p>
      <h1 className="font-display mt-1 text-3xl font-medium sm:text-4xl">
        Take Imprint to any site
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        The playground on this page is the full product. Download the packed
        add-on and run the same engine in Chrome or Edge.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild size="lg">
          <a href="/imprint-extension.zip" download="imprint-extension.zip">
            <FileArchive className="size-4" />
            Download ZIP
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href="/imprint-extension.crx" download="imprint-extension.crx">
            <Download className="size-4" />
            Download packed CRX
          </a>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link to="/playground">
            <Puzzle className="size-4" />
            Stay in the playground
          </Link>
        </Button>
      </div>

      <p className="mt-3 max-w-xl text-xs text-muted-foreground">
        Chrome blocks most sideloaded CRX files. Use the ZIP → Load unpacked
        path unless you are installing through an enterprise store.
      </p>

      <ol className="mt-10 grid gap-3 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]"
          >
            <p className="font-mono text-xs text-muted-foreground">
              0{i + 1}
            </p>
            <h2 className="font-display mt-3 text-xl leading-snug">
              {step.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl bg-card p-6 shadow-[var(--shadow-border)]">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Chrome className="size-4" />
          Chrome and Edge
        </div>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {[
            "Manifest V3 — works in current Chrome and Edge.",
            "ZIP for Load unpacked. CRX3 packed file signed for archive / store upload.",
            "Reads every input, select, and textarea, including unlabeled custom fields.",
            "Asks once for unknown values and stores them in the local vault.",
            "Saves the form schema so repeat visits fill without scanning again.",
            "Never fills passwords, card numbers, or legal checkboxes.",
          ].map((line) => (
            <li key={line} className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-success" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

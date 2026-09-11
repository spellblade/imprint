import { Link } from "@tanstack/react-router";
import { Bookmark, Clock, Stamp, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useVaultStore } from "@/lib/store";

export function LibraryView() {
  const forms = useVaultStore((s) => s.savedForms);
  const remove = useVaultStore((s) => s.deleteForm);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        Form library
      </p>
      <h1 className="font-display mt-1 text-3xl font-medium sm:text-4xl">
        Forms Imprint remembers
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        After a scan, save the page. Field names, labels, and mappings stay
        here so the next visit fills in one pass.
      </p>

      {forms.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-card px-6 py-12 text-center shadow-[var(--shadow-border)]">
          <Bookmark className="mx-auto size-6 text-muted-foreground" />
          <h2 className="font-display mt-4 text-xl">No saved forms yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Open the playground, scan a page, then press Save in the Imprint
            panel.
          </p>
          <Button asChild className="mt-6">
            <Link to="/playground">
              <Stamp className="size-4" />
              Open playground
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 grid gap-3">
          {forms.map((form) => (
            <li
              key={form.id}
              className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{form.siteName}</p>
                <h2 className="font-display text-xl leading-snug">{form.name}</h2>
                <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                  {form.url}
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="tabular-nums">
                    {form.fields.length} fields
                  </span>
                  <span className="tabular-nums">
                    filled {form.fillCount} time{form.fillCount === 1 ? "" : "s"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDistanceToNow(form.lastFilledAt ?? form.savedAt, {
                      addSuffix: true,
                    })}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild>
                  <Link to="/playground" search={{ site: form.siteId }}>
                    Fill again
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete saved form"
                  onClick={() => {
                    remove(form.id);
                    toast.message("Removed from library");
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

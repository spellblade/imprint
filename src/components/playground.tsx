import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ExtensionPanel } from "@/components/extension-panel";
import { SITE_VIEWS } from "@/components/sample-sites";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { mapFieldsWithAi } from "@/lib/ai";
import { SAMPLE_SITES } from "@/lib/defaults";
import { heuristicMap, mergeMappings } from "@/lib/heuristic";
import { fillElement, scanForm } from "@/lib/scan";
import { activeProfile, useVaultStore } from "@/lib/store";
import type { DetectedField, FieldMapping } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Puzzle } from "lucide-react";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Playground({ initialSiteId }: { initialSiteId?: string }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [siteId, setSiteId] = useState(initialSiteId ?? "careers");
  const [fields, setFields] = useState<DetectedField[]>([]);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [filledIds, setFilledIds] = useState<string[]>([]);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [mapping, setMapping] = useState(false);
  const [filling, setFilling] = useState(false);
  const [askQueue, setAskQueue] = useState<FieldMapping[]>([]);
  const [askValue, setAskValue] = useState("");
  const [saveToVault, setSaveToVault] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const site = SAMPLE_SITES.find((s) => s.id === siteId) ?? SAMPLE_SITES[0];
  const SiteView = SITE_VIEWS[site.theme];
  const profile = useVaultStore(activeProfile);
  const saved = useVaultStore((s) => s.formForSite(siteId));
  const saveForm = useVaultStore((s) => s.saveForm);
  const recordFill = useVaultStore((s) => s.recordFill);
  const upsertFromAsk = useVaultStore((s) => s.upsertFromAsk);
  const welcomeSeen = useVaultStore((s) => s.welcomeSeen);
  const hydrated = useVaultStore((s) => s.hydrated);
  const setWelcomeSeen = useVaultStore((s) => s.setWelcomeSeen);

  useEffect(() => {
    if (initialSiteId) setSiteId(initialSiteId);
  }, [initialSiteId]);

  useEffect(() => {
    setFields([]);
    setMappings([]);
    setFilledIds([]);
    setActiveFieldId(null);
    setAskQueue([]);
    setAskValue("");
    const id = window.setTimeout(() => {
      const root = pageRef.current;
      if (!root) return;
      const current = useVaultStore.getState();
      const vault = activeProfile(current).fields;
      const detected = scanForm(root);
      const next = heuristicMap(detected, vault);
      setFields(detected);
      setMappings(next);
    }, 60);
    return () => window.clearTimeout(id);
  }, [siteId]);

  const pendingAsk = askQueue[0] ?? null;

  const runScan = () => {
    const root = pageRef.current;
    if (!root) return [];
    setScanning(true);
    const detected = scanForm(root);
    const next = heuristicMap(detected, profile.fields);
    setFields(detected);
    setMappings(next);
    setScanning(false);
    return { detected, mapped: next };
  };

  const applyFill = async (list: FieldMapping[], detected: DetectedField[]) => {
    const root = pageRef.current;
    if (!root) return;
    setFilling(true);
    const ready = list.filter((m) => {
      const field = detected.find((f) => f.id === m.fieldId);
      return m.value && field && !field.skipReason;
    });
    for (const m of ready) {
      const field = detected.find((f) => f.id === m.fieldId);
      if (!field) continue;
      setActiveFieldId(field.id);
      fillElement(root, field, m.value);
      setFilledIds((ids) => (ids.includes(field.id) ? ids : [...ids, field.id]));
      await sleep(90);
    }
    setActiveFieldId(null);
    setFilling(false);
  };

  const queueAsks = (list: FieldMapping[], detected: DetectedField[]) => {
    const asks = list.filter((m) => {
      const field = detected.find((f) => f.id === m.fieldId);
      return field && !field.skipReason && m.needsInput && !m.value;
    });
    setAskQueue(asks);
    if (
      asks.length &&
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches
    ) {
      setMobileOpen(true);
    }
  };

  const onScan = () => {
    const result = runScan();
    if (Array.isArray(result)) return;
    toast.success(`Read ${result.detected.length} fields`);
  };

  const onFill = async () => {
    const root = pageRef.current;
    if (!root) return;
    const detected = fields.length ? fields : scanForm(root);
    let next = mappings.length
      ? mappings
      : heuristicMap(detected, profile.fields);
    if (!fields.length) setFields(detected);
    setMappings(next);
    await applyFill(next, detected);
    queueAsks(next, detected);

    const unknown = detected.filter((f) => {
      if (f.skipReason) return false;
      const m = next.find((x) => x.fieldId === f.id);
      return !m?.value;
    });

    if (unknown.length) {
      setMapping(true);
      try {
        const ai = await Promise.race([
          mapFieldsWithAi({
            data: {
              fields: unknown.map((f) => ({
                id: f.id,
                name: f.name,
                label: f.label,
                type: f.type,
                placeholder: f.placeholder,
                options: f.options,
                required: f.required,
              })),
              vault: profile.fields.map((v) => ({
                key: v.key,
                label: v.label,
                value: v.value,
                group: v.group,
              })),
            },
          }),
          new Promise<never>((_, reject) =>
            window.setTimeout(() => reject(new Error("timeout")), 9000),
          ),
        ]);
        if (ai.ok) {
          next = mergeMappings(next, ai.mappings);
          setMappings(next);
          await applyFill(next, detected);
        } else {
          toast.message(ai.error, {
            description: "Using on-device mapping instead.",
          });
        }
      } catch {
        toast.message("AI mapping skipped", {
          description: "Unknown fields will be asked one by one.",
        });
      } finally {
        setMapping(false);
      }
    }

    queueAsks(next, detected);
    const existing = useVaultStore.getState().formForSite(siteId);
    if (existing) recordFill(existing.id, next);
  };

  const onSave = () => {
    const detected = fields.length ? fields : runScan();
    const list = Array.isArray(detected) ? fields : detected.detected;
    const map = Array.isArray(detected) ? mappings : detected.mapped;
    saveForm({
      name: site.title,
      siteId: site.id,
      url: `https://${site.host}${site.path}`,
      siteName: site.name,
      fields: list,
      mappings: map,
    });
    toast.success("Form saved to your library");
  };

  const onAnswer = async () => {
    if (!pendingAsk || !askValue.trim()) return;
    const root = pageRef.current;
    const field = fields.find((f) => f.id === pendingAsk.fieldId);
    const nextMap: FieldMapping = {
      ...pendingAsk,
      value: askValue.trim(),
      needsInput: false,
      source: "user",
      confidence: 1,
    };
    setMappings((ms) =>
      ms.map((m) => (m.fieldId === nextMap.fieldId ? nextMap : m)),
    );
    if (saveToVault) {
      upsertFromAsk({
        key: pendingAsk.saveAsKey || field?.name || "custom",
        label: pendingAsk.saveAsLabel || field?.label || "Custom field",
        value: askValue.trim(),
      });
    }
    if (root && field) {
      setActiveFieldId(field.id);
      fillElement(root, field, askValue.trim());
      setFilledIds((ids) =>
        ids.includes(field.id) ? ids : [...ids, field.id],
      );
      await sleep(120);
      setActiveFieldId(null);
    }
    setAskQueue((q) => q.slice(1));
    setAskValue("");
  };

  const onSkipAsk = () => {
    setAskQueue((q) => q.slice(1));
    setAskValue("");
  };

  const panelProps = {
    siteName: site.name,
    fieldCount: fields.length,
    mappings,
    fields,
    filling,
    scanning,
    mapping,
    filledIds,
    pendingAsk,
    askValue,
    saveToVault,
    saved,
    onAskValue: setAskValue,
    onSaveToVault: setSaveToVault,
    onScan,
    onFill,
    onSave,
    onAnswer,
    onSkipAsk,
  };

  const highlights = useMemo(
    () => ({ activeFieldId, filledIds }),
    [activeFieldId, filledIds],
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-3 py-4 sm:px-6 sm:py-6">
      <div className="stagger-in flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Live playground
          </p>
          <h1 className="font-display mt-1 text-3xl leading-tight font-medium sm:text-4xl">
            Fill any form. Once.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Imprint reads the page, maps fields to your vault, and only asks
            when it meets something new. Save the form and the next visit is a
            single stamp.
          </p>
        </div>
        <Button
          className="max-lg:inline-flex lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Puzzle className="size-4" />
          Open Imprint
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {SAMPLE_SITES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSiteId(s.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-2 text-sm transition-colors duration-150",
              s.id === siteId
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-h-[640px] flex-col overflow-hidden rounded-2xl bg-[#1a1a1d] shadow-[var(--shadow-border),var(--shadow-lift)]">
          <div className="flex items-center gap-3 border-b border-white/5 px-3 py-2.5">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="size-2.5 rounded-full bg-white/15" />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 font-mono text-[11px] text-white/55">
              <span className="text-success">https</span>
              <span className="truncate">
                {site.host}
                {site.path}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="hidden size-8 place-items-center rounded-lg text-white/70 hover:bg-white/5 max-lg:grid"
              aria-label="Open Imprint"
            >
              <Puzzle className="size-4" />
            </button>
          </div>
          <div
            data-site={site.theme}
            className="relative min-h-0 flex-1 overflow-auto"
          >
            <div ref={pageRef} className="relative">
              <SiteView />
              <FieldMarks
                rootRef={pageRef}
                fields={fields}
                highlights={highlights}
              />
            </div>
          </div>
        </div>

        <aside className="hidden min-h-[640px] overflow-hidden rounded-2xl shadow-[var(--shadow-border)] lg:block">
          <ExtensionPanel {...panelProps} />
        </aside>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="bottom" className="h-[85dvh] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Imprint</SheetTitle>
          </SheetHeader>
          <ExtensionPanel {...panelProps} />
        </SheetContent>
      </Sheet>

      <Dialog open={hydrated && !welcomeSeen} onOpenChange={(o) => !o && setWelcomeSeen()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your identity, applied to any form</DialogTitle>
            <DialogDescription>
              Maya Ellison is loaded as a demo vault. Scan a page, press Fill,
              and Imprint will map every field — then pause only for what it
              does not know. Custom answers can be saved for the next form.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setWelcomeSeen()}>Try the playground</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FieldMarks({
  rootRef,
  fields,
  highlights,
}: {
  rootRef: React.RefObject<HTMLDivElement | null>;
  fields: DetectedField[];
  highlights: { activeFieldId: string | null; filledIds: string[] };
}) {
  const [rects, setRects] = useState<
    Array<{ id: string; top: number; left: number; width: number; height: number }>
  >([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const update = () => {
      const origin = root.getBoundingClientRect();
      const next = fields
        .map((f) => {
          const el = root.querySelector(`[data-imprint-id="${f.id}"]`);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            id: f.id,
            top: r.top - origin.top,
            left: r.left - origin.left,
            width: r.width,
            height: r.height,
          };
        })
        .filter((x): x is NonNullable<typeof x> => Boolean(x));
      setRects(next);
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(root);
    return () => obs.disconnect();
  }, [fields, rootRef, highlights.activeFieldId, highlights.filledIds]);

  if (!rects.length) return null;
  return (
    <div className="pointer-events-none absolute inset-0">
      {rects.map((r) => {
        const active = highlights.activeFieldId === r.id;
        const filled = highlights.filledIds.includes(r.id);
        return (
          <div
            key={r.id}
            className={cn(
              "absolute rounded-[10px] transition-[box-shadow,outline-color] duration-200",
              active && "field-glow outline outline-2 outline-[#243447]",
              filled && !active && "outline outline-1 outline-[#7d9b76]/70",
            )}
            style={{
              top: r.top - 3,
              left: r.left - 3,
              width: r.width + 6,
              height: r.height + 6,
            }}
          />
        );
      })}
    </div>
  );
}

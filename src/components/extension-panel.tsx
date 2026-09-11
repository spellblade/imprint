import { useState } from "react";
import {
  Check,
  CircleAlert,
  Loader2,
  Save,
  ScanLine,
  ShieldOff,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import type { DetectedField, FieldMapping, SavedForm } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  siteName: string;
  fieldCount: number;
  mappings: FieldMapping[];
  fields: DetectedField[];
  filling: boolean;
  scanning: boolean;
  mapping: boolean;
  filledIds: string[];
  pendingAsk: FieldMapping | null;
  askValue: string;
  saveToVault: boolean;
  saved: SavedForm | undefined;
  onAskValue: (v: string) => void;
  onSaveToVault: (v: boolean) => void;
  onScan: () => void;
  onFill: () => void;
  onSave: () => void;
  onAnswer: () => void;
  onSkipAsk: () => void;
};

export function ExtensionPanel(props: Props) {
  const matched = props.mappings.filter(
    (m) => m.value && !props.fields.find((f) => f.id === m.fieldId)?.skipReason,
  ).length;
  const skipped = props.fields.filter((f) => f.skipReason).length;
  const missing = props.mappings.filter((m) => m.needsInput && !m.value).length;
  const [tab, setTab] = useState<"fields" | "ask">("fields");

  const askOpen = Boolean(props.pendingAsk);
  const view = askOpen ? "ask" : tab;

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Imprint
            </p>
            <p className="font-display text-lg leading-tight">{props.siteName}</p>
          </div>
          {props.saved ? (
            <Badge variant="success">Saved</Badge>
          ) : (
            <Badge variant="outline">New page</Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {props.fieldCount
            ? `${props.fieldCount} fields · ${matched} mapped · ${missing} to ask`
            : "Scan to read every field on this page."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 border-b border-border p-3">
        <Button
          size="sm"
          variant="secondary"
          onClick={props.onScan}
          disabled={props.scanning}
        >
          {props.scanning ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <ScanLine className="size-3.5" />
          )}
          Scan
        </Button>
        <Button
          size="sm"
          onClick={props.onFill}
          disabled={props.filling}
        >
          {props.filling || props.mapping ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          Fill
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={props.onSave}
        >
          <Save className="size-3.5" />
          Save
        </Button>
      </div>

      {props.mapping ? (
        <p className="shimmer-text px-4 py-3 text-xs">
          Mapping custom fields with Grok…
        </p>
      ) : null}

      <div className="flex gap-1 px-3 pt-3">
        <button
          type="button"
          onClick={() => setTab("fields")}
          className={cn(
            "rounded-full px-3 py-1 text-xs transition-colors",
            view === "fields"
              ? "bg-secondary text-foreground"
              : "text-muted-foreground",
          )}
        >
          Fields
        </button>
        <button
          type="button"
          onClick={() => setTab("ask")}
          className={cn(
            "rounded-full px-3 py-1 text-xs transition-colors",
            view === "ask"
              ? "bg-secondary text-foreground"
              : "text-muted-foreground",
          )}
        >
          Asks {missing ? `(${missing})` : ""}
        </button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {view === "ask" && props.pendingAsk ? (
          <AskCard
            mapping={props.pendingAsk}
            field={props.fields.find((f) => f.id === props.pendingAsk?.fieldId)}
            value={props.askValue}
            saveToVault={props.saveToVault}
            onValue={props.onAskValue}
            onSaveToVault={props.onSaveToVault}
            onAnswer={props.onAnswer}
            onSkip={props.onSkipAsk}
          />
        ) : view === "ask" ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">
            Nothing to ask. Fill the form and Imprint will only stop for fields
            it does not know.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {props.fields.length === 0 ? (
              <li className="px-4 py-8 text-sm text-muted-foreground">
                Open a form, then scan. Imprint reads labels, names, and
                autocomplete hints — including fields it has never seen.
              </li>
            ) : (
              props.fields.map((field) => {
                const mapping = props.mappings.find((m) => m.fieldId === field.id);
                const filled = props.filledIds.includes(field.id);
                return (
                  <li key={field.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {field.label}
                        </p>
                        <p className="truncate font-mono text-[11px] text-muted-foreground">
                          {field.name}
                          {field.required ? " · required" : ""}
                        </p>
                      </div>
                      <StatusIcon
                        skipped={Boolean(field.skipReason)}
                        filled={filled}
                        mapped={Boolean(mapping?.value)}
                        needsInput={Boolean(mapping?.needsInput && !mapping.value)}
                      />
                    </div>
                    {field.skipReason ? (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <ShieldOff className="size-3" />
                        {field.skipReason}
                      </p>
                    ) : mapping?.value ? (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {mapping.value}
                      </p>
                    ) : mapping?.question ? (
                      <p className="mt-1 text-xs text-warning">{mapping.question}</p>
                    ) : null}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </ScrollArea>

      <div className="border-t border-border px-4 py-3 text-[11px] text-muted-foreground">
        {skipped
          ? `${skipped} field${skipped === 1 ? "" : "s"} left untouched on purpose.`
          : "Card numbers, passwords, and legal checkboxes are never filled."}
      </div>
    </div>
  );
}

function StatusIcon({
  skipped,
  filled,
  mapped,
  needsInput,
}: {
  skipped: boolean;
  filled: boolean;
  mapped: boolean;
  needsInput: boolean;
}) {
  if (skipped)
    return <ShieldOff className="size-3.5 text-muted-foreground" />;
  if (filled) return <Check className="size-3.5 text-success" />;
  if (needsInput) return <CircleAlert className="size-3.5 text-warning" />;
  if (mapped)
    return <span className="size-2 rounded-full bg-steel/80" />;
  return <span className="size-2 rounded-full bg-border" />;
}

function AskCard({
  mapping,
  field,
  value,
  saveToVault,
  onValue,
  onSaveToVault,
  onAnswer,
  onSkip,
}: {
  mapping: FieldMapping;
  field?: DetectedField;
  value: string;
  saveToVault: boolean;
  onValue: (v: string) => void;
  onSaveToVault: (v: boolean) => void;
  onAnswer: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-4 p-4">
      <div>
        <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Custom field
        </p>
        <h3 className="font-display mt-1 text-xl leading-snug">
          {mapping.question ?? field?.label}
        </h3>
      </div>
      {field?.options?.length ? (
        <div className="grid gap-2">
          {field.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onValue(opt)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                value === opt
                  ? "border-primary bg-secondary"
                  : "border-border hover:bg-secondary/60",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <Input
          value={value}
          onChange={(e) => onValue(e.target.value)}
          placeholder={field?.placeholder ?? "Type a value"}
          autoFocus
        />
      )}
      <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary/70 px-3 py-2.5">
        <Label htmlFor="save-vault" className="text-xs leading-snug">
          Save as “{mapping.saveAsLabel ?? field?.label}” in the vault
        </Label>
        <Switch
          id="save-vault"
          checked={saveToVault}
          onCheckedChange={onSaveToVault}
        />
      </div>
      <div className="flex gap-2">
        <Button className="flex-1" onClick={onAnswer} disabled={!value.trim()}>
          Fill field
        </Button>
        <Button variant="ghost" onClick={onSkip}>
          Skip
        </Button>
      </div>
    </div>
  );
}

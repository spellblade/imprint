import { useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GROUP_LABELS } from "@/lib/defaults";
import { activeProfile, useVaultStore } from "@/lib/store";
import type { VaultField, VaultGroup } from "@/lib/types";
import { cn } from "@/lib/utils";

const GROUPS: VaultGroup[] = [
  "identity",
  "contact",
  "address",
  "work",
  "custom",
];

export function VaultView() {
  const profiles = useVaultStore((s) => s.profiles);
  const activeId = useVaultStore((s) => s.activeProfileId);
  const profile = useVaultStore(activeProfile);
  const setActive = useVaultStore((s) => s.setActiveProfile);
  const updateField = useVaultStore((s) => s.updateField);
  const addField = useVaultStore((s) => s.addField);
  const removeField = useVaultStore((s) => s.removeField);
  const resetDemo = useVaultStore((s) => s.resetDemo);
  const [group, setGroup] = useState<VaultGroup>("identity");
  const [draftLabel, setDraftLabel] = useState("");
  const [draftValue, setDraftValue] = useState("");

  const grouped = GROUPS.map((g) => ({
    g,
    fields: profile.fields.filter((f) => f.group === g),
  }));

  const onAdd = () => {
    if (!draftLabel.trim()) return;
    const key = draftLabel
      .trim()
      .split(/\s+/)
      .map((p, i) =>
        i === 0
          ? p.toLowerCase()
          : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase(),
      )
      .join("");
    addField(profile.id, {
      key,
      label: draftLabel.trim(),
      value: draftValue,
      group: "custom",
    });
    setDraftLabel("");
    setDraftValue("");
    setGroup("custom");
    toast.success("Custom field saved");
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Identity vault
          </p>
          <h1 className="font-display mt-1 text-3xl font-medium sm:text-4xl">
            What Imprint knows
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Standard details fill themselves. Custom fields are learned the
            first time a form asks — then reused everywhere.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            resetDemo();
            toast.message("Demo identity restored");
          }}
        >
          <RotateCcw className="size-4" />
          Restore Maya
        </Button>
      </div>

      <div className="mt-6 flex gap-2">
        {profiles.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActive(p.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              p.id === activeId
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroup(g)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs transition-colors",
              group === g
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {GROUP_LABELS[g]}{" "}
            <span className="tabular-nums opacity-60">
              {profile.fields.filter((f) => f.group === g).length}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-3">
        {grouped
          .filter((x) => x.g === group)
          .map(({ fields }) =>
            fields.length === 0 ? (
              <p key="empty" className="text-sm text-muted-foreground">
                No fields in this group yet.
              </p>
            ) : (
              fields.map((field) => (
                <VaultRow
                  key={field.id}
                  field={field}
                  onChange={(value) =>
                    updateField(profile.id, field.id, value)
                  }
                  onRemove={
                    field.group === "custom"
                      ? () => removeField(profile.id, field.id)
                      : undefined
                  }
                />
              ))
            ),
          )}
      </div>

      {group === "custom" ? (
        <div className="mt-8 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-lg">Add a custom field</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use this for anything a form might ask that is not already in the
            vault — salary bands, passport numbers, team size.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="new-label">Label</Label>
              <Input
                id="new-label"
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                placeholder="Passport number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-value">Value</Label>
              <Input
                id="new-value"
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                placeholder="X1234567"
              />
            </div>
            <Button onClick={onAdd} className="sm:mb-px">
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function VaultRow({
  field,
  onChange,
  onRemove,
}: {
  field: VaultField;
  onChange: (value: string) => void;
  onRemove?: () => void;
}) {
  const long = field.value.length > 80;
  return (
    <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Label htmlFor={field.id}>{field.label}</Label>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            {field.key}
          </p>
        </div>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="grid size-10 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label={`Remove ${field.label}`}
          >
            <Trash2 className="size-4" />
          </button>
        ) : null}
      </div>
      {long ? (
        <Textarea
          id={field.id}
          className="mt-3"
          value={field.value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          id={field.id}
          className="mt-3"
          value={field.value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

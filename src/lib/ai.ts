import { createServerFn } from "@tanstack/react-start";
import type { DetectedField, FieldMapping, VaultField } from "@/lib/types";

export type MapRequest = {
  fields: Array<
    Pick<
      DetectedField,
      "id" | "name" | "label" | "type" | "placeholder" | "options" | "required"
    >
  >;
  vault: Array<Pick<VaultField, "key" | "label" | "value" | "group">>;
};

type AiMapping = {
  fieldId: string;
  vaultKey: string | null;
  value: string;
  confidence: number;
  needsInput?: boolean;
  question?: string;
  saveAsKey?: string;
  saveAsLabel?: string;
};

export const mapFieldsWithAi = createServerFn({ method: "POST" })
  .validator((input: MapRequest) => input)
  .handler(async ({ data }): Promise<{ ok: true; mappings: FieldMapping[] } | { ok: false; error: string }> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "AI is not available in this environment" };
    }

    const payload = {
      fields: data.fields,
      vault: data.vault.map((v) => ({
        key: v.key,
        label: v.label,
        value: v.value,
        group: v.group,
      })),
    };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.2,
        max_tokens: 1200,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You map webpage form fields to a user's identity vault. Return JSON only: {\"mappings\":[{\"fieldId\",\"vaultKey\",\"value\",\"confidence\",\"needsInput\",\"question\",\"saveAsKey\",\"saveAsLabel\"}]}. Rules: use vault values when they clearly match; for selects, value must be one of the field options; if a cover letter, statement of purpose, or similar long text is needed, draft 70-90 words in first person from the vault; never invent SSNs, card numbers, passwords, or medical diagnoses; if unknown, needsInput=true with a short question and a camelCase saveAsKey. confidence is 0-1.",
          },
          {
            role: "user",
            content: JSON.stringify(payload),
          },
        ],
      }),
    });

    if (!res.ok) {
      return { ok: false, error: `xAI API error ${res.status}` };
    }

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content ?? "";
    try {
      const parsed = JSON.parse(text) as { mappings?: AiMapping[] };
      const mappings: FieldMapping[] = (parsed.mappings ?? []).map((m) => ({
        fieldId: String(m.fieldId),
        vaultKey: m.vaultKey ?? null,
        value: String(m.value ?? ""),
        confidence: Number(m.confidence ?? 0),
        source: "ai" as const,
        needsInput: Boolean(m.needsInput) && !m.value,
        question: m.question,
        saveAsKey: m.saveAsKey,
        saveAsLabel: m.saveAsLabel,
      }));
      return { ok: true, mappings };
    } catch {
      return { ok: false, error: "Could not parse AI mapping" };
    }
  });

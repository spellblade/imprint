import type { DetectedField, FieldMapping, VaultField } from "@/lib/types";

const AUTOCOMPLETE: Record<string, string> = {
  "given-name": "firstName",
  "family-name": "lastName",
  "additional-name": "firstName",
  name: "fullName",
  "honorific-prefix": "fullName",
  email: "email",
  "email-address": "email",
  username: "email",
  tel: "phone",
  "tel-national": "phone",
  "street-address": "address1",
  "address-line1": "address1",
  "address-line2": "address2",
  "address-level2": "city",
  "address-level1": "state",
  "postal-code": "zip",
  country: "country",
  "country-name": "country",
  bday: "dob",
  "bday-year": "dob",
  organization: "company",
  "organization-title": "jobTitle",
  url: "website",
};

const ALIASES: Record<string, string[]> = {
  firstName: ["first name", "firstname", "given name", "fname", "legal first"],
  lastName: ["last name", "lastname", "surname", "lname", "family name"],
  fullName: ["full name", "your name", "applicant name", "legal name", "name"],
  dob: ["date of birth", "birthdate", "birthday", "dob", "born"],
  nationality: ["nationality", "citizenship", "citizen of"],
  email: ["email", "e-mail", "email address", "work email"],
  phone: ["phone", "mobile", "telephone", "cell", "phone number"],
  address1: ["street", "address line 1", "address1", "street address", "mailing address"],
  address2: ["address line 2", "apartment", "suite", "unit", "apt"],
  city: ["city", "town", "locality"],
  state: ["state", "province", "region", "county"],
  zip: ["zip", "postal", "postcode", "zip code"],
  country: ["country", "nation"],
  company: ["company", "employer", "organization", "org"],
  jobTitle: ["job title", "title", "role", "position", "occupation"],
  linkedin: ["linkedin", "linkedin url", "linkedin profile"],
  website: ["website", "portfolio", "personal site", "homepage"],
  github: ["github", "github username"],
  yearsExperience: ["years of experience", "years experience", "experience years", "yoe"],
  workAuth: ["work authorization", "work authorised", "eligible to work", "visa status", "citizenship status"],
  emergencyName: ["emergency contact name", "emergency name", "next of kin"],
  emergencyPhone: ["emergency contact phone", "emergency phone", "emergency tel"],
};

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function vaultByKey(fields: VaultField[]) {
  return new Map(fields.map((f) => [f.key, f]));
}

function haystack(field: DetectedField) {
  return norm([field.label, field.name].filter(Boolean).join(" "));
}

function wordMatch(hay: string, alias: string) {
  if (!alias) return false;
  if (hay === alias) return true;
  return hay.startsWith(`${alias} `) || hay.endsWith(` ${alias}`) || hay.includes(` ${alias} `);
}

export function heuristicMap(
  detected: DetectedField[],
  vault: VaultField[],
): FieldMapping[] {
  const byKey = vaultByKey(vault);
  const used = new Set<string>();
  const mappings: FieldMapping[] = [];

  for (const field of detected) {
    if (field.skipReason) {
      mappings.push({
        fieldId: field.id,
        vaultKey: null,
        value: "",
        confidence: 1,
        source: "heuristic",
      });
      continue;
    }

    const hay = haystack(field);
    let best: { key: string; score: number } | null = null;

    for (const [key, aliases] of Object.entries(ALIASES)) {
      if (!byKey.has(key) || used.has(key)) continue;
      for (const alias of aliases) {
        if (hay === alias) {
          best = { key, score: 0.96 };
          break;
        }
        if (wordMatch(hay, alias) && (!best || best.score < 0.88)) {
          best = { key, score: 0.88 };
        }
      }
      if (best?.score === 0.96) break;
    }

    if (!best) {
      const ac = field.autocomplete?.split(" ").pop()?.toLowerCase();
      const acKey = ac ? AUTOCOMPLETE[ac] : undefined;
      if (acKey && byKey.has(acKey) && !used.has(acKey) && byKey.get(acKey)?.value) {
        best = { key: acKey, score: 0.9 };
      }
    }

    if (!best) {
      for (const vf of vault) {
        if (used.has(vf.key) || !vf.value) continue;
        const label = norm(vf.label);
        const key = norm(vf.key);
        if (hay === label || hay === key) {
          best = { key: vf.key, score: 0.86 };
          break;
        }
        if (wordMatch(hay, label) || wordMatch(hay, key)) {
          best = { key: vf.key, score: 0.8 };
          break;
        }
      }
    }

    if (best) {
      used.add(best.key);
      const v = byKey.get(best.key)!;
      mappings.push({
        fieldId: field.id,
        vaultKey: best.key,
        value: adaptValue(field, v.value),
        confidence: best.score,
        source: "heuristic",
      });
    } else {
      mappings.push({
        fieldId: field.id,
        vaultKey: null,
        value: "",
        confidence: 0,
        source: "heuristic",
        needsInput: true,
        question: questionFor(field),
        saveAsKey: suggestKey(field),
        saveAsLabel: field.label,
      });
    }
  }

  return mappings;
}

function adaptValue(field: DetectedField, value: string) {
  if (field.options?.length) {
    const v = value.toLowerCase();
    const hit =
      field.options.find((o) => o.toLowerCase() === v) ??
      field.options.find(
        (o) => o.toLowerCase().includes(v) || v.includes(o.toLowerCase()),
      );
    return hit ?? value;
  }
  if (field.type === "date") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const t = Date.parse(value);
    if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0, 10);
  }
  return value;
}

function questionFor(field: DetectedField) {
  const label = field.label.replace(/\?$/, "");
  if (field.options?.length) {
    return `Which ${label.toLowerCase()} should Imprint use?`;
  }
  if (field.tag === "textarea") {
    return `What should go in “${label}”?`;
  }
  return `This form asks for “${label}”. Add it to your vault?`;
}

function suggestKey(field: DetectedField) {
  const base = field.name.replace(/[^a-zA-Z0-9]+/g, " ").trim();
  const parts = (base || field.label)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);
  if (!parts.length) return "customField";
  return (
    parts[0].toLowerCase() +
    parts
      .slice(1)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join("")
  );
}

export function mergeMappings(
  heuristic: FieldMapping[],
  ai: FieldMapping[],
): FieldMapping[] {
  const byId = new Map(ai.map((m) => [m.fieldId, m]));
  return heuristic.map((h) => {
    if (h.vaultKey && h.confidence >= 0.8) return h;
    const extra = byId.get(h.fieldId);
    if (!extra) return h;
    return { ...h, ...extra, source: extra.source ?? "ai" };
  });
}

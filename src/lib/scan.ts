import type { DetectedField } from "@/lib/types";

const SKIP_TYPES = new Set(["hidden", "submit", "button", "reset", "file", "image"]);

const NEVER_FILL = [
  /password/i,
  /passcode/i,
  /current.?password/i,
  /cc-number|card.?number|credit.?card|pan\b/i,
  /cvc|cvv|security.?code/i,
  /ssn|social.?security/i,
];

const LEGAL_CHECK = /terms|privacy|agree|consent|opt.?in/i;

function labelFor(el: HTMLElement, root: HTMLElement): string {
  const id = el.getAttribute("id");
  if (id) {
    const byFor = root.querySelector(`label[for="${cssEscape(id)}"]`);
    if (byFor?.textContent) return clean(byFor.textContent);
  }
  const wrapping = el.closest("label");
  if (wrapping) {
    const clone = wrapping.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("input,select,textarea").forEach((n) => n.remove());
    if (clone.textContent) return clean(clone.textContent);
  }
  const aria = el.getAttribute("aria-label");
  if (aria) return clean(aria);
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const node = root.querySelector(`#${cssEscape(labelledBy)}`);
    if (node?.textContent) return clean(node.textContent);
  }
  const prev = el.previousElementSibling;
  if (prev && prev.tagName === "LABEL") return clean(prev.textContent ?? "");
  return "";
}

function cssEscape(value: string) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function clean(text: string) {
  return text.replace(/\s+/g, " ").replace(/\*$/, "").trim();
}

function skipReason(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, label: string, name: string) {
  const hay = `${label} ${name} ${el.getAttribute("autocomplete") ?? ""} ${el.id}`;
  if (el instanceof HTMLInputElement && el.type === "password") return "Passwords are never filled";
  if (NEVER_FILL.some((re) => re.test(hay))) {
    if (/cc-number|card.?number|credit.?card|cvc|cvv/i.test(hay))
      return "Card numbers stay in your hands";
    if (/ssn|social.?security/i.test(hay)) return "Sensitive IDs are skipped";
    if (/password/i.test(hay)) return "Passwords are never filled";
  }
  if (el instanceof HTMLInputElement && el.type === "checkbox" && LEGAL_CHECK.test(hay)) {
    return "Review agreements yourself";
  }
  return undefined;
}

export function scanForm(root: HTMLElement): DetectedField[] {
  const nodes = Array.from(
    root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea",
    ),
  );

  const radioSeen = new Set<string>();
  const fields: DetectedField[] = [];

  nodes.forEach((el, index) => {
    if (el instanceof HTMLInputElement && SKIP_TYPES.has(el.type)) return;
    if (el.disabled) return;

    const name = el.getAttribute("name") || el.id || `field-${index}`;
    if (el instanceof HTMLInputElement && el.type === "radio") {
      if (radioSeen.has(name)) return;
      radioSeen.add(name);
    }

    const label = labelFor(el, root) || el.getAttribute("placeholder") || name;
    const tag =
      el.tagName === "SELECT"
        ? "select"
        : el.tagName === "TEXTAREA"
          ? "textarea"
          : "input";
    const type =
      el instanceof HTMLInputElement
        ? el.type || "text"
        : tag === "select"
          ? "select"
          : "textarea";

    let options: string[] | undefined;
    if (el instanceof HTMLSelectElement) {
      options = Array.from(el.options)
        .map((o) => o.textContent?.trim() ?? "")
        .filter((t) => t && !/^select/i.test(t));
    } else if (el instanceof HTMLInputElement && el.type === "radio") {
      options = nodes
        .filter(
          (n): n is HTMLInputElement =>
            n instanceof HTMLInputElement &&
            n.type === "radio" &&
            n.name === name,
        )
        .map((n) => {
          const lab = labelFor(n, root);
          return lab || n.value;
        });
    }

    const skip = skipReason(el, label, name);
    const id = `${name}-${index}`;
    el.setAttribute("data-imprint-id", id);

    fields.push({
      id,
      name,
      label,
      type,
      tag,
      required: el.hasAttribute("required") || el.getAttribute("aria-required") === "true",
      placeholder: el.getAttribute("placeholder") ?? undefined,
      autocomplete: el.getAttribute("autocomplete") ?? undefined,
      options,
      skipReason: skip,
    });
  });

  return fields;
}

export function findFieldElement(root: HTMLElement, fieldId: string) {
  return root.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    `[data-imprint-id="${cssEscape(fieldId)}"]`,
  );
}

export function fillElement(
  root: HTMLElement,
  field: DetectedField,
  value: string,
) {
  if (field.skipReason) return false;
  const el = findFieldElement(root, field.id);
  if (!el) return false;

  if (el instanceof HTMLSelectElement) {
    const match = matchOption(Array.from(el.options).map((o) => o.value || o.text), value);
    const opt = Array.from(el.options).find(
      (o) =>
        o.value === match ||
        (o.textContent ?? "").toLowerCase() === (match ?? "").toLowerCase() ||
        (o.textContent ?? "").toLowerCase().includes(value.toLowerCase()),
    );
    if (opt) el.value = opt.value;
    else el.value = value;
  } else if (el instanceof HTMLInputElement && el.type === "checkbox") {
    el.checked = /^(true|yes|on|1|checked)$/i.test(value);
  } else if (el instanceof HTMLInputElement && el.type === "radio") {
    const group = root.querySelectorAll<HTMLInputElement>(
      `input[type="radio"][name="${cssEscape(el.name)}"]`,
    );
    const target = Array.from(group).find((r) => {
      const lab = labelFor(r, root).toLowerCase();
      return (
        r.value.toLowerCase() === value.toLowerCase() ||
        lab === value.toLowerCase() ||
        lab.includes(value.toLowerCase()) ||
        value.toLowerCase().includes(lab)
      );
    });
    if (target) target.checked = true;
  } else if (el instanceof HTMLInputElement && el.type === "date") {
    el.value = toDateValue(value);
  } else {
    const proto = Object.getPrototypeOf(el) as { value?: unknown };
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    if (desc?.set) desc.set.call(el, value);
    else el.value = value;
  }

  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function matchOption(options: string[], value: string) {
  const v = value.toLowerCase();
  return (
    options.find((o) => o.toLowerCase() === v) ??
    options.find((o) => o.toLowerCase().includes(v) || v.includes(o.toLowerCase()))
  );
}

function toDateValue(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const t = Date.parse(value);
  if (Number.isNaN(t)) return value;
  return new Date(t).toISOString().slice(0, 10);
}

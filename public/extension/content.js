(() => {
  if (!document.getElementById("imprint-style")) {
    const style = document.createElement("style");
    style.id = "imprint-style";
    style.textContent =
      "[data-imprint-id].imprint-filling{outline:2px solid #c8ccd4;outline-offset:2px;border-radius:6px;transition:outline-color .2s ease;}";
    document.documentElement.appendChild(style);
  }
  const SKIP_TYPES = new Set(["hidden", "submit", "button", "reset", "file", "image"]);
  const NEVER = [
    /password/i,
    /cc-number|card.?number|credit.?card|pan\b/i,
    /cvc|cvv|security.?code/i,
    /ssn|social.?security/i,
  ];
  const LEGAL = /terms|privacy|agree|consent|opt.?in/i;

  const AUTOCOMPLETE = {
    "given-name": "firstName",
    "family-name": "lastName",
    name: "fullName",
    email: "email",
    tel: "phone",
    "street-address": "address1",
    "address-line1": "address1",
    "address-line2": "address2",
    "address-level2": "city",
    "address-level1": "state",
    "postal-code": "zip",
    country: "country",
    "country-name": "country",
    bday: "dob",
    organization: "company",
    "organization-title": "jobTitle",
    url: "website",
  };

  const ALIASES = {
    firstName: ["first name", "firstname", "given name", "fname"],
    lastName: ["last name", "lastname", "surname", "lname", "family name"],
    fullName: ["full name", "your name", "applicant name", "name"],
    dob: ["date of birth", "birthdate", "birthday", "dob"],
    email: ["email", "e-mail", "email address"],
    phone: ["phone", "mobile", "telephone", "cell"],
    address1: ["street", "address line 1", "street address"],
    address2: ["address line 2", "apartment", "suite", "unit", "apt"],
    city: ["city", "town"],
    state: ["state", "province", "region"],
    zip: ["zip", "postal", "postcode"],
    country: ["country"],
    company: ["company", "employer", "organization"],
    jobTitle: ["job title", "title", "role", "position"],
    linkedin: ["linkedin"],
    website: ["website", "portfolio"],
  };

  function clean(text) {
    return (text || "").replace(/\s+/g, " ").replace(/\*$/, "").trim();
  }
  function norm(s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }
  function labelFor(el) {
    if (el.id) {
      const lab = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lab) return clean(lab.textContent);
    }
    const wrap = el.closest("label");
    if (wrap) {
      const clone = wrap.cloneNode(true);
      clone.querySelectorAll("input,select,textarea").forEach((n) => n.remove());
      if (clone.textContent) return clean(clone.textContent);
    }
    return clean(el.getAttribute("aria-label") || el.getAttribute("placeholder") || "");
  }

  function skipReason(el, label, name) {
    const hay = `${label} ${name} ${el.getAttribute("autocomplete") || ""} ${el.id}`;
    if (el.type === "password") return "Passwords are never filled";
    if (NEVER.some((re) => re.test(hay))) {
      if (/card|cvc|cvv/i.test(hay)) return "Card numbers stay in your hands";
      if (/ssn|social/i.test(hay)) return "Sensitive IDs are skipped";
      return "Skipped for safety";
    }
    if (el.type === "checkbox" && LEGAL.test(hay)) return "Review agreements yourself";
    return null;
  }

  function scan() {
    const nodes = [...document.querySelectorAll("input, select, textarea")];
    const radioSeen = new Set();
    const fields = [];
    nodes.forEach((el, index) => {
      if (SKIP_TYPES.has(el.type) || el.disabled) return;
      const name = el.getAttribute("name") || el.id || `field-${index}`;
      if (el.type === "radio") {
        if (radioSeen.has(name)) return;
        radioSeen.add(name);
      }
      const label = labelFor(el) || name;
      const tag = el.tagName.toLowerCase();
      const options =
        tag === "select"
          ? [...el.options].map((o) => o.textContent.trim()).filter((t) => t && !/^select/i.test(t))
          : undefined;
      const id = `${name}-${index}`;
      el.setAttribute("data-imprint-id", id);
      fields.push({
        id,
        name,
        label,
        type: el.type || tag,
        tag,
        required: el.required,
        placeholder: el.getAttribute("placeholder") || "",
        autocomplete: el.getAttribute("autocomplete") || "",
        options,
        skipReason: skipReason(el, label, name),
      });
    });
    return {
      fields,
      url: location.href,
      title: document.title,
      host: location.host,
    };
  }

  function mapFields(fields, vault) {
    const used = new Set();
    const byKey = Object.fromEntries(vault.map((v) => [v.key, v]));
    return fields.map((field) => {
      if (field.skipReason) {
        return { fieldId: field.id, vaultKey: null, value: "", needsInput: false };
      }
      const ac = (field.autocomplete || "").split(" ").pop();
      const acKey = AUTOCOMPLETE[ac];
      if (acKey && byKey[acKey] && byKey[acKey].value && !used.has(acKey)) {
        used.add(acKey);
        return {
          fieldId: field.id,
          vaultKey: acKey,
          value: byKey[acKey].value,
          needsInput: false,
        };
      }
      const hay = norm([field.label, field.name, field.placeholder].join(" "));
      let hit = null;
      for (const [key, aliases] of Object.entries(ALIASES)) {
        if (!byKey[key] || !byKey[key].value || used.has(key)) continue;
        if (aliases.some((a) => hay === a || hay.includes(a))) {
          hit = key;
          break;
        }
      }
      if (!hit) {
        for (const v of vault) {
          if (!v.value || used.has(v.key)) continue;
          const n = norm(v.label);
          if (n && (hay === n || hay.includes(n) || n.includes(hay))) {
            hit = v.key;
            break;
          }
        }
      }
      if (hit) {
        used.add(hit);
        return {
          fieldId: field.id,
          vaultKey: hit,
          value: byKey[hit].value,
          needsInput: false,
        };
      }
      const saveAsKey = (field.name || field.label || "custom")
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .slice(0, 4)
        .map((p, i) =>
          i === 0 ? p.toLowerCase() : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase(),
        )
        .join("") || "customField";
      return {
        fieldId: field.id,
        vaultKey: null,
        value: "",
        needsInput: true,
        question: `This form asks for “${field.label}”. Add it to your vault?`,
        saveAsKey,
        saveAsLabel: field.label,
      };
    });
  }

  function fillField(field, value) {
    const el = document.querySelector(`[data-imprint-id="${CSS.escape(field.id)}"]`);
    if (!el || field.skipReason) return false;
    el.classList.add("imprint-filling");
    if (el.tagName === "SELECT") {
      const opt = [...el.options].find(
        (o) =>
          o.text.toLowerCase() === value.toLowerCase() ||
          o.value.toLowerCase() === value.toLowerCase() ||
          o.text.toLowerCase().includes(value.toLowerCase()),
      );
      el.value = opt ? opt.value : value;
    } else if (el.type === "checkbox") {
      el.checked = /^(true|yes|on|1)$/i.test(value);
    } else if (el.type === "radio") {
      const group = document.querySelectorAll(`input[type="radio"][name="${CSS.escape(el.name)}"]`);
      const target = [...group].find((r) => r.value.toLowerCase() === value.toLowerCase());
      if (target) target.checked = true;
    } else {
      const proto = Object.getPrototypeOf(el);
      const desc = Object.getOwnPropertyDescriptor(proto, "value");
      if (desc && desc.set) desc.set.call(el, value);
      else el.value = value;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    setTimeout(() => el.classList.remove("imprint-filling"), 600);
    return true;
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "SCAN") {
      sendResponse(scan());
      return true;
    }
    if (msg.type === "MAP") {
      const page = scan();
      sendResponse({ ...page, mappings: mapFields(page.fields, msg.vault || []) });
      return true;
    }
    if (msg.type === "FILL") {
      const page = scan();
      const mappings = msg.mappings || mapFields(page.fields, msg.vault || []);
      mappings.forEach((m) => {
        const field = page.fields.find((f) => f.id === m.fieldId);
        if (field && m.value) fillField(field, m.value);
      });
      sendResponse({ ok: true, mappings, fields: page.fields, url: page.url, title: page.title, host: page.host });
      return true;
    }
    if (msg.type === "FILL_ONE") {
      const page = scan();
      const field = page.fields.find((f) => f.id === msg.fieldId);
      if (field) fillField(field, msg.value);
      sendResponse({ ok: true });
      return true;
    }
    return false;
  });
})();

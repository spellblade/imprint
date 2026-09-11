const $ = (id) => document.getElementById(id);

let page = { fields: [], mappings: [], url: "", title: "", host: "" };
let askQueue = [];
let vault = [];
let savedForms = [];

async function storageGet() {
  return chrome.storage.local.get(["vault", "savedForms"]);
}
async function storageSet(patch) {
  return chrome.storage.local.set(patch);
}

async function tab() {
  const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
  return t;
}

async function send(type, extra = {}) {
  const t = await tab();
  if (!t?.id) throw new Error("No active tab");
  try {
    return await chrome.tabs.sendMessage(t.id, { type, ...extra });
  } catch {
    await chrome.scripting.executeScript({ target: { tabId: t.id }, files: ["content.js"] });
    return chrome.tabs.sendMessage(t.id, { type, ...extra });
  }
}

function renderFields() {
  $("fields").innerHTML = page.fields
    .map((f) => {
      const m = page.mappings.find((x) => x.fieldId === f.id);
      const extra = f.skipReason
        ? f.skipReason
        : m?.value
          ? m.value
          : m?.question || "Unmapped";
      return `<li>
        <div class="label">${escapeHtml(f.label)}</div>
        <div class="name">${escapeHtml(f.name)}</div>
        <div class="value">${escapeHtml(extra)}</div>
      </li>`;
    })
    .join("");
  $("meta").textContent = page.fields.length
    ? `${page.fields.length} fields on ${page.host || "this page"}`
    : "Open a form, then scan.";
  $("page-title").textContent = page.title || "This page";
}

function renderAsk() {
  const ask = askQueue[0];
  $("ask").classList.toggle("hidden", !ask);
  if (!ask) return;
  $("ask-q").textContent = ask.question || "Add this field?";
  $("ask-input").value = "";
  $("ask-input").focus();
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");
}

$("scan").onclick = async () => {
  $("status-pill").textContent = "Scanning";
  const res = await send("MAP", { vault });
  page = { ...res, mappings: res.mappings || [] };
  $("status-pill").textContent = "Scanned";
  renderFields();
};

$("fill").onclick = async () => {
  $("status-pill").textContent = "Filling";
  const res = await send("FILL", { vault, mappings: page.mappings });
  page = { ...page, ...res };
  askQueue = (page.mappings || []).filter((m) => m.needsInput && !m.value);
  $("status-pill").textContent = askQueue.length ? "Needs input" : "Filled";
  renderFields();
  renderAsk();
  const existing = savedForms.find((f) => f.url === page.url);
  if (existing) {
    existing.fillCount = (existing.fillCount || 0) + 1;
    existing.lastFilledAt = Date.now();
    existing.mappings = page.mappings;
    await storageSet({ savedForms });
  }
};

$("save").onclick = async () => {
  if (!page.fields.length) {
    const res = await send("MAP", { vault });
    page = { ...res, mappings: res.mappings || [] };
  }
  const rec = {
    id: `${Date.now()}`,
    name: page.title || page.host,
    url: page.url,
    host: page.host,
    fields: page.fields,
    mappings: page.mappings,
    savedAt: Date.now(),
    fillCount: 0,
  };
  savedForms = [rec, ...savedForms.filter((f) => f.url !== rec.url)];
  await storageSet({ savedForms });
  $("status-pill").textContent = "Saved";
};

$("ask-go").onclick = async () => {
  const ask = askQueue[0];
  const value = $("ask-input").value.trim();
  if (!ask || !value) return;
  await send("FILL_ONE", { fieldId: ask.fieldId, value });
  ask.value = value;
  ask.needsInput = false;
  if ($("ask-save").checked) {
    const key = ask.saveAsKey || "custom";
    const existing = vault.find((v) => v.key === key);
    if (existing) existing.value = value;
    else vault.push({ key, label: ask.saveAsLabel || key, value });
    await storageSet({ vault });
  }
  askQueue = askQueue.slice(1);
  renderFields();
  renderAsk();
};

$("ask-skip").onclick = () => {
  askQueue = askQueue.slice(1);
  renderAsk();
};

$("open-vault").onclick = (e) => {
  e.preventDefault();
  $("vault-editor").classList.toggle("hidden");
  renderVault();
};

$("add-field").onclick = async () => {
  const label = $("new-label").value.trim();
  const value = $("new-value").value.trim();
  if (!label) return;
  const key = label
    .split(/\s+/)
    .map((p, i) => (i === 0 ? p.toLowerCase() : p[0].toUpperCase() + p.slice(1).toLowerCase()))
    .join("");
  vault.push({ key, label, value });
  await storageSet({ vault });
  $("new-label").value = "";
  $("new-value").value = "";
  renderVault();
};

function renderVault() {
  $("vault-fields").innerHTML = vault
    .map(
      (v, i) => `<div class="vault-row">
        <input data-i="${i}" data-k="label" value="${escapeHtml(v.label)}" />
        <input data-i="${i}" data-k="value" value="${escapeHtml(v.value)}" />
      </div>`,
    )
    .join("");
  $("vault-fields").querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", async () => {
      const i = Number(input.dataset.i);
      const k = input.dataset.k;
      vault[i][k] = input.value;
      await storageSet({ vault });
    });
  });
}

(async () => {
  const stored = await storageGet();
  vault = stored.vault || [];
  savedForms = stored.savedForms || [];
  try {
    const t = await tab();
    $("page-title").textContent = t?.title || "This page";
    const saved = savedForms.find((f) => t?.url && f.url === t.url);
    if (saved) $("status-pill").textContent = "Saved form";
  } catch {
    /* popup opened without a tab */
  }
})();

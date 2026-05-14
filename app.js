const CATEGORIES = [
  "Dashboard",
  "Daily / Weekly / Monthly Routines",
  "Equipment & Devices",
  "Consumables & Stock",
  "Systems, Ordering & Fault Reporting",
  "Contacts & Escalation",
  "Open Questions & Contradictions",
  "Policies, Manuals & Resources",
  "Search / Index"
];

const EMPTY_DATA = {
  appVersion: "1.0.0",
  schemaVersion: "1.0.0",
  owner: "Andrew Bethell",
  created: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  entries: [],
  contacts: [],
  assets: [],
  changeLog: []
};

let data = structuredClone(EMPTY_DATA);
let currentCategory = "Dashboard";

const $ = (id) => document.getElementById(id);

function normaliseStatusClass(status) {
  return "status-" + String(status || "").replace(/\s+/g, "");
}

function uid(prefix = "entry") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function splitList(value) {
  return String(value || "").split(",").map(x => x.trim()).filter(Boolean);
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, s => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[s]));
}

function init() {
  populateCategoryControls();
  wireEvents();
  loadFromLocalStorage();
  render();
}

function populateCategoryControls() {
  const nav = $("categoryNav");
  nav.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.dataset.category = cat;
    btn.addEventListener("click", () => {
      currentCategory = cat;
      render();
    });
    nav.appendChild(btn);
  });

  [$("quickCategory"), $("entryCategory")].forEach(select => {
    select.innerHTML = "";
    CATEGORIES.filter(c => c !== "Dashboard" && c !== "Search / Index").forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
  });
}

function wireEvents() {
  $("btnImport").addEventListener("click", () => $("fileInput").click());
  $("fileInput").addEventListener("change", importFile);
  $("btnExport").addEventListener("click", exportJson);
  $("btnSeed").addEventListener("click", loadSample);
  $("searchInput").addEventListener("input", renderEntries);
  $("filterConfirmedOnly").addEventListener("change", renderEntries);
  $("filterOpenOnly").addEventListener("change", renderEntries);
  $("btnQuickAdd").addEventListener("click", addQuickCapture);
  $("btnNewEntry").addEventListener("click", () => openEntryDialog());
  $("btnSaveEntry").addEventListener("click", saveEntryFromDialog);
  $("btnValidate").addEventListener("click", validateData);
  $("btnCapturePrompt").addEventListener("click", copyCapturePrompt);
}

function loadFromLocalStorage() {
  const stored = localStorage.getItem("icuTechnicianKnowledgeDraft");
  if (stored) {
    try { data = JSON.parse(stored); }
    catch { data = structuredClone(EMPTY_DATA); }
  }
}

function persistDraft() {
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem("icuTechnicianKnowledgeDraft", JSON.stringify(data));
}

async function importFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    const imported = JSON.parse(text);
    data = { ...structuredClone(EMPTY_DATA), ...imported, entries: imported.entries || [] };
    persistDraft();
    render();
    alert("Knowledge file imported.");
  } catch (err) {
    alert("Could not import JSON: " + err.message);
  } finally {
    e.target.value = "";
  }
}

function exportJson() {
  persistDraft();
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, "-");
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `technician-knowledge-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function loadSample() {
  data = structuredClone(SAMPLE_DATA);
  persistDraft();
  render();
}

function addQuickCapture() {
  const text = $("quickText").value.trim();
  if (!text) return alert("Enter a note first.");
  const entry = {
    id: uid("quick"),
    title: text.split("\n")[0].replace(/^Technician note:\s*/i, "").slice(0, 110),
    category: $("quickCategory").value,
    subcategory: "",
    status: $("quickStatus").value,
    importance: "Routine",
    summary: text,
    bodyMarkdown: text,
    locations: [],
    people: [],
    tags: ["quick-capture"],
    sourceRefs: [{ type: "quick-capture", date: new Date().toISOString(), note: "Entered through app quick capture" }],
    lastUpdated: new Date().toISOString(),
    changeLog: [{ date: new Date().toISOString(), change: "Quick capture created" }]
  };
  data.entries.unshift(entry);
  data.changeLog.push({ date: new Date().toISOString(), change: `Added quick capture: ${entry.title}` });
  $("quickText").value = "";
  persistDraft();
  render();
}

function render() {
  renderMeta();
  renderNav();
  renderDashboard();
  renderEntries();
}

function renderMeta() {
  $("schemaVersion").textContent = data.schemaVersion || "—";
  $("entryCount").textContent = data.entries.length;
  $("lastUpdated").textContent = data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : "—";
}

function renderNav() {
  document.querySelectorAll(".category-nav button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === currentCategory);
    const count = currentCategoryCount(btn.dataset.category);
    btn.innerHTML = `<span>${escapeHtml(btn.dataset.category)}</span><span>${count}</span>`;
  });
  $("viewTitle").textContent = currentCategory === "Dashboard" ? "All entries" : currentCategory;
}

function currentCategoryCount(category) {
  if (category === "Dashboard" || category === "Search / Index") return data.entries.length;
  return data.entries.filter(e => e.category === category).length;
}

function renderDashboard() {
  const count = status => data.entries.filter(e => e.status === status).length;
  $("dashConfirmed").textContent = count("Confirmed");
  $("dashProvisional").textContent = count("Provisional");
  $("dashOpen").textContent = data.entries.filter(e => e.status === "Open Question").length;
  $("dashContradictions").textContent = count("Contradiction");
}

function entryMatchesSearch(entry, q) {
  if (!q) return true;
  const haystack = [
    entry.title, entry.category, entry.subcategory, entry.status, entry.importance,
    entry.summary, entry.bodyMarkdown, ...(entry.tags || []), ...(entry.people || []), ...(entry.locations || [])
  ].join(" ").toLowerCase();
  return haystack.includes(q.toLowerCase());
}

function filteredEntries() {
  const q = $("searchInput").value.trim();
  const confirmedOnly = $("filterConfirmedOnly").checked;
  const openOnly = $("filterOpenOnly").checked;
  return data.entries.filter(e => {
    const catOk = currentCategory === "Dashboard" || currentCategory === "Search / Index" || e.category === currentCategory;
    const confirmedOk = !confirmedOnly || e.status === "Confirmed";
    const openOk = !openOnly || e.status === "Open Question";
    return catOk && confirmedOk && openOk && entryMatchesSearch(e, q);
  });
}

function renderEntries() {
  const list = $("entriesList");
  list.innerHTML = "";
  const entries = filteredEntries();
  if (!entries.length) {
    list.innerHTML = `<p class="entry-meta">No matching entries.</p>`;
    return;
  }

  const template = $("entryTemplate");
  entries.forEach(entry => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".entry-card");
    card.dataset.id = entry.id;

    const status = node.querySelector(".status-pill");
    status.textContent = entry.status || "Unspecified";
    status.classList.add(normaliseStatusClass(entry.status));

    const importance = node.querySelector(".importance-pill");
    importance.textContent = entry.importance || "Routine";

    node.querySelector("h3").textContent = entry.title || "Untitled";
    node.querySelector(".entry-meta").textContent = `${entry.category || "No category"}${entry.subcategory ? " → " + entry.subcategory : ""}`;
    node.querySelector(".entry-summary").textContent = entry.summary || "";
    node.querySelector(".entry-body").textContent = entry.bodyMarkdown || "";
    node.querySelector(".entry-tags").textContent = [
      entry.tags?.length ? "Tags: " + entry.tags.join(", ") : "",
      entry.people?.length ? "People: " + entry.people.join(", ") : "",
      entry.locations?.length ? "Locations: " + entry.locations.join(", ") : ""
    ].filter(Boolean).join(" | ");

    node.querySelector(".edit-entry").addEventListener("click", () => openEntryDialog(entry));
    node.querySelector(".delete-entry").addEventListener("click", () => deleteEntry(entry.id));
    node.querySelector(".copy-prompt").addEventListener("click", () => copyUpdatePrompt(entry));

    list.appendChild(node);
  });
}

function openEntryDialog(entry = null) {
  $("entryDialogTitle").textContent = entry ? "Edit entry" : "New entry";
  $("entryId").value = entry?.id || "";
  $("entryTitle").value = entry?.title || "";
  $("entryCategory").value = entry?.category || "Equipment & Devices";
  $("entrySubcategory").value = entry?.subcategory || "";
  $("entryStatus").value = entry?.status || "Provisional";
  $("entryImportance").value = entry?.importance || "Routine";
  $("entrySummary").value = entry?.summary || "";
  $("entryBody").value = entry?.bodyMarkdown || "";
  $("entryTags").value = (entry?.tags || []).join(", ");
  $("entryPeople").value = (entry?.people || []).join(", ");
  $("entryLocations").value = (entry?.locations || []).join(", ");
  $("entryDialog").showModal();
}

function saveEntryFromDialog(event) {
  event.preventDefault();
  const existingId = $("entryId").value;
  const entry = {
    id: existingId || uid("entry"),
    title: $("entryTitle").value.trim(),
    category: $("entryCategory").value,
    subcategory: $("entrySubcategory").value.trim(),
    status: $("entryStatus").value,
    importance: $("entryImportance").value,
    summary: $("entrySummary").value.trim(),
    bodyMarkdown: $("entryBody").value.trim(),
    tags: splitList($("entryTags").value),
    people: splitList($("entryPeople").value),
    locations: splitList($("entryLocations").value),
    sourceRefs: [],
    lastUpdated: new Date().toISOString(),
    changeLog: [{ date: new Date().toISOString(), change: existingId ? "Entry edited" : "Entry created" }]
  };

  if (!entry.title) return alert("Title is required.");

  const idx = data.entries.findIndex(e => e.id === existingId);
  if (idx >= 0) {
    entry.sourceRefs = data.entries[idx].sourceRefs || [];
    entry.changeLog = [...(data.entries[idx].changeLog || []), ...entry.changeLog];
    data.entries[idx] = entry;
  } else {
    data.entries.unshift(entry);
  }

  data.changeLog.push({ date: new Date().toISOString(), change: `${existingId ? "Edited" : "Created"} entry: ${entry.title}` });
  persistDraft();
  $("entryDialog").close();
  render();
}

function deleteEntry(id) {
  const entry = data.entries.find(e => e.id === id);
  if (!entry) return;
  if (!confirm(`Delete "${entry.title}"?`)) return;
  data.entries = data.entries.filter(e => e.id !== id);
  data.changeLog.push({ date: new Date().toISOString(), change: `Deleted entry: ${entry.title}` });
  persistDraft();
  render();
}

function validateData() {
  const issues = [];
  const ids = new Set();

  data.entries.forEach((e, i) => {
    if (!e.id) issues.push(`Entry ${i + 1}: missing id.`);
    if (ids.has(e.id)) issues.push(`Duplicate id: ${e.id}`);
    ids.add(e.id);
    if (!e.title) issues.push(`Entry ${e.id || i + 1}: missing title.`);
    if (!CATEGORIES.includes(e.category)) issues.push(`Entry "${e.title}": category "${e.category}" is not recognised.`);
    if (!e.status) issues.push(`Entry "${e.title}": missing status.`);
    if (e.status === "Confirmed" && /unclear|unknown|needs confirmation|not confirmed/i.test(e.bodyMarkdown || e.summary || "")) {
      issues.push(`Entry "${e.title}": marked Confirmed but contains uncertainty language.`);
    }
  });

  const output = $("validationOutput");
  output.hidden = false;
  output.textContent = issues.length ? `Validation issues:\n\n- ${issues.join("\n- ")}` : "Validation passed. No obvious structural problems found.";
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
  alert("Copied to clipboard.");
}

function copyCapturePrompt() {
  const raw = $("quickText").value.trim() || "[PASTE RAW TECHNICIAN NOTE HERE]";
  const prompt = `Convert the following ICU Technician note into a structured JSON entry for my technician knowledge app.

Rules:
- Preserve exact operational details.
- Do not invent missing information.
- If uncertain, mark status as "Unverified" or "Open Question".
- Use one of these categories: ${CATEGORIES.filter(c => c !== "Dashboard" && c !== "Search / Index").join("; ")}.
- Return only JSON for one entry, no markdown.

Raw note:
${raw}`;
  copyText(prompt);
}

function copyUpdatePrompt(entry) {
  const prompt = `Review this ICU Technician knowledge entry and suggest a safer, cleaner structured update.

Rules:
- Preserve original meaning.
- Do not invent missing steps.
- Keep local uncertainty visible.
- Return a JSON patch object with fields to change only.

Entry:
${JSON.stringify(entry, null, 2)}`;
  copyText(prompt);
}

const SAMPLE_DATA = {
  ...structuredClone(EMPTY_DATA),
  entries: [
    {
      id: "abl90-sensor-cassette-stock",
      title: "ABL90 sensor cassette stock rule",
      category: "Consumables & Stock",
      subcategory: "ABL90 FLEX",
      status: "Confirmed",
      importance: "High",
      summary: "Keep approximately four ABL90 sensor cassettes available.",
      bodyMarkdown: "ABL90 sensor cassette stock rule: keep approximately four sensor cassettes in stock / maintain four sensor cassettes available.",
      tags: ["ABL90", "sensor cassette", "stock"],
      people: [],
      locations: ["Central ICU"],
      sourceRefs: [{ type: "memory-seed", date: "2026-04-28", note: "User-sourced technician project memory" }],
      lastUpdated: new Date().toISOString(),
      changeLog: []
    },
    {
      id: "htm-service-request-basics",
      title: "HTM service request basic required fields",
      category: "Systems, Ordering & Fault Reporting",
      subcategory: "HTM / Hexagon",
      status: "Confirmed",
      importance: "High",
      summary: "HTM requests require asset number, location, category, code and a clear fault description.",
      bodyMarkdown: "Access pathway recorded: Hospital intranet → HTM / AMIS → HTM. Required information includes asset number, usually beginning with CC followed by numbers; equipment location, either actual location or broken equipment shelf; service category Generic Service Category; code Service Request; and a description including device, fault and troubleshooting already attempted.",
      tags: ["HTM", "Hexagon", "fault reporting", "asset number"],
      people: [],
      locations: ["Hospital intranet", "Broken equipment shelf"],
      sourceRefs: [{ type: "memory-seed", date: "2026-04-28", note: "User-sourced technician project memory" }],
      lastUpdated: new Date().toISOString(),
      changeLog: []
    },
    {
      id: "weekly-inspiratory-valve-open-question",
      title: "Weekly inspiratory valve sterile services workflow needs confirmation",
      category: "Open Questions & Contradictions",
      subcategory: "Sterile Services",
      status: "Open Question",
      importance: "Medium",
      summary: "One inspiratory valve is sent to Sterile Services weekly, but the exact day and selection criteria remain unclear.",
      bodyMarkdown: "Inspiratory valves are sent to Sterile Services once weekly; exact day and selection criteria remain unclear.",
      tags: ["inspiratory valve", "sterile services", "open question"],
      people: [],
      locations: ["ICU", "Sterile Services"],
      sourceRefs: [{ type: "memory-seed", date: "2026-04-28", note: "User-sourced technician project memory" }],
      lastUpdated: new Date().toISOString(),
      changeLog: []
    }
  ],
  changeLog: [{ date: new Date().toISOString(), change: "Sample data loaded" }]
};

init();

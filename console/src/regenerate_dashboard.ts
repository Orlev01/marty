/**
 * regenerate_dashboard.ts -- Schema-driven dashboard generator.
 *
 * Reads: schemas.json, config.json, team.json, metrics.json, cycle_state.json
 * Writes: dashboard.html (self-contained, config-driven)
 *
 * All tabs, fields, and views are generated from schemas.json.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { getEditorCss, getEditorJs } from "./ui/schema_editor.js";
import { getConnectionsCss, getConnectionsJs } from "./ui/connections.js";
import { getRecordsEditorCss, getRecordsEditorJs } from "./ui/records.js";
import { parseAllSources } from "./parse_sources.js";
import { loadJson } from "./types.js";
import type {
  Config,
  Team,
  Schemas,
  State,
  Metrics,
  Guide,
  LedgerEntry,
  SchemaDef,
  SchemaField,
  Member,
  Stakeholder,
} from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const BASE_DIR = dirname(join(__filename, ".."));

// ---- Helpers ----

function e(text: unknown): string {
  if (text == null) return "";
  if (Array.isArray(text)) {
    return htmlEscape(text.map((x) => String(x)).join(", "));
  }
  return htmlEscape(String(text));
}

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function getMemberName(
  memberId: string,
  team: Team,
): string {
  for (const m of team.members ?? []) {
    if (m.id === memberId) return m.name;
  }
  for (const s of team.stakeholders ?? []) {
    if (s.id === memberId) return s.name;
  }
  return String(memberId);
}

function getRecordTitle(
  recordId: string,
  collections: Record<string, Record<string, unknown>[]>,
  schemaName: string,
): string {
  for (const r of collections[schemaName] ?? []) {
    if (r._id === recordId) return String(r.title ?? recordId);
  }
  return String(recordId);
}

function statusBadge(status: string): string {
  const colors: Record<string, string> = {
    not_started: "#6b7280",
    in_progress: "#2563eb",
    blocked: "#dc2626",
    done: "#16a34a",
    open: "#dc2626",
    resolved: "#16a34a",
    active: "#2563eb",
    backlog: "#6b7280",
    critical: "#dc2626",
    high: "#ea580c",
    medium: "#ca8a04",
    low: "#6b7280",
    P0: "#dc2626",
    P1: "#ea580c",
    P2: "#ca8a04",
    P3: "#6b7280",
  };
  const color = colors[status] ?? "#6b7280";
  return `<span class="badge" style="background:${color}">${e(status)}</span>`;
}

function renderFieldValue(
  value: unknown,
  field: SchemaField,
  team: Team,
  collections: Record<string, Record<string, unknown>[]>,
): string {
  if (value == null) return '<span class="empty">--</span>';
  const ftype = field.type ?? "text";
  if (ftype === "member") return e(getMemberName(String(value), team));
  if (ftype === "member[]") {
    if (Array.isArray(value)) {
      return e(value.map((v) => getMemberName(String(v), team)).join(", "));
    }
    return e(String(value));
  }
  if (ftype === "select") return statusBadge(String(value));
  if (ftype === "multi_select") {
    if (Array.isArray(value)) {
      return value.map((v) => statusBadge(String(v))).join(" ");
    }
    return statusBadge(String(value));
  }
  if (ftype.startsWith("ref:")) {
    const refSchema = ftype.replace("ref:", "").replace("[]", "");
    if (Array.isArray(value)) {
      return e(
        value.map((v) => getRecordTitle(String(v), collections, refSchema)).join(", "),
      );
    }
    return e(getRecordTitle(String(value), collections, refSchema));
  }
  if (ftype === "date") return e(String(value));
  const text = String(value);
  return renderRichText(text);
}

function renderRichText(text: string): string {
  const lines = text.split("\n");
  const parts: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const isBullet = /^[-*]\s/.test(trimmed);

    if (isBullet) {
      if (!inList) {
        parts.push('<ul class="rich-list">');
        inList = true;
      }
      parts.push(`<li>${mdInline(trimmed.replace(/^[-*]\s+/, ""))}</li>`);
    } else {
      if (inList) {
        parts.push("</ul>");
        inList = false;
      }
      if (trimmed === "") {
        // skip empty lines
      } else {
        parts.push(`<p class="rich-para">${mdInline(trimmed)}</p>`);
      }
    }
  }
  if (inList) parts.push("</ul>");
  return parts.join("");
}

function sortRecords(
  records: Record<string, unknown>[],
  schema: SchemaDef,
): Record<string, unknown>[] {
  const sortField = schema.dashboardView?.sortBy;
  if (!sortField) return records;
  const priorityOrder: Record<string, number> = {
    P0: 0, P1: 1, P2: 2, P3: 3,
    critical: 0, high: 1, medium: 2, low: 3,
  };
  return [...records].sort((a, b) => {
    const va = a[sortField] as string | undefined;
    const vb = b[sortField] as string | undefined;
    const valA = va ?? "";
    const valB = vb ?? "";
    const inA = valA in priorityOrder;
    const inB = valB in priorityOrder;
    if (inA && inB) return priorityOrder[valA] - priorityOrder[valB];
    if (inA && !inB) return -1;
    if (!inA && inB) return 1;
    const sA = valA || "~";
    const sB = valB || "~";
    return sA < sB ? -1 : sA > sB ? 1 : 0;
  });
}

function renderTableRow(
  record: Record<string, unknown>,
  fields: SchemaField[],
  allFields: SchemaField[],
  team: Team,
  collections: Record<string, Record<string, unknown>[]>,
): string {
  const recordId = String(record._id ?? "");
  const hasDetailContent = allFields.some((f) => f.detailOnly && record[f.id]);
  const cells: string[] = [];
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const val = record[field.id];
    let rendered = renderFieldValue(val, field, team, collections);
    if (i === 0) {
      if (hasDetailContent) {
        rendered = `<span class="detail-indicator" title="Click row for details">&#9679;</span> ${rendered}`;
      }
      if (record._badge) {
        rendered += String(record._badge);
      }
    }
    // Make select fields with options clickable for inline cycling
    const isClickableSelect = field.type === "select" && field.options && field.options.length > 0;
    const selectAttr = isClickableSelect
      ? ` data-field-id="${e(field.id)}" data-record-id="${e(recordId)}" data-options="${e(field.options!.join(","))}" class="clickable-select"`
      : "";
    // Wrap long text fields in a clamp container for table cells
    const isLong = !isShortField(field, val) && val != null && String(val).length > 80;
    if (isLong) {
      cells.push(`<td${selectAttr}><div class="cell-clamp">${rendered}</div></td>`);
    } else {
      cells.push(`<td${selectAttr}>${rendered}</td>`);
    }
  }
  const actions =
    `<td class="row-actions">` +
    `<button class="row-action-btn edit-btn" data-action="edit" data-record-id="${e(recordId)}" title="Edit">&#9998;</button>` +
    `<button class="row-action-btn delete-btn" data-action="delete" data-record-id="${e(recordId)}" title="Delete">&times;</button>` +
    `</td>`;
  cells.push(actions);
  const statusVal = record.status ? ` data-status="${e(record.status)}"` : '';
  const ownerVal = record.owner ? ` data-owner="${e(record.owner)}"` : '';
  const priorityVal = record.priority ? ` data-priority="${e(record.priority)}"` : '';
  const rowClass = hasDetailContent ? ' class="has-detail"' : '';
  return `<tr data-record-id="${e(recordId)}"${statusVal}${ownerVal}${priorityVal}${rowClass}>${cells.join("")}</tr>`;
}

function renderTableView(
  records: Record<string, unknown>[],
  schema: SchemaDef,
  team: Team,
  collections: Record<string, Record<string, unknown>[]>,
): string {
  const allFields = schema.fields ?? [];
  const fields = allFields.filter((f) => !f.detailOnly);
  records = sortRecords(records, schema);
  const groupBy = schema.dashboardView?.groupBy;

  let headers = fields.map((f) => `<th>${e(f.name)}</th>`).join("");
  headers += '<th class="actions-col"></th>';
  const colspan = Math.max(fields.length, 1) + 1;

  if (!records.length) {
    return `<table class="data-table">
        <thead><tr>${headers}</tr></thead>
        <tbody><tr><td colspan='${colspan}'>No records yet</td></tr></tbody>
    </table>`;
  }

  let body = "";
  if (groupBy) {
    const groups: Record<string, Record<string, unknown>[]> = {};
    for (const record of records) {
      const groupVal = (record[groupBy] as string) || "Ungrouped";
      const groupField = fields.find((f) => f.id === groupBy);
      let groupLabel: string;
      if (groupField && (groupField.type ?? "").startsWith("ref:")) {
        const refSchema = groupField.type.replace("ref:", "").replace("[]", "");
        groupLabel = getRecordTitle(groupVal, collections, refSchema);
      } else {
        groupLabel = String(groupVal);
      }
      if (!groups[groupLabel]) groups[groupLabel] = [];
      groups[groupLabel].push(record);
    }

    let gi = 0;
    for (const [groupLabel, groupRecords] of Object.entries(groups)) {
      const gid = `grp-${gi}`;
      body += `<tr class="group-header-row" data-group="${gid}"><td colspan="${colspan}" class="group-header"><span class="group-chevron">&#9660;</span> ${e(groupLabel)}</td></tr>`;
      for (const record of groupRecords) {
        body += renderTableRow(record, fields, allFields, team, collections).replace(
          "<tr ",
          `<tr data-group-body="${gid}" `,
        );
      }
      gi++;
    }
  } else {
    for (const record of records) {
      body += renderTableRow(record, fields, allFields, team, collections);
    }
  }

  return `<table class="data-table">
        <thead><tr>${headers}</tr></thead>
        <tbody>${body}</tbody>
    </table>`;
}

function renderCardsView(
  records: Record<string, unknown>[],
  schema: SchemaDef,
  team: Team,
  collections: Record<string, Record<string, unknown>[]>,
): string {
  const fields = schema.fields ?? [];
  records = sortRecords(records, schema);
  const cards: string[] = [];
  for (const record of records) {
    const titleField = fields.find((f) => f.id === "title") ?? fields[0] ?? null;
    const title = titleField ? (record[titleField.id] ?? "Untitled") : "Untitled";
    const detailFields = titleField
      ? fields.filter((f) => f.id !== titleField.id)
      : fields;

    const recordId = String(record._id ?? "");
    const shortDetails: string[] = [];
    const longDetails: string[] = [];
    for (const field of detailFields) {
      const val = record[field.id];
      if (val == null || String(val).trim() === "") continue;
      const rendered = renderFieldValue(val, field, team, collections);
      const isClickableSelect = field.type === "select" && field.options && field.options.length > 0;
      if (isShortField(field, val)) {
        if (isClickableSelect) {
          shortDetails.push(
            `<div class="card-field clickable-select" data-field-id="${e(field.id)}" data-record-id="${e(recordId)}" data-options="${e(field.options!.join(","))}"><span class="card-label">${e(field.name)}</span> ${rendered}</div>`,
          );
        } else {
          shortDetails.push(
            `<div class="card-field"><span class="card-label">${e(field.name)}</span> ${rendered}</div>`,
          );
        }
      } else {
        longDetails.push(
          `<div class="card-section"><div class="card-section-label">${e(field.name)}</div><div class="card-section-content">${rendered}</div></div>`,
        );
      }
    }

    const longHtml = longDetails.length
      ? `<details class="card-details"><summary class="card-expand">More</summary>${longDetails.join("")}</details>`
      : "";

    cards.push(`<div class="card">
            <div class="card-title">${e(String(title))}</div>
            ${shortDetails.join("")}
            ${longHtml}
        </div>`);
  }

  const inner = cards.length
    ? cards.join("")
    : '<p class="empty">No records yet</p>';
  return `<div class="cards-grid">${inner}</div>`;
}

// Short field types that should render inline in the header area
const SHORT_FIELD_TYPES = new Set(["date", "select", "multi_select", "member", "member[]", "number", "boolean"]);

function isShortField(field: SchemaField, value: unknown): boolean {
  if (SHORT_FIELD_TYPES.has(field.type ?? "text")) return true;
  if (field.type?.startsWith("ref:")) return true;
  // Short text values (under 80 chars, single line)
  if ((field.type ?? "text") === "text") {
    const text = String(value ?? "");
    return text.length < 80 && !text.includes("\n");
  }
  return false;
}

function renderListView(
  records: Record<string, unknown>[],
  schema: SchemaDef,
  team: Team,
  collections: Record<string, Record<string, unknown>[]>,
): string {
  const fields = schema.fields ?? [];
  const items: string[] = [];
  for (const record of records) {
    const titleField = fields.find((f) => f.id === "title") ?? fields[0] ?? null;
    const title = titleField ? (record[titleField.id] ?? "Untitled") : "Untitled";

    const meta = (record._createdBy as string) || "";
    const metaName = meta ? getMemberName(meta, team) : "";
    const metaDate = ((record._createdAt as string) || "").slice(0, 10);
    let metaHtml: string;
    if (metaName && metaDate) {
      metaHtml = `${e(metaName)} &middot; ${e(metaDate)}`;
    } else {
      metaHtml = e(metaName || metaDate);
    }

    // Split fields into primary (short/inline) and detail (long/expandable)
    const primaryFields: string[] = [];
    const detailFields: string[] = [];

    for (const field of fields) {
      if (titleField && field.id === titleField.id) continue;
      const val = record[field.id];
      if (val == null || String(val).trim() === "") continue;

      const rendered = renderFieldValue(val, field, team, collections);

      if (isShortField(field, val)) {
        primaryFields.push(
          `<span class="list-chip"><span class="list-chip-label">${e(field.name)}</span> ${rendered}</span>`,
        );
      } else {
        detailFields.push(
          `<div class="list-section">
            <div class="list-section-label">${e(field.name)}</div>
            <div class="list-section-content">${rendered}</div>
          </div>`,
        );
      }
    }

    const primaryHtml = primaryFields.length
      ? `<div class="list-chips">${primaryFields.join("")}</div>`
      : "";

    let detailHtml = "";
    if (detailFields.length) {
      detailHtml = `<details class="list-details">
        <summary class="list-expand">Show details (${detailFields.length} sections)</summary>
        <div class="list-detail-body">${detailFields.join("")}</div>
      </details>`;
    }

    items.push(`<div class="list-item">
            <div class="list-title">${e(String(title))}</div>
            <div class="list-meta">${metaHtml}</div>
            ${primaryHtml}
            ${detailHtml}
        </div>`);
  }

  const inner = items.length
    ? items.join("")
    : '<p class="empty">No records yet</p>';
  return `<div class="list-view">${inner}</div>`;
}

function renderDiagramView(
  records: Record<string, unknown>[],
  schema: SchemaDef,
  team: Team,
  collections: Record<string, Record<string, unknown>[]>,
): string {
  records = sortRecords(records, schema);
  const cards: string[] = [];
  for (const record of records) {
    const title = (record.title as string) ?? "Untitled";
    const desc = (record.description as string) ?? "";
    const mermaidCode = (record.mermaid as string) ?? "";
    const category = (record.category as string) ?? "";

    const descHtml = desc ? `<div class="diagram-desc">${renderRichText(desc)}</div>` : "";
    const catHtml = category ? statusBadge(category) : "";

    cards.push(`<div class="diagram-card">
            <div class="diagram-header">
                <div class="diagram-title">${e(String(title))} ${catHtml}</div>
            </div>
            ${descHtml}
            <div class="diagram-content"><pre class="mermaid">${e(mermaidCode)}</pre></div>
        </div>`);
  }

  const inner = cards.length
    ? cards.join("")
    : '<p class="empty">No diagrams yet</p>';
  return `<div class="diagram-grid">${inner}</div>`;
}

function renderTimelineView(
  records: Record<string, unknown>[],
  schema: SchemaDef,
  team: Team,
  collections: Record<string, Record<string, unknown>[]>,
): string {
  const sortField = schema.dashboardView?.sortBy ?? "date";
  const sortedRecords = [...records].sort((a, b) => {
    const va = String(a[sortField] ?? a._createdAt ?? "");
    const vb = String(b[sortField] ?? b._createdAt ?? "");
    return vb < va ? -1 : vb > va ? 1 : 0;
  });
  return renderListView(sortedRecords, schema, team, collections);
}

function renderSchemaTab(
  schemaId: string,
  schema: SchemaDef,
  collections: Record<string, Record<string, unknown>[]>,
  team: Team,
  config: Config,
): string {
  const records = collections[schemaId] ?? [];
  const viewConfig: DashboardView = schema.dashboardView ?? { type: "table" };
  const viewType = viewConfig.type ?? "table";

  const count = records.length;
  let header = `<h2>${e(schema.name)} <span class="count">(${count})</span></h2>`;
  if (schema.description) {
    header += `<p class="schema-desc">${e(schema.description)}</p>`;
  }

  // Inject FOCUS/NEXT badges for the portfolio schema
  const portfolioConfig = config.portfolio ?? { schema: "", currentFocus: [], nextUp: [] };
  if (schemaId === portfolioConfig.schema) {
    const focusIds = new Set(portfolioConfig.currentFocus ?? []);
    const nextIds = new Set(portfolioConfig.nextUp ?? []);
    for (const r of records) {
      const rid = String(r._id ?? "");
      if (focusIds.has(rid)) {
        (r as Record<string, unknown>)._badge =
          '<span class="badge" style="background:#16a34a;margin-left:6px">FOCUS</span>';
      } else if (nextIds.has(rid)) {
        (r as Record<string, unknown>)._badge =
          '<span class="badge" style="background:#2563eb;margin-left:6px">NEXT</span>';
      }
    }
  }

  // Build filter bar for table views
  let filterBar = "";
  if (viewType === "table" && records.length > 0) {
    const fields = schema.fields ?? [];
    const statusField = fields.find((f) => f.id === "status" && f.type === "select");
    const ownerField = fields.find((f) => f.id === "owner" && (f.type === "member" || f.type === "member[]"));
    const priorityField = fields.find((f) => f.id === "priority" && f.type === "select");
    const filters: string[] = [];
    if (statusField && statusField.options) {
      const opts = statusField.options.map((o) => `<option value="${e(o)}">${e(o)}</option>`).join("");
      filters.push(`<select class="filter-select" data-filter="status"><option value="">All status</option>${opts}</select>`);
    }
    if (ownerField) {
      const memberOpts = (team.members ?? []).map((m) => `<option value="${e(m.id)}">${e(m.name)}</option>`).join("");
      filters.push(`<select class="filter-select" data-filter="owner"><option value="">All owners</option>${memberOpts}</select>`);
    }
    if (priorityField && priorityField.options) {
      const opts = priorityField.options.map((o) => `<option value="${e(o)}">${e(o)}</option>`).join("");
      filters.push(`<select class="filter-select" data-filter="priority"><option value="">All priority</option>${opts}</select>`);
    }
    if (filters.length > 0) {
      filterBar = `<div class="filter-bar" data-schema="${e(schemaId)}">${filters.join("")}</div>`;
    }
  }

  let content: string;
  if (viewType === "table") {
    content = filterBar + renderTableView(records, schema, team, collections);
  } else if (viewType === "cards") {
    content = renderCardsView(records, schema, team, collections);
  } else if (viewType === "diagram") {
    content = renderDiagramView(records, schema, team, collections);
  } else if (viewType === "timeline") {
    content = renderTimelineView(records, schema, team, collections);
  } else {
    content = renderListView(records, schema, team, collections);
  }

  return `${header}${content}`;
}

function renderOverview(
  state: State,
  config: Config,
  team: Team,
  schemas: Schemas,
  collections: Record<string, Record<string, unknown>[]>,
): string {
  const summary = state.summary ?? { cycleDay: 0, phase: "unknown", stats: {}, currentFocus: [], nextUp: [] };
  const project = config.project ?? { name: "Project", startDate: "", endDate: "", currentPhase: "" };
  const perPerson = state.perPerson ?? {};
  const overviewConfig = config.overview ?? { stats: [], sections: [], perPerson: {} };
  const portfolioConfig = config.portfolio ?? { schema: "", currentFocus: [], nextUp: [] };

  const phase = summary.phase ?? "unknown";
  const cycleDay = summary.cycleDay ?? 0;

  // Config-driven stats
  const stats = summary.stats ?? {};
  let statsHtml = '<div class="stats-grid">';
  for (const statDef of overviewConfig.stats ?? []) {
    const label = statDef.label ?? "";
    const count = stats[label] ?? 0;
    statsHtml += `<div class="stat"><div class="stat-num">${count}</div><div class="stat-label">${e(label)}</div></div>`;
  }
  statsHtml += "</div>";

  // Config-driven sections
  let sectionsHtml = "";
  for (const section of overviewConfig.sections ?? []) {
    const secType = section.type;
    const secTitle = section.title ?? "";

    if (secType === "focus") {
      const focusIds = portfolioConfig.currentFocus ?? [];
      const portfolioSchema = portfolioConfig.schema ?? "opportunity";
      const focusRecords = (collections[portfolioSchema] ?? []).filter((r) =>
        focusIds.includes(String(r._id)),
      );
      let focusHtml = "";
      for (const opp of focusRecords) {
        focusHtml += `<div class="focus-card"><strong>${e((opp as Record<string, unknown>).title ?? "")}</strong><br>${statusBadge(String((opp as Record<string, unknown>).status ?? "backlog"))}</div>`;
      }
      sectionsHtml += `<h3>${e(secTitle)}</h3><div class="focus-grid">${focusHtml || "<p class='empty'>No focus set</p>"}</div>`;
    } else if (secType === "team") {
      let teamHtml = "";
      const perPersonConfig = overviewConfig.perPerson ?? {};
      for (const member of team.members ?? []) {
        const mid = member.id;
        const pp = (perPerson[mid] ?? {}) as Record<string, unknown>;
        const roleDef = (team.roles ?? {})[member.role];
        const roleLabel = roleDef?.label ?? member.role;
        const parts: string[] = [];
        for (const [aggKey, _aggDef] of Object.entries(perPersonConfig)) {
          const items = pp[aggKey] as unknown[] | undefined;
          const count = items ? items.length : 0;
          const label = aggKey.replace(/_/g, " ");
          if (aggKey.toLowerCase().includes("blocker")) {
            if (count) {
              parts.push(`<span style="color:#dc2626">${count} ${label}</span>`);
            }
          } else {
            parts.push(`${count} ${label}`);
          }
        }
        const summaryText = parts.length ? parts.join(", ") : "No assignments";
        teamHtml += `<div class="team-card">
                    <div class="team-name">${e(member.name)}</div>
                    <div class="team-role">${e(roleLabel)}</div>
                    <div class="team-stats">${summaryText}</div>
                </div>`;
      }
      sectionsHtml += `<h3>${e(secTitle)}</h3><div class="team-grid">${teamHtml}</div>`;
    }
  }

  return `
        <div class="overview-header">
            <h2>${e(project.name ?? "Project")}</h2>
            <div class="overview-meta">Day ${cycleDay} &middot; Phase: ${statusBadge(phase)} &middot; ${state._eventCount ?? 0} events tracked</div>
        </div>
        ${statsHtml}
        ${sectionsHtml}
    `;
}

function mdInline(text: string): string {
  let s = htmlEscape(text);
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/`(.+?)`/g, "<code>$1</code>");
  s = s.replace(/_(.+?)_/g, "<em>$1</em>");
  return s;
}

function loadGuides(): Record<string, { title: string; content: string }> {
  const raw = loadJson<Record<string, Guide>>(BASE_DIR, "guides.json");
  const guides: Record<string, { title: string; content: string }> = {};
  for (const [pageId, guide] of Object.entries(raw)) {
    let content = "";
    for (const section of guide.sections ?? []) {
      if (section.heading) {
        content += `<h4>${e(section.heading)}</h4>`;
      }
      if (section.body) {
        content += `<p>${mdInline(section.body)}</p>`;
      }
      if (section.items) {
        const itemsHtml = section.items
          .map((item) => `<li>${mdInline(item)}</li>`)
          .join("");
        content += `<ul>${itemsHtml}</ul>`;
      }
    }
    guides[pageId] = { title: guide.title ?? pageId, content };
  }
  return guides;
}

function getSchemaGuide(
  schemaId: string,
  schema: SchemaDef,
): { title: string; content: string } {
  let fieldsList = "";
  for (const f of schema.fields ?? []) {
    const req = f.required ? " (required)" : "";
    const ai = f.aiInstruction
      ? ` -- <em>${e(f.aiInstruction)}</em>`
      : "";
    fieldsList += `<li><strong>${e(f.name)}</strong> <code>${e(f.type)}</code>${req}${ai}</li>`;
  }

  const view: DashboardView = schema.dashboardView ?? { type: "table" };
  const viewType = view.type ?? "table";

  return {
    title: `${e(schema.name)} Guide`,
    content: `<p>The <strong>${e(schema.name)}</strong> tab shows all ${e(schema.name.toLowerCase())} records tracked by the team.</p>
<h4>What is a ${e(schema.name)}?</h4>
<p>${e(schema.description ?? "A data structure tracked by the console.")}</p>
<h4>Fields</h4>
<ul>${fieldsList}</ul>
<h4>How records are created</h4>
<ul>
<li>Tell Marty (or any Claude Code session in this repo) what happened -- it appends event files following the schema's field definitions and AI instructions.</li>
<li>Events are written to <code>events/</code> and state is recomputed by <code>npm run rebuild</code>.</li>
</ul>
<h4>Dashboard view</h4>
<p>This tab renders as a <strong>${e(viewType)}</strong> view${view.groupBy ? `, grouped by <strong>${e(view.groupBy)}</strong>` : ""}${view.sortBy ? `, sorted by <strong>${e(view.sortBy)}</strong>` : ""}. You can change this in the Schema Editor tab.</p>`,
  };
}

function renderGuideButton(guideId: string): string {
  return `<button class="guide-btn" data-guide="${e(guideId)}" title="Guide">? Guide</button>`;
}

function renderSchemaEditor(_schemas: Schemas): string {
  return '<div id="schema-editor-root"></div>';
}

function parseActivityLog(): LedgerEntry[] {
  const logPath = join(BASE_DIR, "activity_log.md");
  if (!existsSync(logPath)) return [];
  const entries: LedgerEntry[] = [];
  const pattern = /^- (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) \[(.+?)\] (.+)$/;
  const content = readFileSync(logPath, "utf-8");
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    const m = pattern.exec(line);
    if (m) {
      entries.push({ ts: m[1], author: m[2], action: m[3] });
    }
  }
  return entries;
}

// ---- Main HTML generation ----

function generateHtml(
  config: Config,
  team: Team,
  metrics: Metrics,
  schemas: Schemas,
  state: State,
): string {
  const collections = (state.collections ?? {}) as Record<string, Record<string, unknown>[]>;
  const schemaList = (schemas.schemas ?? {}) as globalThis.Record<string, SchemaDef>;

  // Build sidebar navigation with categories
  const navItems: string[] = [];
  navItems.push('<div class="nav-category">Project</div>');
  navItems.push(
    '<button class="nav-btn active" data-tab="overview">Overview</button>',
  );
  for (const [sid, schema] of Object.entries(schemaList)) {
    const count = (collections[sid] ?? []).length;
    navItems.push(
      `<button class="nav-btn" data-tab="${e(sid)}">${e(schema.name)} <span class="nav-count">${count}</span></button>`,
    );
  }
  navItems.push('<div class="nav-category">Config</div>');
  navItems.push(
    '<button class="nav-btn" data-tab="identity">My Identity</button>',
  );
  navItems.push(
    '<button class="nav-btn" data-tab="connections">Sources</button>',
  );
  navItems.push(
    '<button class="nav-btn" data-tab="schemas">Schemas</button>',
  );

  // Build guide data
  const allGuides: globalThis.Record<string, { title: string; content: string }> =
    loadGuides();
  for (const [sid, schema] of Object.entries(schemaList)) {
    allGuides[sid] = getSchemaGuide(sid, schema as SchemaDef);
  }

  // Sync guide
  allGuides["sync"] = {
    title: "What does Sync do?",
    content: `<p>The <strong>Sync</strong> button rebuilds the console from its inputs: it re-reads the event files, config, and schemas, recomputes state, and refreshes the page.</p>
<h4>When should I sync?</h4>
<ul>
<li><strong>After Marty writes events</strong> -- if a Claude Code session added records, sync to see them.</li>
<li><strong>After editing config</strong> -- schemas.json, team.json, or the markdown source registries.</li>
</ul>
<p>Click <strong>Ledger</strong> next to the Sync button to see the append-only history of every recorded change.</p>`,
  };

  // Build tab content with guide buttons
  const overviewGuide = renderGuideButton("overview");
  const tabContent: string[] = [];
  tabContent.push(
    `<div class="tab-panel active" id="tab-overview"><div class="tab-header">${overviewGuide}</div>${renderOverview(state, config, team, schemas, collections)}</div>`,
  );
  for (const [sid, schema] of Object.entries(schemaList)) {
    const guideBtn = renderGuideButton(sid);
    const extraContent = "";
    const statusField = (schema.fields ?? []).find((f: SchemaField) => f.id === "status");
    const terminalStatuses = (statusField?.options ?? []).filter((o: string) => ["done", "complete", "resolved"].includes(o));
    const hideDoneBtn = terminalStatuses.length > 0
      ? `<button class="hide-done-btn" title="Hide completed items">Hide done</button>`
      : "";
    tabContent.push(
      `<div class="tab-panel" id="tab-${e(sid)}"><div class="tab-header">${hideDoneBtn}${guideBtn}</div>${extraContent}${renderSchemaTab(sid, schema, collections, team, config)}</div>`,
    );
  }
  tabContent.push(
    '<div class="tab-panel" id="tab-identity"><div id="identity-root"></div></div>',
  );
  const connectionsGuide = renderGuideButton("connections");
  tabContent.push(
    `<div class="tab-panel" id="tab-connections"><div class="tab-header">${connectionsGuide}</div><div id="connections-root"></div></div>`,
  );
  const schemasGuide = renderGuideButton("schemas");
  tabContent.push(
    `<div class="tab-panel" id="tab-schemas"><div class="tab-header">${schemasGuide}</div>${renderSchemaEditor(schemas)}</div>`,
  );

  const projectName =
    config.project?.name ?? "Project Dashboard";

  // Load project icon if present
  const iconPath = join(BASE_DIR, "icon.svg");
  let iconDataUri = "";
  if (existsSync(iconPath)) {
    const iconSvg = readFileSync(iconPath);
    iconDataUri = `data:image/svg+xml;base64,${iconSvg.toString("base64")}`;
  }

  const now = new Date();
  const generatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // Parse activity log for the ledger
  const ledgerEntries = parseActivityLog();
  const ledgerEntriesJs = JSON.stringify(ledgerEntries);
  const ledgerCount = ledgerEntries.length;

  // Schema editor: CSS and JS with embedded data
  const editorCss = getEditorCss();
  const connectionsCss = getConnectionsCss();
  const schemasJs = JSON.stringify(schemas);
  const teamJs = JSON.stringify([
    ...(team.members ?? []),
    ...(team.stakeholders ?? []),
  ]);
  const recordsCountJs = JSON.stringify(
    Object.fromEntries(
      Object.keys(schemaList).map((sid) => [
        sid,
        (collections[sid] ?? []).length,
      ]),
    ),
  );
  const guidesJs = JSON.stringify(allGuides);
  const overviewJs = JSON.stringify(config.overview ?? {});
  const portfolioJs = JSON.stringify(config.portfolio ?? {});
  const editorJs = getEditorJs(
    schemasJs,
    teamJs,
    recordsCountJs,
    overviewJs,
    portfolioJs,
  );

  // Sources view: read-only, parsed from Marty's markdown registries
  const sourceGroups = parseAllSources(join(BASE_DIR, ".."));
  const connectionsJs = getConnectionsJs(JSON.stringify(sourceGroups));

  // Records editor: CSS and JS with embedded data
  const recordsEditorCss = getRecordsEditorCss();
  const allRecordsJs = JSON.stringify(collections);
  const maxSequenceJs = JSON.stringify(state._maxSequence ?? {});
  const recordsEditorJsCode = getRecordsEditorJs(
    schemasJs,
    allRecordsJs,
    teamJs,
    maxSequenceJs,
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${e(projectName)}</title>${iconDataUri ? `\n<link rel="icon" type="image/svg+xml" href="${iconDataUri}">` : ""}
<style>
:root {
    --bg: #0f172a; --surface: #1e293b; --surface2: #334155;
    --text: #f1f5f9; --text2: #94a3b8; --accent: #3b82f6;
    --green: #16a34a; --red: #dc2626; --orange: #ea580c; --yellow: #ca8a04;
    --radius: 8px; --gap: 16px;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { height: 100%; overflow: hidden; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); line-height: 1.5; display: flex; flex-direction: column; }

/* Top bar */
.top-bar { display: flex; justify-content: flex-end; align-items: center; gap: 12px; padding: 8px 20px; background: var(--surface); border-bottom: 1px solid var(--surface2); flex-shrink: 0; }
.sync-area { display: flex; align-items: center; gap: 10px; }
.sync-timestamp { color: var(--text2); font-size: 11px; }
.sync-btn { display: flex; align-items: center; gap: 6px; background: var(--accent); color: white; border: none; padding: 6px 16px; border-radius: var(--radius); cursor: pointer; font-size: 12px; font-weight: 600; font-family: inherit; transition: all 0.15s; }
.sync-btn:hover { background: #2563eb; }
.sync-btn:disabled { opacity: 0.6; cursor: wait; }
.sync-btn .sync-icon { display: inline-block; transition: transform 0.3s; }
.sync-btn.syncing .sync-icon { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.sync-error { color: var(--red); font-size: 11px; max-width: 400px; text-align: right; }
.sync-help-btn { background: var(--surface2); border: 1px solid var(--surface2); color: var(--text2); width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 12px; font-weight: 700; font-family: inherit; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.sync-help-btn:hover { background: var(--accent); color: white; border-color: var(--accent); }
.ledger-btn { background: var(--surface2); border: 1px solid var(--surface2); color: var(--text2); padding: 5px 12px; border-radius: var(--radius); cursor: pointer; font-size: 12px; font-family: inherit; transition: all 0.15s; display: flex; align-items: center; gap: 5px; }
.ledger-btn:hover { background: var(--surface2); color: var(--text); border-color: var(--accent); }
.ledger-btn.active { border-color: var(--accent); color: var(--text); }
.ledger-panel { display: none; position: fixed; top: 40px; right: 0; width: 520px; max-height: 70vh; background: var(--surface); border: 1px solid var(--surface2); border-top: none; border-radius: 0 0 0 var(--radius); box-shadow: 0 8px 32px rgba(0,0,0,0.4); z-index: 900; overflow: hidden; flex-direction: column; }
.ledger-panel.open { display: flex; }
.ledger-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--surface2); }
.ledger-header h3 { font-size: 14px; font-weight: 600; }
.ledger-close { background: none; border: none; color: var(--text2); font-size: 16px; cursor: pointer; padding: 2px 6px; border-radius: 4px; }
.ledger-close:hover { background: var(--surface2); color: var(--text); }
.ledger-body { overflow-y: auto; flex: 1; }
.ledger-entry { display: grid; grid-template-columns: 110px 100px 1fr; gap: 8px; padding: 8px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 12px; align-items: baseline; }
.ledger-entry:hover { background: rgba(255,255,255,0.02); }
.ledger-ts { color: var(--text2); font-variant-numeric: tabular-nums; white-space: nowrap; }
.ledger-author { color: var(--accent); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ledger-action { color: var(--text); }
.ledger-empty { padding: 32px 16px; text-align: center; color: var(--text2); font-size: 13px; }
.ledger-count { font-size: 11px; background: rgba(255,255,255,0.1); padding: 1px 6px; border-radius: 10px; }

/* App layout: sidebar + content */
.app { display: grid; grid-template-columns: 220px 1fr; flex: 1; overflow: hidden; }
.sidebar { background: var(--surface); border-right: 1px solid var(--surface2); padding: 20px 0; overflow-y: auto; display: flex; flex-direction: column; }
.sidebar-header { padding: 0 16px 16px; border-bottom: 1px solid var(--surface2); }
.sidebar-header h1 { font-size: 15px; font-weight: 600; line-height: 1.3; }
.sidebar-header .meta { color: var(--text2); font-size: 11px; margin-top: 4px; }
.sidebar-nav { padding: 12px 8px; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.nav-category { font-size: 13px; font-weight: 700; letter-spacing: 0.3px; color: var(--text); padding: 16px 12px 6px; }
.nav-category:first-child { padding-top: 4px; }
.nav-btn { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 7px 12px; background: transparent; border: none; border-radius: 6px; color: var(--text2); font-size: 12px; cursor: pointer; text-align: left; font-family: inherit; transition: all 0.15s; }
.nav-btn:hover { background: var(--surface2); color: var(--text); }
.nav-btn.active { background: var(--accent); color: white; }
.nav-count { font-size: 11px; background: rgba(255,255,255,0.15); padding: 1px 6px; border-radius: 10px; }
.nav-btn.active .nav-count { background: rgba(255,255,255,0.25); }
.content { padding: 24px 32px; overflow-y: auto; height: 100%; }
.tab-panel { display: none; }
.tab-panel.active { display: block; }
h2 { font-size: 18px; margin-bottom: 12px; }
h3 { font-size: 15px; margin: 16px 0 8px; color: var(--text2); }
.count { color: var(--text2); font-weight: normal; font-size: 14px; }
.schema-desc { color: var(--text2); font-size: 13px; margin-bottom: 12px; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; color: white; text-transform: uppercase; }
.empty { color: var(--text2); font-style: italic; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--gap); margin-bottom: 24px; }
.stat { background: var(--surface); padding: 16px; border-radius: var(--radius); text-align: center; }
.stat-num { font-size: 28px; font-weight: 700; }
.stat-label { color: var(--text2); font-size: 12px; text-transform: uppercase; }

/* Overview */
.overview-header { margin-bottom: 20px; }
.overview-meta { color: var(--text2); font-size: 14px; margin-top: 4px; }
.focus-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--gap); margin-bottom: 20px; }
.focus-card { background: var(--surface); padding: 16px; border-radius: var(--radius); border-left: 3px solid var(--green); }
.team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--gap); }
.team-card { background: var(--surface); padding: 16px; border-radius: var(--radius); }
.team-name { font-weight: 600; }
.team-role { color: var(--text2); font-size: 13px; }
.team-stats { font-size: 13px; margin-top: 8px; }

/* Tables */
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { text-align: left; padding: 10px 12px; background: var(--surface); color: var(--text2); font-weight: 600; border-bottom: 1px solid var(--surface2); position: sticky; top: 0; z-index: 10; }
.data-table td { padding: 10px 12px; border-bottom: 1px solid var(--surface2); vertical-align: top; }
.data-table tr:hover td { background: var(--surface); }
.cell-clamp { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; max-width: 400px; }
.cell-clamp .rich-list { margin: 2px 0; }
.cell-clamp .rich-para { margin: 1px 0; }
.group-header { font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--accent); background: var(--bg) !important; padding: 12px 12px 6px !important; border-bottom: 1px solid var(--surface2); }
.group-header-row { cursor: pointer; }
.group-header-row:hover .group-header { color: var(--text); }
.group-chevron { display: inline-block; transition: transform 0.15s ease; font-size: 10px; }
.group-header-row.collapsed .group-chevron { transform: rotate(-90deg); }
tr.group-row-hidden { display: none; }
tr.has-detail { cursor: default; }
.detail-indicator { display: none; }

/* Cards */
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--gap); }
.card { background: var(--surface); padding: 16px; border-radius: var(--radius); border: 1px solid transparent; transition: border-color 0.15s; }
.card:hover { border-color: var(--surface2); }
.card-title { font-weight: 600; margin-bottom: 8px; font-size: 14px; }
.card-field { font-size: 13px; margin-bottom: 6px; }
.card-label { color: var(--text2); font-size: 12px; }
.card-details { margin-top: 8px; }
.card-expand { font-size: 11px; color: var(--accent); cursor: pointer; list-style: none; padding: 4px 0; user-select: none; }
.card-expand::-webkit-details-marker { display: none; }
.card-expand::before { content: '\\25B6'; margin-right: 5px; font-size: 8px; display: inline-block; transition: transform 0.15s; }
details[open] > .card-expand::before { transform: rotate(90deg); }
.card-section { margin-top: 10px; border-left: 2px solid var(--surface2); padding-left: 12px; }
.card-section-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text2); margin-bottom: 4px; }
.card-section-content { font-size: 13px; line-height: 1.6; }

/* List */
.list-view { display: flex; flex-direction: column; gap: 12px; }
.list-item { background: var(--surface); padding: 20px; border-radius: var(--radius); border: 1px solid transparent; transition: border-color 0.15s; }
.list-item:hover { border-color: var(--surface2); }
.list-title { font-weight: 600; font-size: 15px; margin-bottom: 4px; }
.list-meta { color: var(--text2); font-size: 12px; margin-bottom: 12px; }
.list-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.list-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; background: var(--bg); padding: 4px 10px; border-radius: 6px; }
.list-chip-label { color: var(--text2); font-weight: 500; }
.list-details { margin-top: 4px; }
.list-expand { font-size: 12px; color: var(--accent); cursor: pointer; padding: 6px 0; list-style: none; user-select: none; }
.list-expand::-webkit-details-marker { display: none; }
.list-expand::before { content: '\\25B6'; margin-right: 6px; font-size: 9px; display: inline-block; transition: transform 0.15s; }
details[open] > .list-expand::before { transform: rotate(90deg); }
.list-detail-body { padding-top: 12px; display: flex; flex-direction: column; gap: 16px; }
.list-section { border-left: 2px solid var(--surface2); padding-left: 14px; }
.list-section-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text2); margin-bottom: 6px; }
.list-section-content { font-size: 13px; line-height: 1.6; }

/* Rich text */
.rich-list { margin: 4px 0 4px 0; padding-left: 18px; list-style: disc; }
.rich-list li { margin-bottom: 4px; line-height: 1.5; }
.rich-list li strong { color: var(--text); }
.rich-para { margin: 2px 0; line-height: 1.6; }
.rich-para + .rich-list { margin-top: 6px; }
.rich-list + .rich-para { margin-top: 6px; }

/* Tab header with guide button */
.tab-header { display: flex; justify-content: flex-end; margin-bottom: 8px; }
.guide-btn { background: var(--surface); border: 1px solid var(--surface2); color: var(--text2); padding: 5px 12px; border-radius: var(--radius); cursor: pointer; font-size: 12px; transition: all 0.15s; }
.guide-btn:hover { background: var(--surface2); color: var(--text); border-color: var(--accent); }
.hide-done-btn { background: var(--surface); border: 1px solid var(--surface2); color: var(--text2); padding: 5px 12px; border-radius: var(--radius); cursor: pointer; font-size: 12px; transition: all 0.15s; margin-right: 6px; }
.hide-done-btn:hover { background: var(--surface2); color: var(--text); border-color: var(--accent); }
.hide-done-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
.data-table.hide-done tr[data-status="done"], .data-table.hide-done tr[data-status="complete"], .data-table.hide-done tr[data-status="resolved"] { display: none; }
.clickable-select { cursor: pointer; user-select: none; }
.clickable-select:hover .badge { filter: brightness(1.2); box-shadow: 0 0 0 2px rgba(255,255,255,0.2); }
.clickable-select .badge::after { content: ' \\25BE'; font-size: 9px; opacity: 0; transition: opacity 0.15s; }
.clickable-select:hover .badge::after { opacity: 0.7; }

/* Select popover dropdown */
.select-popover { position: fixed; z-index: 1100; background: var(--surface); border: 1px solid var(--surface2); border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.5); padding: 4px; min-width: 140px; }
.select-popover-option { display: block; width: 100%; padding: 6px 10px; border: none; background: transparent; color: var(--text); font-size: 12px; font-family: inherit; cursor: pointer; border-radius: 4px; text-align: left; transition: background 0.1s; }
.select-popover-option:hover { background: var(--surface2); }
.select-popover-option .badge { pointer-events: none; }
.select-popover-option.current { background: rgba(59,130,246,0.15); }

/* Save feedback flash */
@keyframes save-flash { 0% { box-shadow: 0 0 0 0 rgba(22,163,74,0.6); } 100% { box-shadow: 0 0 0 0 transparent; } }
.badge.save-ok { animation: save-flash 0.6s ease-out; }

/* Filter bar */
.filter-bar { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.filter-select { background: var(--surface); border: 1px solid var(--surface2); color: var(--text); padding: 5px 10px; border-radius: 6px; font-size: 12px; font-family: inherit; cursor: pointer; min-width: 120px; }
.filter-select:focus { outline: none; border-color: var(--accent); }
.filter-select:not([data-active=""]) { }
.filter-active { border-color: var(--accent); background: rgba(59,130,246,0.1); }

/* Guide modal */
.guide-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.guide-modal { background: var(--surface); border-radius: 12px; padding: 28px; max-width: 640px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
.guide-modal h3 { margin-bottom: 16px; font-size: 18px; }
.guide-modal h4 { margin: 16px 0 8px; font-size: 14px; color: var(--accent); }
.guide-modal p { font-size: 13px; line-height: 1.6; margin-bottom: 8px; }
.guide-modal ul { font-size: 13px; line-height: 1.6; margin: 0 0 12px 20px; }
.guide-modal li { margin-bottom: 4px; }
.guide-modal code { background: var(--bg); padding: 1px 5px; border-radius: 3px; font-size: 12px; }
.guide-modal pre { background: var(--bg); padding: 10px 14px; border-radius: 6px; font-size: 12px; overflow-x: auto; margin: 8px 0; }
.guide-modal em { color: var(--text2); }
.guide-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text2); font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
.guide-close:hover { background: var(--surface2); color: var(--text); }

/* Diagrams */
.diagram-grid { display: flex; flex-direction: column; gap: 20px; }
.diagram-card { background: var(--surface); padding: 20px; border-radius: var(--radius); }
.diagram-header { margin-bottom: 8px; }
.diagram-title { font-weight: 600; font-size: 15px; }
.diagram-desc { color: var(--text2); font-size: 13px; margin-bottom: 12px; }
.diagram-content { background: var(--bg); border-radius: var(--radius); padding: 16px; overflow-x: auto; }
.diagram-content .mermaid { display: flex; justify-content: center; }
.diagram-content .mermaid svg { max-width: 100%; height: auto; }

/* Schema editor -- interactive (CSS from schema_editor_ui) */

@media (max-width: 768px) {
    .app { grid-template-columns: 1fr; }
    .sidebar { position: static; height: auto; overflow-y: visible; border-right: none; border-bottom: 1px solid var(--surface2); flex-shrink: 0; }
    .sidebar-nav { flex-direction: row; overflow-x: auto; flex-wrap: nowrap; padding: 8px; }
    .nav-category { display: none; }
    .nav-btn { white-space: nowrap; flex-shrink: 0; }
    .content { padding: 16px; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .team-grid { grid-template-columns: 1fr; }
    .top-bar { padding: 6px 12px; }
    .sync-timestamp { display: none; }
    .ledger-panel { width: 100%; border-radius: 0; }
    .ledger-entry { grid-template-columns: 90px 70px 1fr; gap: 6px; padding: 6px 12px; font-size: 11px; }
}
${editorCss}
${connectionsCss}
${recordsEditorCss}
</style>
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<script>
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
        primaryColor: '#334155',
        primaryTextColor: '#f1f5f9',
        primaryBorderColor: '#3b82f6',
        lineColor: '#94a3b8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        background: '#0f172a',
        mainBkg: '#334155',
        nodeBorder: '#3b82f6',
        clusterBkg: '#1e293b',
        clusterBorder: '#334155',
        titleColor: '#f1f5f9',
        edgeLabelBackground: '#1e293b'
    }
});
</script>
</head>
<body>
<div class="top-bar">
    <div class="sync-area">
        <span id="sync-error" class="sync-error"></span>
        <span id="sync-timestamp" class="sync-timestamp">Last synced: ${generatedAt}</span>
        <button class="ledger-btn" id="ledger-toggle" onclick="toggleLedger()">
            &#x1D4DB; Ledger <span class="ledger-count">${ledgerCount}</span>
        </button>
        <button class="sync-help-btn" data-guide="sync" title="What does Sync do?">?</button>
        <button id="sync-btn" class="sync-btn" onclick="doSync()">
            <span class="sync-icon">&#x21BB;</span> Sync
        </button>
    </div>
</div>
<div class="ledger-panel" id="ledger-panel">
    <div class="ledger-header">
        <h3>Change Ledger</h3>
        <button class="ledger-close" onclick="toggleLedger()">&times;</button>
    </div>
    <div class="ledger-body" id="ledger-body"></div>
</div>
<div class="app">
    <nav class="sidebar">
        <div class="sidebar-header">
            <h1>${iconDataUri ? `<img src="${iconDataUri}" alt="" style="width:20px;height:20px;vertical-align:middle;margin-right:6px;filter:invert(1);">` : ""}${e(projectName)}</h1>
            <div class="meta">Generated ${generatedAt}</div>
        </div>
        <div class="sidebar-nav">
            ${navItems.join("")}
        </div>
    </nav>
    <main class="content">
        ${tabContent.join("")}
    </main>
</div>
<script>
async function renderMermaidIn(panel) {
    const els = panel.querySelectorAll('.mermaid:not([data-processed])');
    for (const el of els) {
        el.setAttribute('data-processed', 'true');
        const code = el.textContent;
        const id = 'mermaid-' + Math.random().toString(36).slice(2, 9);
        try {
            const { svg } = await mermaid.render(id, code);
            el.innerHTML = svg;
        } catch (err) {
            el.innerHTML = '<pre style="color:#dc2626">Diagram error: ' + err.message + '</pre>';
        }
    }
}
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.getElementById('tab-' + btn.dataset.tab);
        panel.classList.add('active');
        renderMermaidIn(panel);
        try { localStorage.setItem('dashboard_active_tab', btn.dataset.tab); } catch(e) {}
    });
});
// Restore last active tab on load
try {
    var savedTab = localStorage.getItem('dashboard_active_tab');
    if (savedTab) {
        var savedBtn = document.querySelector('.nav-btn[data-tab="' + savedTab + '"]');
        if (savedBtn) savedBtn.click();
    }
} catch(e) {}
// Keyboard shortcuts: 1-9 for nav items
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) {
        const btns = document.querySelectorAll('.nav-btn');
        if (btns[num - 1]) btns[num - 1].click();
    }
});
// Group collapse/expand
document.querySelectorAll('.group-header-row').forEach(row => {
    row.addEventListener('click', () => {
        const gid = row.dataset.group;
        const collapsed = row.classList.toggle('collapsed');
        document.querySelectorAll('tr[data-group-body="' + gid + '"]').forEach(r => {
            r.classList.toggle('group-row-hidden', collapsed);
        });
    });
});
// Hide done toggle
document.querySelectorAll('.hide-done-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const panel = btn.closest('.tab-panel');
        const table = panel ? panel.querySelector('.data-table') : null;
        if (table) table.classList.toggle('hide-done');
        btn.textContent = btn.classList.contains('active') ? 'Show done' : 'Hide done';
    });
});
// Default hide-done on task tab
(function() {
    const taskBtn = document.querySelector('#tab-task .hide-done-btn');
    if (taskBtn) taskBtn.click();
})();
// Filter bar logic
(function() {
    function applyFilters(bar) {
        const schema = bar.dataset.schema;
        const panel = bar.closest('.tab-panel');
        if (!panel) return;
        const selects = bar.querySelectorAll('.filter-select');
        const filters = {};
        selects.forEach(sel => {
            const attr = sel.dataset.filter;
            const val = sel.value;
            filters[attr] = val;
            sel.classList.toggle('filter-active', !!val);
        });
        const rows = panel.querySelectorAll('tr[data-record-id]');
        rows.forEach(row => {
            let show = true;
            for (const [attr, val] of Object.entries(filters)) {
                if (val && row.dataset[attr] !== val) { show = false; break; }
            }
            row.style.display = show ? '' : 'none';
        });
        // Save to localStorage
        try { localStorage.setItem('filters_' + schema, JSON.stringify(filters)); } catch(e) {}
    }
    document.querySelectorAll('.filter-bar').forEach(bar => {
        // Restore saved filters
        const schema = bar.dataset.schema;
        try {
            const saved = JSON.parse(localStorage.getItem('filters_' + schema) || '{}');
            bar.querySelectorAll('.filter-select').forEach(sel => {
                if (saved[sel.dataset.filter]) sel.value = saved[sel.dataset.filter];
            });
        } catch(e) {}
        // Apply on load
        applyFilters(bar);
        // Listen for changes
        bar.addEventListener('change', () => applyFilters(bar));
    });
})();
// Inline select fields — dropdown popover
const STATUS_COLORS = ${JSON.stringify({
  not_started: "#6b7280", in_progress: "#2563eb", blocked: "#dc2626", done: "#16a34a",
  open: "#dc2626", resolved: "#16a34a", active: "#2563eb", backlog: "#6b7280",
  critical: "#dc2626", high: "#ea580c", medium: "#ca8a04", low: "#6b7280",
  P0: "#dc2626", P1: "#ea580c", P2: "#ca8a04", P3: "#6b7280",
  nominated: "#6b7280", validated: "#2563eb", inactive: "#6b7280",
  upcoming: "#6b7280", complete: "#16a34a", at_risk: "#ea580c", missed: "#dc2626",
  identified: "#ca8a04", mitigating: "#2563eb", accepted: "#6b7280",
  answered: "#16a34a", deferred: "#6b7280",
  raw: "#6b7280", developing: "#2563eb", ready_to_execute: "#16a34a", parked: "#ca8a04", promoted: "#6b7280",
  reviewed: "#16a34a",
})};
function closeSelectPopover() {
    const existing = document.querySelector('.select-popover');
    if (existing) existing.remove();
}
function openSelectPopover(targetEl, recordId, fieldId, options, schemaId) {
    closeSelectPopover();
    const badge = targetEl.querySelector('.badge');
    if (!badge) return;
    const current = badge.textContent.trim().replace(/\\s*\\u25BE$/, '');
    const rect = badge.getBoundingClientRect();

    const pop = document.createElement('div');
    pop.className = 'select-popover';
    pop.style.top = (rect.bottom + 4) + 'px';
    pop.style.left = rect.left + 'px';

    for (const opt of options) {
        const btn = document.createElement('button');
        btn.className = 'select-popover-option' + (opt === current ? ' current' : '');
        btn.innerHTML = '<span class="badge" style="background:' + (STATUS_COLORS[opt] || '#6b7280') + '">' + opt + '</span>';
        btn.onclick = (ev) => {
            ev.stopPropagation();
            closeSelectPopover();
            if (opt === current) return;
            // Optimistic update
            badge.textContent = opt;
            badge.style.background = STATUS_COLORS[opt] || '#6b7280';
            const row = targetEl.closest('tr');
            if (row && fieldId === 'status') row.dataset.status = opt;
            // Save
            fetch('/api/save-record', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ schema: schemaId, action: 'update', recordId, data: { [fieldId]: opt }, author: 'dashboard' })
            }).then(r => r.json()).then(res => {
                if (res.ok) { badge.classList.add('save-ok'); setTimeout(() => badge.classList.remove('save-ok'), 700); }
                else { badge.textContent = current; badge.style.background = STATUS_COLORS[current] || '#6b7280'; syncToast('Save failed', true); }
            }).catch(() => {
                badge.textContent = current;
                badge.style.background = STATUS_COLORS[current] || '#6b7280';
                if (row && fieldId === 'status') row.dataset.status = current;
                syncToast('Save failed', true);
            });
        };
        pop.appendChild(btn);
    }
    document.body.appendChild(pop);
    // Reposition if off-screen
    const popRect = pop.getBoundingClientRect();
    if (popRect.bottom > window.innerHeight) pop.style.top = (rect.top - popRect.height - 4) + 'px';
    if (popRect.right > window.innerWidth) pop.style.left = (window.innerWidth - popRect.width - 8) + 'px';
}
document.addEventListener('click', (ev) => {
    const el = ev.target.closest('.clickable-select');
    if (!el) { closeSelectPopover(); return; }
    ev.stopPropagation();
    const recordId = el.dataset.recordId;
    const fieldId = el.dataset.fieldId;
    const options = el.dataset.options.split(',');
    const panel = el.closest('.tab-panel');
    const schemaId = panel ? panel.id.replace('tab-', '') : '';
    if (!recordId || !fieldId) return;
    openSelectPopover(el, recordId, fieldId, options, schemaId);
});
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeSelectPopover(); });
// Guide system
const GUIDES = ${guidesJs};
document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-guide]');
    if (!btn) return;
    const id = btn.dataset.guide;
    const guide = GUIDES[id];
    if (!guide) return;
    const ov = document.createElement('div');
    ov.className = 'guide-overlay';
    ov.id = 'guide-overlay';
    ov.innerHTML = '<div class="guide-modal" style="position:relative">' +
        '<button class="guide-close" onclick="document.getElementById(\\'guide-overlay\\').remove()">&times;</button>' +
        '<h3>' + guide.title + '</h3>' + guide.content + '</div>';
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov);
});
document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
        const g = document.getElementById('guide-overlay');
        if (g) g.remove();
    }
});
// Ledger
const LEDGER_ENTRIES = ${ledgerEntriesJs};
(function renderLedger() {
    const body = document.getElementById('ledger-body');
    if (!LEDGER_ENTRIES.length) {
        body.innerHTML = '<div class="ledger-empty">No changes recorded yet. Changes appear here as the team adds tasks, decisions, blockers, and more.</div>';
        return;
    }
    // Most recent first
    const reversed = [...LEDGER_ENTRIES].reverse();
    body.innerHTML = reversed.map(e =>
        '<div class="ledger-entry">' +
        '<span class="ledger-ts">' + e.ts + '</span>' +
        '<span class="ledger-author">' + e.author + '</span>' +
        '<span class="ledger-action">' + e.action + '</span>' +
        '</div>'
    ).join('');
})();
function toggleLedger() {
    const panel = document.getElementById('ledger-panel');
    const btn = document.getElementById('ledger-toggle');
    const isOpen = panel.classList.toggle('open');
    btn.classList.toggle('active', isOpen);
}
// Close ledger on outside click
document.addEventListener('click', (ev) => {
    const panel = document.getElementById('ledger-panel');
    const btn = document.getElementById('ledger-toggle');
    if (panel.classList.contains('open') && !panel.contains(ev.target) && !btn.contains(ev.target)) {
        panel.classList.remove('open');
        btn.classList.remove('active');
    }
});
// Close ledger on Escape
document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
        const panel = document.getElementById('ledger-panel');
        if (panel.classList.contains('open')) {
            panel.classList.remove('open');
            document.getElementById('ledger-toggle').classList.remove('active');
        }
    }
});

// Sync toast helper
function syncToast(msg, isError) {
    const t = document.createElement('div');
    t.className = 'se-toast';
    if (isError) t.style.background = 'var(--red)';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// Sync button
async function doSync() {
    const btn = document.getElementById('sync-btn');
    const ts = document.getElementById('sync-timestamp');
    const err = document.getElementById('sync-error');
    btn.disabled = true;
    btn.classList.add('syncing');
    err.textContent = '';
    try {
        const resp = await fetch('/api/sync', { method: 'POST' });
        const data = await resp.json();
        if (data.ok) {
            ts.textContent = 'Last synced: ' + data.syncedAt;
            if (!data.steps || data.steps.length === 0) {
                syncToast('Already up to date');
            } else {
                syncToast('Synced');
                setTimeout(() => window.location.reload(), 600);
            }
        } else {
            syncToast(data.error || 'Sync failed', true);
        }
    } catch (e) {
        syncToast('Could not reach server', true);
    } finally {
        btn.disabled = false;
        btn.classList.remove('syncing');
    }
}
${editorJs}
${connectionsJs}
${recordsEditorJsCode}
</script>
</body>
</html>`;
}

// ---- Entry point ----

function main(): void {
  const config = loadJson<Config>(BASE_DIR, "config.json");
  const team = loadJson<Team>(BASE_DIR, "team.json");
  const metrics = loadJson<Metrics>(BASE_DIR, "metrics.json");
  const schemas = loadJson<Schemas>(BASE_DIR, "schemas.json");
  const state = loadJson<State>(BASE_DIR, "cycle_state.json");

  const htmlContent = generateHtml(config, team, metrics, schemas, state);

  const outputPath = join(BASE_DIR, "dashboard.html");
  writeFileSync(outputPath, htmlContent, "utf-8");

  console.log(`Dashboard generated: ${outputPath}`);
}

main();

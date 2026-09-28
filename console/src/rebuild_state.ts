#!/usr/bin/env tsx
/**
 * rebuild_state.ts — Schema-driven state builder for the console.
 *
 * Reads: schemas.json, config.json, team.json, metrics.json, events/*
 * Writes: cycle_state.json (computed state), activity_log.md (timeline)
 *
 * Run this before reading state (ensures fresh) and after writing events.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type {
  Config,
  Team,
  Schemas,
  State,
  Event,
  EventFile,
  Record,
  EditHistoryEntry,
  PerPersonAggDef,
  PerPersonEntry,
  Summary,
  Metrics,
} from "./types.js";
import { loadJson } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const BASE_DIR = dirname(join(__filename, ".."));
const EVENTS_DIR = join(BASE_DIR, "events");

const warnings: string[] = [];

function warn(msg: string): void {
  warnings.push(msg);
  process.stderr.write(`  WARN: ${msg}\n`);
}

function loadEvents(): Event[] {
  /** Load all event files, then sort by timestamp for correct ordering. */
  let eventFiles: string[];
  try {
    eventFiles = readdirSync(EVENTS_DIR)
      .filter((f) => f.endsWith(".json"))
      .sort()
      .map((f) => join(EVENTS_DIR, f));
  } catch {
    // events directory may not exist yet
    return [];
  }

  const allEvents: Event[] = [];

  for (const filepath of eventFiles) {
    let data: EventFile;
    try {
      data = JSON.parse(readFileSync(filepath, "utf-8")) as EventFile;
    } catch (e) {
      warn(
        `Skipping malformed event file ${basename(filepath)}: ${e instanceof Error ? e.message : String(e)}`,
      );
      continue;
    }

    const events = data.events ?? [];
    for (const evt of events) {
      evt._sourceFile = basename(filepath);
    }
    allEvents.push(...events);
  }

  // Sort by timestamp for correct chronological ordering
  allEvents.sort((a, b) => (a.timestamp ?? "").localeCompare(b.timestamp ?? ""));
  return allEvents;
}

function validateEvent(evt: Event, schemas: Schemas, team: Team): boolean {
  /** Validate an event against schemas and team config. Returns true if valid. */
  const schema = evt.schema;
  const action = evt.action;
  const author = evt.author;
  const recordId = evt.recordId;
  const validSchemas = new Set(Object.keys(schemas.schemas ?? {}));
  const validActions = new Set(["create", "update", "delete"]);
  const memberIds = new Set<string>();

  for (const m of team.members ?? []) {
    memberIds.add(m.id);
  }
  for (const s of team.stakeholders ?? []) {
    if (s.id) memberIds.add(s.id);
  }

  if (!validSchemas.has(schema)) {
    warn(
      `Unknown schema '${schema}' in event ${recordId} from ${evt._sourceFile ?? "?"}`,
    );
    return false;
  }
  if (!validActions.has(action)) {
    warn(
      `Unknown action '${action}' in event ${recordId} from ${evt._sourceFile ?? "?"}`,
    );
    return false;
  }
  if (!recordId) {
    warn(
      `Missing recordId in ${action} ${schema} event from ${evt._sourceFile ?? "?"}`,
    );
    return false;
  }
  if (author && !memberIds.has(author)) {
    warn(
      `Unknown author '${author}' in event ${recordId} from ${evt._sourceFile ?? "?"}`,
    );
  }
  return true;
}

function buildCollections(
  events: Event[],
  schemas: Schemas,
  team: Team,
): [globalThis.Record<string, Record[]>, globalThis.Record<string, number>] {
  /** Apply events to build collections per schema. */
  const collections: globalThis.Record<
    string,
    globalThis.Record<string, Record>
  > = {};

  for (const schemaId of Object.keys(schemas.schemas ?? {})) {
    collections[schemaId] = {};
  }

  for (const evt of events) {
    if (!validateEvent(evt, schemas, team)) continue;

    const schema = evt.schema;
    const action = evt.action;
    const recordId = evt.recordId;
    // Strip underscore-prefixed keys from data to prevent metadata overwrites
    const data: globalThis.Record<string, unknown> = {};
    for (const [k, v] of Object.entries(evt.data ?? {})) {
      if (!k.startsWith("_")) {
        data[k] = v;
      }
    }

    if (action === "create") {
      if (collections[schema]?.[recordId]) {
        warn(
          `Duplicate recordId '${recordId}' in schema '${schema}' — overwriting`,
        );
      }
      collections[schema][recordId] = {
        ...data,
        _id: recordId,
        _createdAt: evt.timestamp,
        _createdBy: evt.author,
        _updatedAt: evt.timestamp,
        _updatedBy: evt.author,
      } as Record;
    } else if (action === "update") {
      if (!collections[schema]?.[recordId]) {
        warn(
          `Update for non-existent record '${recordId}' in schema '${schema}'`,
        );
      } else if (collections[schema][recordId]._deleted) {
        warn(
          `Update for deleted record '${recordId}' in schema '${schema}'`,
        );
      } else {
        // Capture previous values before overwriting (for conflict detection)
        const previousValues: globalThis.Record<string, unknown> = {};
        for (const k of Object.keys(data)) {
          if (k in collections[schema][recordId]) {
            previousValues[k] = collections[schema][recordId][k];
          }
        }
        if (!collections[schema][recordId]._editHistory) {
          collections[schema][recordId]._editHistory = [];
        }
        collections[schema][recordId]._editHistory!.push({
          author: evt.author,
          timestamp: evt.timestamp,
          previousValues,
          newFields: Object.keys(data),
          sourceFile: evt._sourceFile,
        } as EditHistoryEntry);

        Object.assign(collections[schema][recordId], data);
        collections[schema][recordId]._updatedAt = evt.timestamp;
        collections[schema][recordId]._updatedBy = evt.author;
      }
    } else if (action === "delete") {
      if (collections[schema]?.[recordId]) {
        collections[schema][recordId]._deleted = true;
        collections[schema][recordId]._deletedAt = evt.timestamp;
        collections[schema][recordId]._deletedBy = evt.author;
      }
    }
  }

  // Compute max sequence numbers per author per schema (before filtering deleted)
  const maxSequence: globalThis.Record<string, number> = {};
  for (const [schemaId, records] of Object.entries(collections)) {
    for (const recordId of Object.keys(records)) {
      const m = recordId.match(/_(\d+)(?:_\w+)?$/);
      if (m) {
        const seq = parseInt(m[1], 10);
        const parts = recordId.split("_");
        const author =
          parts.length > 2
            ? parts[parts.length - 1]
            : (records[recordId]._createdBy ?? "unknown");
        const key = `${schemaId}.${author}`;
        maxSequence[key] = Math.max(maxSequence[key] ?? 0, seq);
      }
    }
  }

  // Filter out deleted records and convert to arrays
  const result: globalThis.Record<string, Record[]> = {};
  for (const [schemaId, records] of Object.entries(collections)) {
    result[schemaId] = Object.values(records).filter((r) => !r._deleted);
  }
  return [result, maxSequence];
}

function matchFilter(
  record: Record,
  filterStr: string,
): boolean {
  /** Evaluate a simple filter like 'status!=done' or 'status=open' against a record. */
  if (filterStr.includes("!=")) {
    const [field, value] = filterStr.split("!=", 2);
    return record[field] !== value;
  } else if (filterStr.includes("=")) {
    const [field, value] = filterStr.split("=", 2);
    return record[field] === value;
  }
  return true;
}

function countRecords(
  collections: globalThis.Record<string, Record[]>,
  schemaName: string,
  countSpec: string,
): number {
  /** Count records in a schema collection based on a count spec. */
  const records = collections[schemaName] ?? [];
  if (countSpec === "all") {
    return records.length;
  }
  return records.filter((r) => matchFilter(r, countSpec)).length;
}

function buildPerPerson(
  collections: globalThis.Record<string, Record[]>,
  team: Team,
  config: Config,
): globalThis.Record<string, PerPersonEntry> {
  /** Build per-person view from config-driven aggregation rules. */
  const members = team.members ?? [];
  const perPersonConfig = config.overview?.perPerson ?? {};
  const perPerson: globalThis.Record<string, PerPersonEntry> = {};

  for (const member of members) {
    const mid = member.id;
    const entry: PerPersonEntry = {
      name: member.name,
      role: member.role,
    };

    for (const [aggKey, aggDef] of Object.entries(perPersonConfig) as [string, PerPersonAggDef][]) {
      const schemaName = aggDef.schema ?? "";
      const filterStr = aggDef.filter ?? "";
      const ownerField = aggDef.ownerField ?? "owner";
      const records = collections[schemaName] ?? [];
      const matched = records
        .filter(
          (r) =>
            r[ownerField] === mid && matchFilter(r, filterStr),
        )
        .map((r) => ({
          id: r._id,
          title: r.title as string | undefined ?? "",
          status: r.status as string | undefined ?? "",
          priority: r.priority as string | undefined ?? "",
        }));
      entry[aggKey] = matched;
    }

    perPerson[mid] = entry;
  }

  return perPerson;
}

function buildSummary(
  collections: globalThis.Record<string, Record[]>,
  config: Config,
): Summary {
  /** Build summary stats from config-driven stat definitions. */
  const overviewConfig = config.overview ?? ({} as Config["overview"]);
  const portfolioConfig = config.portfolio ?? ({} as Config["portfolio"]);

  const start = config.project?.startDate;
  let cycleDay = 0;
  if (start) {
    const startDate = new Date(start + "T00:00:00");
    const today = new Date();
    // Strip time to compare dates only
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const startDateOnly = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
    );
    cycleDay =
      Math.floor(
        (todayDate.getTime() - startDateOnly.getTime()) / 86_400_000,
      ) + 1;
  }

  // Compute stats from config
  const stats: globalThis.Record<string, number> = {};
  for (const statDef of overviewConfig.stats ?? []) {
    const label = statDef.label ?? "";
    const schemaName = statDef.schema ?? "";
    const countSpec = statDef.count ?? "all";
    stats[label] = countRecords(collections, schemaName, countSpec);
  }

  return {
    cycleDay,
    phase: config.project?.currentPhase ?? "unknown",
    stats,
    currentFocus: portfolioConfig.currentFocus ?? [],
    nextUp: portfolioConfig.nextUp ?? [],
  };
}

function generateActivityLog(events: Event[], team: Team): string {
  /** Generate human-readable activity log from events. */
  const memberNames: globalThis.Record<string, string> = {};
  for (const m of team.members ?? []) {
    memberNames[m.id] = m.name;
  }
  for (const s of team.stakeholders ?? []) {
    if (s.id) memberNames[s.id] = s.name;
  }

  const lines: string[] = ["# Activity Log — AI Adoption Playbook\n"];

  for (const evt of events) {
    const ts = evt.timestamp ?? "";
    const authorId = evt.author ?? "unknown";
    const author = memberNames[authorId] ?? authorId;
    const schema = evt.schema ?? "";
    const action = evt.action ?? "";
    const data = evt.data ?? {};
    const recordId = evt.recordId ?? "";

    let dateStr = "unknown";
    if (ts) {
      try {
        const dt = new Date(ts);
        if (!isNaN(dt.getTime())) {
          const yyyy = dt.getFullYear();
          const mm = String(dt.getMonth() + 1).padStart(2, "0");
          const dd = String(dt.getDate()).padStart(2, "0");
          const hh = String(dt.getHours()).padStart(2, "0");
          const min = String(dt.getMinutes()).padStart(2, "0");
          dateStr = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
        } else {
          dateStr = ts.slice(0, 16);
        }
      } catch {
        dateStr = ts.slice(0, 16);
      }
    }

    const title =
      (data.title as string) ?? (data.summary as string) ?? recordId;
    let desc: string;
    if (action === "create") {
      desc = `Created ${schema}: ${title}`;
    } else if (action === "update") {
      const changes = Object.entries(data)
        .filter(([k]) => !k.startsWith("_"))
        .map(([k, v]) => `${k}=${v}`)
        .join(", ");
      desc = changes
        ? `Updated ${schema} ${recordId}: ${changes}`
        : `Updated ${schema} ${recordId}`;
    } else if (action === "delete") {
      desc = `Deleted ${schema}: ${recordId}`;
    } else {
      desc = `${action} ${schema}: ${title}`;
    }

    lines.push(`- ${dateStr} [${author}] ${desc}`);
  }

  return lines.join("\n") + "\n";
}

function main(): void {
  const config = loadJson<Config>(BASE_DIR, "config.json");
  const team = loadJson<Team>(BASE_DIR, "team.json");
  const metrics = loadJson<Metrics>(BASE_DIR, "metrics.json");
  const schemas = loadJson<Schemas>(BASE_DIR, "schemas.json");

  const events = loadEvents();
  const [collections, maxSequence] = buildCollections(events, schemas, team);
  const perPerson = buildPerPerson(collections, team, config);
  const summary = buildSummary(collections, config);

  let gitHead = "";
  try {
    gitHead = execSync("git rev-parse HEAD", { cwd: BASE_DIR })
      .toString()
      .trim();
  } catch {
    gitHead = "unknown";
  }

  const state: State = {
    _schema: "marty/team-v1",
    _computedAt: new Date().toISOString(),
    _gitHead: gitHead,
    _eventCount: events.length,
    _maxSequence: maxSequence,
    _warnings: warnings,
    project: config.project ?? ({} as Config["project"]),
    summary,
    collections,
    metrics,
    perPerson,
  };

  writeFileSync(
    join(BASE_DIR, "cycle_state.json"),
    JSON.stringify(state, null, 2),
  );
  writeFileSync(
    join(BASE_DIR, "activity_log.md"),
    generateActivityLog(events, team),
  );

  const totalRecords = Object.values(collections).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );
  console.log(
    `State rebuilt: ${events.length} events -> ${totalRecords} records across ${Object.keys(collections).length} schemas`,
  );
  if (warnings.length) {
    console.log(`  ${warnings.length} warning(s) — check stderr`);
  }
}

main();

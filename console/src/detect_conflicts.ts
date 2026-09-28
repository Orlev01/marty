#!/usr/bin/env tsx
/**
 * detect_conflicts.ts — Conflict detection for multi-agent event-sourced state.
 *
 * Reads: cycle_state.json, events/*
 * Reports: duplicate creates, concurrent updates, duplicate investigations.
 *
 * Run after rebuild_state.ts to detect semantic conflicts between agents.
 * This is a passive reporter — it does NOT modify any state.
 */

import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Event, EventFile, State, Record } from "./types.js";
import { loadJson } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const BASE_DIR = dirname(join(__filename, ".."));
const EVENTS_DIR = join(BASE_DIR, "events");

// Concurrent edit window: flag updates to the same record by different authors
// within this window. Based on typical session length (~2 hours).
const CONCURRENT_EDIT_WINDOW_HOURS = 2;

// Duplicate investigation window: flag discoveries from different authors
// investigating similar topics within this window.
const DUPLICATE_INVESTIGATION_WINDOW_HOURS = 24;

const conflicts: string[] = [];
const warnings: string[] = [];
const info: string[] = [];

function loadAllEvents(): Event[] {
  /** Load all events from event files, sorted chronologically. */
  let eventFiles: string[];
  try {
    eventFiles = readdirSync(EVENTS_DIR)
      .filter((f) => f.endsWith(".json"))
      .sort()
      .map((f) => join(EVENTS_DIR, f));
  } catch {
    return [];
  }

  const allEvents: Event[] = [];

  for (const filepath of eventFiles) {
    let data: EventFile;
    try {
      data = JSON.parse(readFileSync(filepath, "utf-8")) as EventFile;
    } catch {
      continue;
    }
    for (const evt of data.events ?? []) {
      evt._sourceFile = basename(filepath);
      allEvents.push(evt);
    }
  }

  allEvents.sort((a, b) => (a.timestamp ?? "").localeCompare(b.timestamp ?? ""));
  return allEvents;
}

function parseTimestamp(ts: string | undefined): Date | null {
  /**
   * Parse an ISO timestamp string to a Date, or null.
   * JS Date.parse handles ISO strings including timezone offsets.
   */
  if (!ts) return null;
  try {
    const dt = new Date(ts);
    if (isNaN(dt.getTime())) return null;
    return dt;
  } catch {
    return null;
  }
}

interface CreateEntry {
  author: string;
  timestamp: string;
  sourceFile: string;
  title: string;
}

function checkDuplicateCreates(events: Event[]): void {
  /** Check for the same recordId being created by different authors. */
  const creates: globalThis.Record<string, CreateEntry[]> = {};

  for (const evt of events) {
    if (evt.action !== "create") continue;
    const rid = evt.recordId ?? "";
    if (!creates[rid]) creates[rid] = [];
    creates[rid].push({
      author: evt.author ?? "",
      timestamp: evt.timestamp ?? "",
      sourceFile: evt._sourceFile ?? "",
      title: (evt.data?.title as string) ?? "",
    });
  }

  for (const [rid, entries] of Object.entries(creates)) {
    if (entries.length < 2) continue;

    const authors = new Set(entries.map((e) => e.author));
    if (authors.size > 1) {
      const authorList = entries
        .map((e) => `${e.author} (${e.sourceFile})`)
        .join(", ");
      conflicts.push(
        `Duplicate create: '${rid}' created by ${authorList} — ` +
          `later create overwrites earlier. ` +
          `Resolution: rename one using author-prefix convention.`,
      );
    } else {
      // Same author created twice — probably a re-run or correction
      warnings.push(
        `Duplicate create: '${rid}' created ${entries.length} times by ${entries[0].author}`,
      );
    }
  }
}

function checkConcurrentUpdates(state: State): void {
  /** Check for concurrent edits to the same field by different authors. */
  const collections = state.collections ?? {};
  const windowMs = CONCURRENT_EDIT_WINDOW_HOURS * 3_600_000;

  for (const [schemaName, records] of Object.entries(collections)) {
    for (const record of records) {
      const history = record._editHistory ?? [];
      if (history.length < 2) continue;

      // Compare each pair of edits from different authors
      for (let i = 0; i < history.length - 1; i++) {
        for (let j = i + 1; j < history.length; j++) {
          const h1 = history[i];
          const h2 = history[j];
          if (h1.author === h2.author) continue;

          const t1 = parseTimestamp(h1.timestamp);
          const t2 = parseTimestamp(h2.timestamp);
          if (!t1 || !t2) continue;
          if (Math.abs(t2.getTime() - t1.getTime()) > windowMs) continue;

          // Check for overlapping fields
          const fields1 = new Set(h1.newFields ?? []);
          const fields2 = new Set(h2.newFields ?? []);
          const overlap = [...fields1].filter((x) => fields2.has(x));

          if (overlap.length > 0) {
            // Same field changed by different authors within window
            const prev = h2.previousValues ?? {};
            const details = overlap.map(
              (f) =>
                `${f}: was '${prev[f] ?? "?"}', now '${record[f] ?? "?"}'`,
            );
            conflicts.push(
              `Concurrent edit: ${schemaName}/${record._id} — ` +
                `${h1.author} and ${h2.author} both changed ${overlap.join(", ")} ` +
                `within ${CONCURRENT_EDIT_WINDOW_HOURS}h. ` +
                `Details: ${details.join("; ")}. ` +
                `Resolution: show both values, ask user which to keep.`,
            );
          } else {
            // Different fields changed — not a conflict, just awareness
            info.push(
              `Concurrent edit (no conflict): ${schemaName}/${record._id} — ` +
                `${h1.author} changed ${[...fields1].join(", ")}, ` +
                `${h2.author} changed ${[...fields2].join(", ")}`,
            );
          }
        }
      }
    }
  }
}

function parseServices(servicesStr: unknown): Set<string> {
  /** Parse a freeform services string into a set of service names. */
  if (!servicesStr || typeof servicesStr !== "string") return new Set();
  return new Set(
    servicesStr
      .split(/[,\n]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0),
  );
}

function checkDuplicateInvestigations(state: State): void {
  /** Check for potentially duplicate discovery investigations. */
  const collections = state.collections ?? {};
  const discoveries = (collections.discovery ?? []).filter(
    (d) => d.status === "current",
  );

  const windowMs = DUPLICATE_INVESTIGATION_WINDOW_HOURS * 3_600_000;

  for (let i = 0; i < discoveries.length; i++) {
    for (let j = i + 1; j < discoveries.length; j++) {
      const d1 = discoveries[i];
      const d2 = discoveries[j];

      // Only flag if different investigators
      if (d1.investigator === d2.investigator) continue;

      const t1 = parseTimestamp(d1._createdAt);
      const t2 = parseTimestamp(d2._createdAt);

      // Check time window
      if (t1 && t2 && Math.abs(t2.getTime() - t1.getTime()) > windowMs)
        continue;

      // Check overlap: same service OR same tag
      const services1 = parseServices(d1.services);
      const services2 = parseServices(d2.services);
      const tags1 = new Set<string>((d1.tags as string[] | null) ?? []);
      const tags2 = new Set<string>((d2.tags as string[] | null) ?? []);

      const sharedServices = [...services1].filter((x) => services2.has(x));
      const sharedTags = [...tags1].filter((x) => tags2.has(x));

      if (sharedServices.length > 0 || sharedTags.length > 0) {
        const overlapDesc: string[] = [];
        if (sharedServices.length > 0)
          overlapDesc.push(`services: ${sharedServices.join(", ")}`);
        if (sharedTags.length > 0)
          overlapDesc.push(`tags: ${sharedTags.join(", ")}`);
        warnings.push(
          `Possible duplicate investigation: ` +
            `${d1._id} (${(d1.investigator as string) ?? "?"}) and ` +
            `${d2._id} (${(d2.investigator as string) ?? "?"}) — ` +
            `overlap on ${overlapDesc.join("; ")}. ` +
            `Resolution: create synthesis discovery linking both, ` +
            `or merge into earlier one.`,
        );
      }
    }
  }
}

function main(): number {
  const state = loadJson<State>(BASE_DIR, "cycle_state.json");
  if (!state || Object.keys(state).length === 0 || !state.collections) {
    console.log("No cycle_state.json found. Run npm run rebuild first.");
    return 1;
  }

  const events = loadAllEvents();

  checkDuplicateCreates(events);
  checkConcurrentUpdates(state);
  checkDuplicateInvestigations(state);

  // Summary stats
  const eventCount = events.length;
  const authorSet = new Set(
    events.map((e) => e.author).filter((a): a is string => !!a),
  );
  info.push(`Events scanned: ${eventCount}`);
  info.push(`Authors: ${[...authorSet].sort().join(", ")}`);

  // Output
  console.log("=".repeat(60));
  console.log("CONFLICT REPORT — Support Experience Hub");
  console.log("=".repeat(60));

  if (conflicts.length > 0) {
    console.log(`\nCONFLICTS (${conflicts.length}) — needs resolution:`);
    for (const c of conflicts) console.log(`  [x] ${c}`);
  } else {
    console.log("\nCONFLICTS: None");
  }

  if (warnings.length > 0) {
    console.log(`\nWARNINGS (${warnings.length}) — should review:`);
    for (const w of warnings) console.log(`  [!] ${w}`);
  } else {
    console.log("\nWARNINGS: None");
  }

  console.log(`\nINFO (${info.length}):`);
  for (const i of info) console.log(`  [ ] ${i}`);

  console.log(
    `\nTOTAL: ${conflicts.length} conflicts, ${warnings.length} warnings, ${info.length} info`,
  );

  return 0; // Informational, not blocking
}

process.exit(main());

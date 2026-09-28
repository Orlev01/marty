#!/usr/bin/env tsx
/**
 * validate_state.ts — Data quality checker for the console.
 *
 * Reads: schemas.json, config.json, team.json, metrics.json, cycle_state.json
 * Reports: errors, warnings, and info about data quality.
 *
 * Run via /validate slash command or as part of the Stop hook.
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type {
  Config,
  Team,
  Schemas,
  SchemaDef,
  State,
  Metrics,
  Record,
  PerPersonEntry,
} from "./types.js";
import { loadJson } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const BASE_DIR = dirname(join(__filename, ".."));

const errors: string[] = [];
const warnings: string[] = [];
const info: string[] = [];

function checkRequiredFields(
  record: Record,
  schemaDef: SchemaDef,
  schemaName: string,
): void {
  /** Check that required fields are present and non-empty. */
  for (const field of schemaDef.fields ?? []) {
    if (field.required && !record[field.id]) {
      errors.push(
        `${schemaName}/${record._id ?? "?"}: missing required field '${field.name}'`,
      );
    }
  }
}

function checkMemberRefs(
  record: Record,
  schemaDef: SchemaDef,
  schemaName: string,
  memberIds: Set<string>,
): void {
  /** Check that member references point to valid team members. */
  for (const field of schemaDef.fields ?? []) {
    const ftype = field.type ?? "";
    const val = record[field.id];
    if (val === undefined || val === null) continue;

    if (ftype === "member" && typeof val === "string" && !memberIds.has(val)) {
      errors.push(
        `${schemaName}/${record._id}: field '${field.name}' references unknown member '${val}'`,
      );
    } else if (ftype === "member[]" && Array.isArray(val)) {
      for (const v of val) {
        if (typeof v === "string" && !memberIds.has(v)) {
          errors.push(
            `${schemaName}/${record._id}: field '${field.name}' references unknown member '${v}'`,
          );
        }
      }
    }
  }
}

function checkOpportunityRefs(
  record: Record,
  schemaDef: SchemaDef,
  schemaName: string,
  oppIds: Set<string>,
): void {
  /** Check that opportunity references point to valid opportunities. */
  for (const field of schemaDef.fields ?? []) {
    const ftype = field.type ?? "";
    const val = record[field.id];
    if (val === undefined || val === null) continue;

    if (
      ftype.includes("ref:opportunity") &&
      typeof val === "string" &&
      !oppIds.has(val)
    ) {
      errors.push(
        `${schemaName}/${record._id}: field '${field.name}' references unknown opportunity '${val}'`,
      );
    }
  }
}

function checkSelectValues(
  record: Record,
  schemaDef: SchemaDef,
  schemaName: string,
): void {
  /** Check that select field values are in the allowed options. */
  for (const field of schemaDef.fields ?? []) {
    const ftype = field.type ?? "";
    const val = record[field.id];
    const options = field.options ?? [];
    if (val === undefined || val === null || options.length === 0) continue;

    if (ftype === "select" && typeof val === "string" && !options.includes(val)) {
      warnings.push(
        `${schemaName}/${record._id}: field '${field.name}' has value '${val}' not in options ${JSON.stringify(options)}`,
      );
    } else if (ftype === "multi_select" && Array.isArray(val)) {
      for (const v of val) {
        if (typeof v === "string" && !options.includes(v)) {
          warnings.push(
            `${schemaName}/${record._id}: field '${field.name}' has value '${v}' not in options ${JSON.stringify(options)}`,
          );
        }
      }
    }
  }
}

function checkStaleBlockers(blockers: Record[]): void {
  /** Flag blockers that have been open for more than 3 days. */
  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  for (const b of blockers) {
    if (b.status !== "open") continue;
    const created = b._createdAt ?? "";
    if (!created) continue;

    try {
      const createdDate = new Date(created as string);
      if (isNaN(createdDate.getTime())) continue;
      const createdDateOnly = new Date(
        createdDate.getFullYear(),
        createdDate.getMonth(),
        createdDate.getDate(),
      );
      const age = Math.floor(
        (todayDate.getTime() - createdDateOnly.getTime()) / 86_400_000,
      );
      if (age > 3) {
        warnings.push(
          `blocker/${b._id}: open for ${age} days — '${(b.title as string) ?? "?"}'`,
        );
      }
    } catch {
      // skip unparseable timestamps
    }
  }
}

function checkTasksWithoutOpportunity(tasks: Record[]): void {
  /** Flag tasks not linked to any opportunity. */
  for (const t of tasks) {
    if (!t.opportunity && t.status !== "done") {
      warnings.push(
        `task/${t._id}: no opportunity link — '${(t.title as string) ?? "?"}'`,
      );
    }
  }
}

function checkMetricBaselines(metrics: Metrics): void {
  /** Flag metrics with null baselines. */
  for (const m of metrics.metrics ?? []) {
    if (m.baseline === undefined || m.baseline === null) {
      warnings.push(
        `metric/${m.id}: no baseline set — '${m.name ?? "?"}'`,
      );
    }
  }
}

function checkTeamCoverage(
  perPerson: globalThis.Record<string, PerPersonEntry>,
): void {
  /** Check if any team member has zero tasks assigned. */
  for (const [mid, pp] of Object.entries(perPerson)) {
    if (!pp.activeTasks) {
      info.push(
        `team/${mid}: ${pp.name ?? mid} has no active tasks assigned`,
      );
    }
  }
}

function main(): number {
  const schemas = loadJson<Schemas>(BASE_DIR, "schemas.json");
  const config = loadJson<Config>(BASE_DIR, "config.json");
  const team = loadJson<Team>(BASE_DIR, "team.json");
  const metrics = loadJson<Metrics>(BASE_DIR, "metrics.json");
  const state = loadJson<State>(BASE_DIR, "cycle_state.json");

  // Build set of valid member IDs
  const memberIds = new Set<string>();
  for (const m of team.members ?? []) {
    memberIds.add(m.id);
  }
  for (const s of team.stakeholders ?? []) {
    if (s.id) memberIds.add(s.id);
  }

  const collections = state.collections ?? {};

  // Opportunity IDs come from the opportunity schema collection
  const portfolioSchema =
    config.portfolio?.schema ?? "opportunity";
  const oppIds = new Set<string>(
    (collections[portfolioSchema] ?? [])
      .filter((r) => r._id)
      .map((r) => r._id),
  );

  const schemaDefs = schemas.schemas ?? {};

  // Per-schema validation
  for (const [schemaName, schemaDef] of Object.entries(schemaDefs)) {
    const def = schemaDef as SchemaDef;
    const records = collections[schemaName] ?? [];
    for (const record of records) {
      checkRequiredFields(record, def, schemaName);
      checkMemberRefs(record, def, schemaName, memberIds);
      checkOpportunityRefs(record, def, schemaName, oppIds);
      checkSelectValues(record, def, schemaName);
    }
  }

  // Cross-cutting checks
  checkStaleBlockers(collections.blocker ?? []);
  checkTasksWithoutOpportunity(collections.task ?? []);
  checkMetricBaselines(metrics);
  checkTeamCoverage(state.perPerson ?? {});

  // Summary stats
  const eventCount = state._eventCount ?? 0;
  info.push(`Events processed: ${eventCount}`);
  for (const schemaName of Object.keys(schemaDefs)) {
    const count = (collections[schemaName] ?? []).length;
    info.push(`${schemaName}: ${count} records`);
  }
  info.push(`Team members: ${(team.members ?? []).length}`);
  info.push(`Opportunities: ${oppIds.size}`);

  // Build warnings from state
  for (const w of state._warnings ?? []) {
    warnings.push(`rebuild: ${w}`);
  }

  // Output
  console.log("=".repeat(60));
  console.log("VALIDATION REPORT — Support Experience Hub");
  console.log("=".repeat(60));

  if (errors.length > 0) {
    console.log(`\nERRORS (${errors.length}) — must fix:`);
    for (const e of errors) console.log(`  [x] ${e}`);
  } else {
    console.log("\nERRORS: None");
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
    `\nTOTAL: ${errors.length} errors, ${warnings.length} warnings, ${info.length} info`,
  );

  return errors.length > 0 ? 1 : 0;
}

process.exit(main());

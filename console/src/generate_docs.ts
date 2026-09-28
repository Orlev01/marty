#!/usr/bin/env tsx
/**
 * generate_docs.ts — Auto-generate SCHEMAS.md from schemas.json and team.json.
 *
 * Reads: schemas.json, team.json
 * Writes: SCHEMAS.md
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Schemas, Team } from "./types.js";
import { loadJson } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const BASE_DIR = dirname(join(__filename, ".."));

function generateSchemaDocs(schemas: Schemas, team: Team): string {
  const schemaDefs = schemas.schemas ?? {};
  const lines: string[] = [
    "# Data Structures Reference",
    "",
    "*Auto-generated from `schemas.json` — do not edit manually.*",
    "",
    `This project uses **${Object.keys(schemaDefs).length}** data structures, ` +
      "all defined in `schemas.json`. Each structure has typed fields with AI instructions " +
      "that tell Marty how to populate them.",
    "",
    "---",
    "",
  ];

  lines.push("## Structures\n");
  for (const [sid, schema] of Object.entries(schemaDefs)) {
    lines.push(`- [${schema.name}](#${sid}) — ${schema.description ?? ""}`);
  }
  lines.push("");

  for (const [sid, schema] of Object.entries(schemaDefs)) {
    lines.push(`## ${schema.name}`);
    lines.push("");
    if (schema.description) {
      lines.push(schema.description);
      lines.push("");
    }
    const view = schema.dashboardView ?? {};
    lines.push(`**Dashboard view:** ${view.type ?? "table"}`);
    if (view.groupBy) {
      lines.push(` | **Group by:** ${view.groupBy}`);
    }
    if (view.sortBy) {
      lines.push(` | **Sort by:** ${view.sortBy}`);
    }
    lines.push("");
    lines.push("| Field | Type | Required | AI Instruction |");
    lines.push("|-------|------|----------|---------------|");
    for (const field of schema.fields ?? []) {
      const name = field.name;
      const ftype = field.type ?? "text";
      const opts = field.options
        ? ` (\`${field.options.join("`, `")}\`)`
        : "";
      const required = field.required ? "Yes" : "";
      const ai = field.aiInstruction ?? "";
      const defaultVal = field.default != null ? ` Default: \`${field.default}\`` : "";
      lines.push(`| ${name} | \`${ftype}\`${opts} | ${required} | ${ai}${defaultVal} |`);
    }
    lines.push("");
    lines.push("**Create event example:**");
    lines.push("```json");

    const exampleData: globalThis.Record<string, unknown> = {};
    for (const field of schema.fields ?? []) {
      if (field.required) {
        if (field.type === "text") {
          exampleData[field.id] = `<${field.name}>`;
        } else if (field.type === "member") {
          const members = team.members ?? [];
          exampleData[field.id] = members.length > 0 ? members[0].id : "<member_id>";
        } else if (field.type === "date") {
          exampleData[field.id] = "2026-05-05";
        } else if (field.type === "select" && field.options?.length) {
          exampleData[field.id] = field.options[0];
        }
      }
    }

    lines.push(
      JSON.stringify(
        {
          schema: sid,
          action: "create",
          author: "<your_member_id>",
          timestamp: "2026-05-05T10:00:00+10:00",
          recordId: `${sid}_NNN`,
          data: exampleData,
        },
        null,
        2,
      ),
    );
    lines.push("```");
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  lines.push("## Field Types Reference\n");
  lines.push("| Type | Description |");
  lines.push("|------|-------------|");
  for (const [tid, tdef] of Object.entries(schemas.fieldTypes ?? {})) {
    lines.push(`| \`${tid}\` | ${tdef.description ?? ""} |`);
  }
  lines.push("");

  return lines.join("\n");
}

function main(): void {
  const schemas = loadJson<Schemas>(BASE_DIR, "schemas.json");
  const team = loadJson<Team>(BASE_DIR, "team.json");
  const docs = generateSchemaDocs(schemas, team);
  const outputPath = join(BASE_DIR, "SCHEMAS.md");
  writeFileSync(outputPath, docs, "utf-8");
  console.log(`Schema docs generated: ${outputPath}`);
}

main();

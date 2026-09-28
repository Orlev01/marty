#!/usr/bin/env tsx
/**
 * regenerate_guides.ts — Regenerate guides.json from schemas.json.
 *
 * Auto-generated guides are rebuilt from schema definitions.
 * Static (hand-written) guides are preserved and validated.
 *
 * Reads: schemas.json, config.json, team.json, guides.json
 * Writes: guides.json
 */

import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Schemas, Config, Team, Guide, GuideSection } from "./types.js";
import { loadJson } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const BASE_DIR = dirname(join(__filename, ".."));

function generateSchemaGuide(
  schemaId: string,
  schema: Schemas["schemas"][string],
): Guide {
  const fieldsItems: string[] = [];
  for (const f of schema.fields ?? []) {
    const req = f.required ? " (required)" : "";
    const ai = f.aiInstruction ? ` — *${f.aiInstruction}*` : "";
    const opts = f.options
      ? ` Options: \`${f.options.join("`, `")}\``
      : "";
    fieldsItems.push(`**${f.name}** \`${f.type}\`${req}${opts}${ai}`);
  }

  const view = schema.dashboardView ?? {};
  const viewType = view.type ?? "table";
  let viewDesc = `This tab renders as a **${viewType}** view`;
  if (view.groupBy) viewDesc += `, grouped by **${view.groupBy}**`;
  if (view.sortBy) viewDesc += `, sorted by **${view.sortBy}**`;
  viewDesc += ".";

  const sections: GuideSection[] = [
    {
      heading: `What is a ${schema.name}?`,
      body: schema.description ?? "A data structure tracked by the console.",
    },
    {
      heading: "Fields",
      items: fieldsItems,
    },
    {
      heading: "How records are created",
      items: [
        "Tell Marty (or any Claude Code session in this repo) what happened — it appends event files following the schema's field definitions and AI instructions.",
        "Events are written to `events/` and state is recomputed by `rebuild_state.ts`.",
      ],
    },
    {
      heading: "Dashboard view",
      body: viewDesc + " You can change this in the Schema Editor tab.",
    },
  ];

  return { title: `${schema.name} Guide`, sections, _auto: true };
}

function validateStaticGuides(
  guides: globalThis.Record<string, Guide>,
  _config: Config,
  _team: Team,
): string[] {
  const warnings: string[] = [];
  const configFiles = ["config.json", "team.json", "schemas.json", "metrics.json", "guides.json"];

  for (const [pageId, guide] of Object.entries(guides)) {
    if (guide._auto) continue;
    for (const section of guide.sections ?? []) {
      const text = JSON.stringify(section);
      for (const cf of configFiles) {
        if (text.includes(cf)) {
          const path = join(BASE_DIR, cf);
          if (!existsSync(path)) {
            warnings.push(`Guide '${pageId}' references ${cf} which doesn't exist`);
          }
        }
      }
    }
  }

  if (warnings.length > 0) {
    for (const w of warnings) console.log(`  WARN: ${w}`);
  }
  return warnings;
}

function main(): void {
  const schemas = loadJson<Schemas>(BASE_DIR, "schemas.json");
  const config = loadJson<Config>(BASE_DIR, "config.json");
  const team = loadJson<Team>(BASE_DIR, "team.json");
  const guides = loadJson<globalThis.Record<string, Guide>>(BASE_DIR, "guides.json");

  const updated: globalThis.Record<string, Guide> = {};

  // Preserve static (hand-written) guides
  for (const [pageId, guide] of Object.entries(guides)) {
    if (!guide._auto) updated[pageId] = guide;
  }

  // Regenerate auto guides from schemas
  const schemaDefs = schemas.schemas ?? {};
  for (const [sid, schema] of Object.entries(schemaDefs)) {
    updated[sid] = generateSchemaGuide(sid, schema);
  }

  validateStaticGuides(updated, config, team);

  const outputPath = join(BASE_DIR, "guides.json");
  writeFileSync(outputPath, JSON.stringify(updated, null, 2) + "\n", "utf-8");

  const staticCount = Object.values(updated).filter((g) => !g._auto).length;
  const autoCount = Object.values(updated).filter((g) => g._auto).length;
  console.log(
    `Guides regenerated: ${staticCount} static, ${autoCount} auto-generated from schemas`,
  );
}

main();

/**
 * parse_sources.ts — Read-only bridge from Marty's markdown source registries
 * to the console's Sources tab.
 *
 * The canonical registry is markdown, owned by Marty:
 *   - <repo>/sources.md                         (persistent sources)
 *   - <repo>/missions/<m>/sources/registry.md   (per-mission sources)
 *
 * This module parses those files leniently and returns grouped source entries
 * for display. It never writes anything — edits happen in the markdown.
 *
 * Recognised line shape (inside any section):
 *   - key: value, key: value, ...
 * e.g.  - channel-id: C0XXXXXXX, name: #ai-help, priority: high, look-for: unresolved asks
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export interface ParsedSource {
  name: string;
  type: string; // slack | notion | linear | gdoc | calendar | other
  detail: string; // id / link / calendar address
  description: string; // look-for guidance
  meta: string; // priority, lookback, etc.
}

export interface SourceGroup {
  origin: string; // repo-relative path of the registry file
  label: string;
  sources: ParsedSource[];
}

const KNOWN_TYPES = new Set(["slack", "notion", "linear", "gdoc", "calendar", "figma", "datadog"]);

function inferType(attrs: Record<string, string>, section: string): string {
  const explicit = (attrs["type"] ?? "").toLowerCase();
  if (KNOWN_TYPES.has(explicit)) return explicit;
  const s = section.toLowerCase();
  if (s.includes("slack") || attrs["channel-id"]) return "slack";
  if (s.includes("calendar") || attrs["calendar"]) return "calendar";
  if (s.includes("notion")) return "notion";
  if (s.includes("linear")) return "linear";
  if (s.includes("drive") || s.includes("gdoc") || s.includes("doc")) return "gdoc";
  return "other";
}

function parseEntryLine(line: string): Record<string, string> | null {
  const body = line.replace(/^\s*[-*]\s+/, "");
  if (!body.includes(":")) return null;
  const attrs: Record<string, string> = {};
  for (const part of body.split(",")) {
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim().replace(/\*\*/g, "").toLowerCase();
    const value = part.slice(idx + 1).trim().replace(/\*\*/g, "").replace(/`/g, "");
    if (key && value) attrs[key] = value;
  }
  return Object.keys(attrs).length >= 2 ? attrs : null;
}

function parseRegistryFile(path: string): ParsedSource[] {
  const sources: ParsedSource[] = [];
  const lines = readFileSync(path, "utf-8").split("\n");
  let section = "";
  for (const line of lines) {
    if (line.startsWith("## ")) {
      section = line.slice(3).trim();
      continue;
    }
    if (section.toLowerCase().startsWith("how ")) continue; // prose sections
    if (!/^\s*[-*]\s+/.test(line)) continue;
    const attrs = parseEntryLine(line);
    if (!attrs) continue;
    const type = inferType(attrs, section);
    const name =
      attrs["name"] ?? attrs["calendar"] ?? attrs["title"] ?? Object.values(attrs)[0] ?? "(unnamed)";
    const detail =
      attrs["channel-id"] ?? attrs["id"] ?? attrs["link"] ?? attrs["url"] ?? attrs["calendar"] ?? "";
    const metaBits: string[] = [];
    if (attrs["priority"]) metaBits.push(`priority: ${attrs["priority"]}`);
    if (attrs["lookback"]) metaBits.push(`lookback: ${attrs["lookback"]}`);
    sources.push({
      name,
      type,
      detail,
      description: attrs["look-for"] ?? attrs["description"] ?? "",
      meta: metaBits.join(" · "),
    });
  }
  return sources;
}

/** Parse every source registry under the repo root. Read-only. */
export function parseAllSources(repoRoot: string): SourceGroup[] {
  const groups: SourceGroup[] = [];

  const persistent = join(repoRoot, "sources.md");
  if (existsSync(persistent)) {
    groups.push({
      origin: "sources.md",
      label: "Persistent (sources.md)",
      sources: parseRegistryFile(persistent),
    });
  }

  const missionsDir = join(repoRoot, "missions");
  if (existsSync(missionsDir)) {
    for (const entry of readdirSync(missionsDir).sort()) {
      if (entry.startsWith("_") || entry.startsWith(".")) continue; // _template, _archive
      const registry = join(missionsDir, entry, "sources", "registry.md");
      if (!statSafe(registry)) continue;
      groups.push({
        origin: `missions/${entry}/sources/registry.md`,
        label: `Mission: ${entry}`,
        sources: parseRegistryFile(registry),
      });
    }
  }
  return groups;
}

function statSafe(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

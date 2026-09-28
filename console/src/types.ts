/**
 * Shared type definitions for the Support Experience Hub.
 *
 * These interfaces match the JSON structures in config.json, team.json,
 * schemas.json, metrics.json, cycle_state.json, and event files.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// --- Config ---

export interface ProjectConfig {
  name: string;
  startDate: string;
  endDate: string;
  currentPhase: string;
  phases?: Array<{ id: string; name: string; startDate?: string; endDate?: string }>;
}

export interface PortfolioConfig {
  schema: string;
  currentFocus: string[];
  nextUp: string[];
}

export interface StatDef {
  label: string;
  schema: string;
  count: string;
}

export interface PerPersonAggDef {
  schema: string;
  filter: string;
  ownerField: string;
}

export interface OverviewConfig {
  stats: StatDef[];
  sections: Array<{ type: string; title: string }>;
  perPerson: Record<string, PerPersonAggDef>;
}

export interface DataSource {
  type: string;
  name: string;
  [key: string]: unknown;
}

export interface Config {
  project: ProjectConfig;
  portfolio: PortfolioConfig;
  overview: OverviewConfig;
  dataSources: DataSource[];
  ceremonies?: unknown[];
  [key: string]: unknown;
}

// --- Team ---

export interface Member {
  id: string;
  name: string;
  role: string;
  gitEmail?: string;
  slackId?: string;
  briefingFocus?: string[];
  canUpdateConfig?: boolean;
}

export interface Stakeholder {
  id?: string;
  name: string;
  role?: string;
  [key: string]: unknown;
}

export interface RoleDef {
  label: string;
  [key: string]: unknown;
}

export interface Team {
  members: Member[];
  stakeholders: Stakeholder[];
  roles: Record<string, RoleDef>;
}

// --- Schemas ---

export interface SchemaField {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  options?: string[];
  default?: unknown;
  aiInstruction?: string;
  detailOnly?: boolean;
}

export interface DashboardView {
  type: string;
  groupBy?: string;
  sortBy?: string;
}

export interface SchemaDef {
  name: string;
  description?: string;
  fields: SchemaField[];
  dashboardView?: DashboardView;
}

export interface Schemas {
  schemas: Record<string, SchemaDef>;
  fieldTypes?: Record<string, { description: string }>;
}

// --- Events ---

export interface EventData {
  [key: string]: unknown;
}

export interface Event {
  schema: string;
  action: "create" | "update" | "delete";
  author: string;
  timestamp: string;
  recordId: string;
  data: EventData;
  _sourceFile?: string;
}

export interface EventFile {
  events: Event[];
}

// --- State ---

export interface EditHistoryEntry {
  author: string;
  timestamp: string;
  previousValues: Record<string, unknown>;
  newFields: string[];
  sourceFile?: string;
}

export interface Record {
  _id: string;
  _createdAt?: string;
  _createdBy?: string;
  _updatedAt?: string;
  _updatedBy?: string;
  _deleted?: boolean;
  _deletedAt?: string;
  _deletedBy?: string;
  _editHistory?: EditHistoryEntry[];
  _badge?: string;
  [key: string]: unknown;
}

export interface PerPersonEntry {
  name: string;
  role: string;
  [key: string]: unknown;
}

export interface Summary {
  cycleDay: number;
  phase: string;
  stats: globalThis.Record<string, number>;
  currentFocus: string[];
  nextUp: string[];
}

export interface State {
  _schema: string;
  _computedAt: string;
  _gitHead: string;
  _eventCount: number;
  _maxSequence: globalThis.Record<string, number>;
  _warnings: string[];
  project: ProjectConfig;
  summary: Summary;
  collections: globalThis.Record<string, Record[]>;
  metrics: Metrics;
  perPerson: globalThis.Record<string, PerPersonEntry>;
}

// --- Metrics ---

export interface MetricDef {
  id: string;
  name: string;
  baseline?: number | null;
  target?: number | null;
  readings?: Array<{ date: string; value: number }>;
  [key: string]: unknown;
}

export interface Metrics {
  metrics?: MetricDef[];
  [key: string]: unknown;
}

// --- Guides ---

export interface GuideSection {
  heading?: string;
  body?: string;
  items?: string[];
}

export interface Guide {
  title: string;
  sections?: GuideSection[];
  content?: string;
  _auto?: boolean;
}

// --- Ledger ---

export interface LedgerEntry {
  ts: string;
  author: string;
  action: string;
}

// --- Helpers ---

export function loadJson<T>(baseDir: string, filename: string): T {
  const filepath = join(baseDir, filename);
  if (!existsSync(filepath)) return {} as T;
  return JSON.parse(readFileSync(filepath, "utf-8"));
}

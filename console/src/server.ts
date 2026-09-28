/**
 * server.ts — Local dev server for the console.
 *
 * Serves dashboard.html and provides save endpoints so edits in the browser
 * are written directly to config files and rebuilt automatically.
 *
 * Usage:
 *   npx tsx src/server.ts              # default port 8080
 *   npx tsx src/server.ts --port 9090  # custom port
 */

import express from "express";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const BASE_DIR = dirname(join(__filename, ".."));

const app = express();
app.use(express.json());

// --- Helpers ---

function runRebuild(): { ok: boolean; error?: string } {
  try {
    execSync("npx tsx src/rebuild_state.ts", { cwd: BASE_DIR, stdio: "pipe" });
    execSync("npx tsx src/regenerate_dashboard.ts", {
      cwd: BASE_DIR,
      stdio: "pipe",
    });
    return { ok: true };
  } catch (err: unknown) {
    const e = err as { stderr?: Buffer };
    return { ok: false, error: e.stderr?.toString() || "Rebuild failed" };
  }
}

function loadConfig(): Record<string, unknown> {
  return JSON.parse(readFileSync(join(BASE_DIR, "config.json"), "utf-8"));
}

function saveConfig(config: Record<string, unknown>): void {
  writeFileSync(
    join(BASE_DIR, "config.json"),
    JSON.stringify(config, null, 2) + "\n",
  );
}

// --- Routes ---

app.get(["/", "/dashboard"], (_req, res) => {
  const dashPath = join(BASE_DIR, "dashboard.html");
  if (!existsSync(dashPath)) {
    const result = runRebuild();
    if (!result.ok) {
      res.status(500).send("Dashboard generation failed: " + result.error);
      return;
    }
  }
  const content = readFileSync(dashPath, "utf-8");
  res.type("html").send(content);
});

app.post("/api/save-schemas", (req, res) => {
  try {
    const { schemas, configUpdates } = req.body;

    writeFileSync(
      join(BASE_DIR, "schemas.json"),
      JSON.stringify(schemas, null, 2) + "\n",
    );

    const config = loadConfig();
    if (configUpdates?.overview) config.overview = configUpdates.overview;
    if (configUpdates?.portfolio) config.portfolio = configUpdates.portfolio;
    saveConfig(config);

    const result = runRebuild();
    if (!result.ok) {
      res.status(500).json({ ok: false, error: "Rebuild failed", stderr: result.error });
      return;
    }

    res.json({ ok: true });
  } catch (ex: unknown) {
    res.status(500).json({ ok: false, error: String(ex) });
  }
});

app.post("/api/save-record", (req, res) => {
  try {
    const { schema, action, recordId, data, author } = req.body;
    const eventAuthor = author || "dashboard";

    if (!schema || !action || !recordId) {
      res
        .status(400)
        .json({ ok: false, error: "Missing schema, action, or recordId" });
      return;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const timestamp = now.toISOString().replace("Z", "+10:00");
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    const eventsDir = join(BASE_DIR, "events");
    mkdirSync(eventsDir, { recursive: true });

    let filename = `${dateStr}_${timeStr}_${eventAuthor}.json`;
    let eventPath = join(eventsDir, filename);
    let counter = 1;
    while (existsSync(eventPath)) {
      filename = `${dateStr}_${timeStr}_${counter}_${eventAuthor}.json`;
      eventPath = join(eventsDir, filename);
      counter++;
    }

    const event = {
      events: [
        {
          schema,
          action,
          author: eventAuthor,
          timestamp,
          recordId,
          data: data || {},
        },
      ],
    };

    writeFileSync(eventPath, JSON.stringify(event, null, 2) + "\n");

    const result = runRebuild();
    if (!result.ok) {
      res.status(500).json({ ok: false, error: "Rebuild failed", stderr: result.error });
      return;
    }

    res.json({ ok: true });
  } catch (ex: unknown) {
    res.status(500).json({ ok: false, error: String(ex) });
  }
});

app.post("/api/sync", (_req, res) => {
  try {
    // Standalone mode: rebuild state and regenerate dashboard (no git)
    const result = runRebuild();
    if (!result.ok) {
      res
        .status(500)
        .json({ ok: false, error: "Rebuild failed", detail: result.error });
      return;
    }

    const syncedAt = new Date();
    const syncTs = `${syncedAt.getFullYear()}-${String(syncedAt.getMonth() + 1).padStart(2, "0")}-${String(syncedAt.getDate()).padStart(2, "0")} ${String(syncedAt.getHours()).padStart(2, "0")}:${String(syncedAt.getMinutes()).padStart(2, "0")}`;

    res.json({ ok: true, steps: ["rebuilt"], syncedAt: syncTs });
  } catch (ex: unknown) {
    res.status(500).json({ ok: false, error: String(ex) });
  }
});

// --- Start ---

const args = process.argv.slice(2);
let port = 8080;
const portIdx = args.indexOf("--port");
if (portIdx !== -1 && args[portIdx + 1]) {
  port = parseInt(args[portIdx + 1], 10);
}

app
  .listen(port, "127.0.0.1", () => {
    console.log(`Dashboard server running at http://localhost:${port}`);
    console.log("Press Ctrl+C to stop.\n");
  })
  .on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${port} is already in use. Try: npx tsx src/server.ts --port ${port + 1}`,
      );
      process.exit(1);
    }
    throw err;
  });

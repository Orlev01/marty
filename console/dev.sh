#!/bin/bash
# dev.sh — Watch for source changes, rebuild state + dashboard, restart server.
# Usage: ./dev.sh

cd "$(dirname "$0")"

cleanup() {
  echo ""
  echo "Shutting down..."
  lsof -ti :8244 | xargs kill -9 2>/dev/null
  exit 0
}
trap cleanup INT TERM

build_and_serve() {
  lsof -ti :8244 | xargs kill -9 2>/dev/null
  echo "[$(date +%H:%M:%S)] Rebuilding..."
  npx tsx src/rebuild_state.ts 2>&1 | tail -1
  npx tsx src/regenerate_dashboard.ts 2>&1
  npx tsx src/server.ts --port 8244 &
  echo "[$(date +%H:%M:%S)] Server running at http://localhost:8244"
}

build_and_serve

# Watch src/ and config files for changes, rebuild on change
fswatch -o src/ config.json team.json schemas.json metrics.json events/ 2>/dev/null | while read; do
  echo ""
  build_and_serve
done

# Fallback if fswatch not installed
if ! command -v fswatch &>/dev/null; then
  echo ""
  echo "Tip: brew install fswatch for auto-reload on file changes."
  echo "Without it, the server is running but won't auto-rebuild."
  echo "Press Ctrl+C to stop."
  wait
fi

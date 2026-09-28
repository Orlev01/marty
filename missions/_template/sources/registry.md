# Sources — {Mission}

External sources `/marty-reconcile` reads to keep this mission's context current. One entry per source: a **type** (`slack` / `notion` / `gdoc`), an **id/link**, a **lookback** window (how far back to read on each pull), and **look-for** guidance. Watermarks live in `state.md`; the latest snapshot per source lands in `pulled/`.

## Slack
- type: slack, id: {channel-id}, name: {#channel}, lookback: 7d, look-for: {what matters here}

## Notion
- type: notion, id: {page-or-db-id}, name: {title}, lookback: 14d, look-for: {what matters here}

## Google Docs
- type: gdoc, id: {doc-id}, name: {title}, lookback: 14d, look-for: {what matters here}

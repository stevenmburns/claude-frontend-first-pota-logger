# POTA Hunt Logger

A browser-based logging app for [Parks on the Air (POTA)](https://parksontheair.com/) hunters. Log QSOs, browse live spots, and track your park history — all stored locally in your browser with optional cloud sync.

## Features

- **Live spots** — fetches active POTA spots with band/mode filtering
- **QSO logging** — log contacts with auto-fill from selected spots
- **Local-first storage** — all data stored in SQLite in your browser (no account required)
- **Activity heatmaps** — visualise your QSO activity and new parks hunted over time
- **Supabase sync** — optional background sync to the cloud for backup and multi-device access
- **ADIF export** — export your log for upload to POTA, QRZ, LoTW, etc.
- **flrig integration** — optional radio control via a local CORS proxy

## Tech Stack

- React 18 + TypeScript + Vite
- SQLite WASM (in-browser, persistent via OPFS)
- Supabase JS v2 (optional sync)

## Usage

The app is deployed at: **[your Netlify URL here]**

No installation or account required. Open the app, enter your callsign in Settings, and start logging.

### Settings

| Setting | Description |
|---------|-------------|
| Callsign | Your amateur radio callsign |
| Supabase URL + key | Optional — enables cloud sync and backup |
| flrig proxy port | Optional — enables radio frequency control |

## Running Locally

```bash
git clone https://github.com/stevenmburns/claude-frontend-first-pota-logger.git
cd claude-frontend-first-pota-logger/frontend
npm install
npm run dev
```

Requires a Chromium-based browser (Chrome, Edge, Arc) for OPFS storage support.

## Development

```bash
npm run dev      # dev server at http://localhost:5173
npm run build    # production build
npm test         # run tests
```

See [CLAUDE.md](CLAUDE.md) for architecture notes and codebase conventions.

## License

MIT

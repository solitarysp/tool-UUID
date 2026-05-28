# UUID Toolkit

A web tool to **generate** and **decode** common identifier formats in one interface.

The app is built with React + Vite and optimized for large batches using a Web Worker and virtualized lists.

## Key Features

- Batch generation for multiple identifier types:
  - UUID `v1`, `v3`, `v4`, `v5`, `v6`, `v7`
  - UUID `nil`, `max`
  - `ULID`, `NanoID`, `CUID2`, `Snowflake`
- Output formatting options for generated values:
  - `uppercase`
  - with/without `hyphens`
  - with `braces`
- Namespace support for UUID `v3`/`v5` (`dns`, `url`, `oid`, `x500`, custom)
- Batch decoding from text, CSV, and JSON (paste input or upload file)
- Embedded timestamp parsing for supported formats (time-based UUIDs, ULID, Snowflake)
- Export results to `.txt` and `.csv`
- Share decode input through URL hash
- Responsive UI with Light/Dark/System themes
- PWA support via `vite-plugin-pwa`

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Zustand (state management)
- `@tanstack/react-virtual` (virtualization)
- Web Worker for batch generation

## Requirements

- Node.js 18+ (Node.js 20+ recommended)
- npm 9+

## Local Setup

```bash
npm install
npm run dev
```

By default, the app runs at `http://localhost:3000`.

## Scripts

- `npm run dev`: start development server (`--host 0.0.0.0`, port `3000`)
- `npm run build`: build for production
- `npm run preview`: preview production build locally
- `npm run lint`: type-check (`tsc --noEmit`)
- `npm run clean`: remove build artifacts (`dist`)

## Project Structure

```text
src/
  components/      # Main UI: Generator, Decoder, Guide...
  workers/         # uuid-worker.ts (batch generation)
  lib/             # parser/utilities
  store/           # Zustand store
  data/            # version descriptions and metadata
docs/
  README.md
  FEATURES.md
  ARCHITECTURE.md
```

## Detailed Docs

- [Docs overview](./docs/README.md)
- [Features](./docs/FEATURES.md)
- [Architecture](./docs/ARCHITECTURE.md)


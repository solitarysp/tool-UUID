# Architecture & Technical Stack

## Core Technologies

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (with Dark Mode support via context)
- **State Management**: Zustand
- **Animations**: motion/react (framer-motion)
- **Icons**: Lucide React
- **List Virtualization**: @tanstack/react-virtual

## Key Components

### `UuidGenerator.tsx`

Handles the primary interface for creating identifiers:

- Mounts and coordinates state updates through `uuidStore`.
- Defers generation to a background service worker using a debounced polling method to maintain browser thread capabilities.
- Incorporates a virtualized list `rowVirtualizer` optimizing DOM memory allocation by rendering only the exact components currently inside the window layout.
- Spawns a modal displaying the `UuidParseResult` component when inspecting an inline generated token.

### `UuidDecoder.tsx` & `UuidParseResult.tsx`

Orchestrates decoding logics:

- Validates URL parameters via Hash router, leveraging Base64 encoding.
- Imports `uuid-parser.ts` to logically detect string variations (e.g., standard regex scans vs standard schema extraction).
- Dynamically allocates `.csv` export blob strings directly onto the browser file systems.

### `uuid-parser.ts` (Lib)

Serves as the parsing engine. Detects and normalizes identifiers checking for variants, version types (including Nil and Max UUIDs checks), embedded UNIX timestamps, and Snowflake/ULID specific derivations.

### `uuidStore.ts` (Store)

Implements lightweight component state abstraction via `zustand`, persisting core generator options out of the immediate component tree to prevent catastrophic resets on page layouts.

### Web Worker (`uuid-worker.ts`)

Decouples cryptographic load limits from the presentation thread. A unified event listener responds to `postMessage` requests dynamically fetching or returning batch string arrays back to the Generator layout.

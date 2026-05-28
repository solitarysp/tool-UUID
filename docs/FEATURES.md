# Universal Identifier Swiss Army Knife

## Features Overview

This application serves as a comprehensive tool for both generating and decoding various types of universal identifiers.

### 1. Advanced Generator

The Generator tool allows users to generate mass quantities of identifiers with specialized configurations.

- **Supported Formats**:
  - Standard UUIDs (v1, v3, v4, v5, v6, v7)
  - NanoID
  - CUID2
  - ULID
- **Customization Options**:
  - Format toggles: Uppercase, hyphenated, wrapped in braces etc.
  - Namespaces: Automatically formats DNS, URL, OID, or X500 namespaces for v3/v5 UUIDs alongside custom namespaces.
- **Smart Generation**:
  - Operations are offloaded to a **background Web Worker** ensuring the main UI string never freezes or lags, even when generating thousands of signatures.
  - Debounced auto-generation (500ms delay) enables live preview of identifier formats.
- **Interactive Outcomes**:
  - Virtualized list rendering manages large datasets efficiently across viewports.
  - Quick-copy all or individual rows.
  - Inspect individual identifiers by clicking the "Search/Decode" action which loads the Decoder module seamlessly via a modal.

### 2. Batch Decoder

The Decoder tool allows for deep inspection and validation of identifiers. It identifies the origin protocol, format validity, and extracts embedded timestamps.

- **Supported Inspection Types**: Includes all UUID specs + NanoID, CUID2, ULID, and Snowflake IDs (defaulting to the standard Twitter Epoch).
- **Embedded Timestamp Extraction**: Specifically pulls exact millisecond timestamps from:
  - UUID v1, v6 (Gregorian epoch parsing)
  - UUID v7 (Unix epoch parsing)
  - ULID (Crockford Base32 extraction)
  - Snowflake IDs
- **Batch Processing**:
  - Supports large inputs separated by commas, newlines, or structured as JSON arrays.
  - Users can upload `.txt`, `.csv`, or `.json` files directly.
  - Demo files are available for quick testing.
- **Export and Collaboration**:
  - Output results to a strictly formatted `.csv` for secondary analysis.
  - Generates a shareable URL hash comprising a Base64-encoded snapshot of the batch input, allowing frictionless collaboration.

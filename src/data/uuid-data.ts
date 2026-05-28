export type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'nil' | 'max' | 'ulid' | 'nanoid' | 'cuid2' | 'snowflake';

export const DESCRIPTIONS: Record<UuidVersion, {title: string, desc: string, details: string, algorithm: string, useCase: string, example: string, guideCodeExample: string}> = {
  v1: { 
    title: "UUID v1", 
    desc: "Time-based. Contains MAC address and timestamp. Predictable.", 
    details: "Generated from the current computational time and a node ID (usually the MAC address). Because it includes the MAC address, it can be traced back to the machine that generated it.", 
    algorithm: "Combines a 60-bit timestamp (number of 100ns intervals since Oct 15, 1582) and a 48-bit node identity (MAC address). A 14-bit clock sequence prevents duplicates if the clock rolls backward.",
    useCase: "Legacy systems requiring chronologically ordered identifiers or multi-node systems where node tracking is necessary. Not recommended for modern systems due to privacy concerns (exposes MAC address).",
    example: "719f9b5c-b984-11ed-afa1-0242ac120002",
    guideCodeExample: `import { v1 as uuidv1 } from 'uuid';\n\nconst id = uuidv1();\n// '719f9b5c-b984-11ed-afa1-0242ac120002'`
  },
  v3: { 
    title: "UUID v3", 
    desc: "MD5 hash based on a namespace and string. Consistent output for given inputs.", 
    details: "Generates a deterministic UUID using MD5 hashing of a namespace and name. If you use the same namespace and name, you'll always get the same UUID.", 
    algorithm: "Computes the MD5 hash of a namespace UUID concatenated with a name string. The resulting 128-bit hash is modified to set the version (3) and variant bits.",
    useCase: "When you need reproducible identifiers across different systems or runs, mapped from unique names (like a URL, FQDN, or object ID).",
    example: "a3bb189e-8bf9-3888-9912-ace4e6543002",
    guideCodeExample: `import { v3 as uuidv3 } from 'uuid';\n\n// using predefined DNS namespace (for example)\nconst MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';\nconst id = uuidv3('Hello, World!', MY_NAMESPACE);\n// 'a3bb189e-8bf9-3888-9912-ace4e6543002'`
  },
  v4: { 
    title: "UUID v4", 
    desc: "Randomly generated using secure PRNG. Most common standard UUID.", 
    details: "Completely random sequence generated using cryptographic random number generators. It is the most commonly used UUID version with almost zero chance of collision.", 
    algorithm: "Generates 122 bits of cryptographically secure random data. The remaining 6 bits are fixed to indicate the version (4) and the variant (RFC 4122).",
    useCase: "General-purpose identifiers, session tokens, API keys, and anywhere you need a unique, unguessable ID without relying on time or machine identity.",
    example: "493d7c35-3c1d-4447-9275-c6375bc983cc",
    guideCodeExample: `import { v4 as uuidv4 } from 'uuid';\n\nconst id = uuidv4();\n// '493d7c35-3c1d-4447-9275-c6375bc983cc'`
  },
  v5: { 
    title: "UUID v5", 
    desc: "SHA-1 hash based on a namespace and string. Better than v3.", 
    details: "Similar to v3, but uses the more secure SHA-1 hashing algorithm instead of MD5. It is also deterministic.", 
    algorithm: "Computes the SHA-1 hash of a namespace UUID concatenated with a name string. The 160-bit hash is truncated to 128 bits, and specific bits are altered for version (5) and variant.",
    useCase: "Same as v3, but preferred over v3 when security and lower collision probability in the hashing algorithm are prioritized.",
    example: "807bdad8-d227-5ea0-880c-e6fcbb95c555",
    guideCodeExample: `import { v5 as uuidv5 } from 'uuid';\n\nconst MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';\nconst id = uuidv5('Hello, World!', MY_NAMESPACE);\n// '807bdad8-d227-5ea0-880c-e6fcbb95c555'`
  },
  v6: { 
    title: "UUID v6", 
    desc: "Time-based, lexicographically sortable. Reordered version of v1.", 
    details: "A re-ordering of UUIDv1 so that the timestamp parts are strictly ordered from most to least significant, making it sortable in standard databases while still containing the MAC address.", 
    algorithm: "Takes the exact same field values as a v1 UUID, but reorganizes the timestamp fields (time_low, time_mid, time_hi) so the most significant bits come first, allowing natural byte/string sorting.",
    useCase: "Migrating from legacy systems using v1 UUIDs to a sortable format without losing the MAC address metadata constraints.",
    example: "1edb9847-19f9-6b5c-afa1-0242ac120002",
    guideCodeExample: `import { v6 as uuidv6 } from 'uuid';\n\nconst id = uuidv6();\n// '1edb9847-19f9-6b5c-afa1-0242ac120002'`
  },
  v7: { 
    title: "UUID v7", 
    desc: "Time-based, chronological. Highly recommended for database primary keys.", 
    details: "Features a time-ordered value field. It is designed to be used as a primary key in databases. Since it is time-ordered, it improves locality of reference and database performance.", 
    algorithm: "A 48-bit Unix timestamp (milliseconds) occupies the most significant bits. The remaining 74 bits are cryptographically secure random numbers. Includes version (7) and variant bits.",
    useCase: "Modern databases and distributed systems where indexing performance, localized insertions (avoiding B-tree fragmentation), and sortability are critical.",
    example: "01869e5d-7a32-7fd8-8c1d-4e9dfc985fa0",
    guideCodeExample: `import { v7 as uuidv7 } from 'uuid';\n\nconst id = uuidv7();\n// '01869e5d-7a32-7fd8-8c1d-4e9dfc985fa0'`
  },
  nil: { 
    title: "NIL UUID", 
    desc: "Empty UUID containing all zeros.", 
    details: "A special case UUID that has all 128 bits set to zero. It is often used to represent an unknown or uninitialized UUID.", 
    algorithm: "Hardcoded generation: 128 bits of 0.",
    useCase: "Used as a placeholder or sentinel value in databases or code indicating 'no ID', 'unassigned', or 'empty'.",
    example: "00000000-0000-0000-0000-000000000000",
    guideCodeExample: `import { NIL as nilUuid } from 'uuid';\n\nconsole.log(nilUuid);\n// '00000000-0000-0000-0000-000000000000'`
  },
  max: { 
    title: "MAX UUID", 
    desc: "Full UUID containing all ones.", 
    details: "A special case UUID that has all 128 bits set to one.", 
    algorithm: "Hardcoded generation: 128 bits of 1.",
    useCase: "Used primarily for querying bounds, representing the absolute maximum possible UUID value in range queries.",
    example: "ffffffff-ffff-ffff-ffff-ffffffffffff",
    guideCodeExample: `import { MAX as maxUuid } from 'uuid';\n\nconsole.log(maxUuid);\n// 'ffffffff-ffff-ffff-ffff-ffffffffffff'`
  },
  ulid: { 
    title: "ULID", 
    desc: "Sortable, 26-char base32 string. Great for horizontal scalability.", 
    details: "Universally Unique Lexicographically Sortable Identifier. Uses base32 encoding (no confusing characters like I, L, O, U) and is slightly shorter than UUIDs.", 
    algorithm: "Combines a 48-bit Unix timestamp (milliseconds) with an 80-bit random sequence. It is then encoded as a 26-character Base32 string (using Crockford's Base32).",
    useCase: "Used extensively in large-scale cloud applications where sortable, collision-free, short, and URL-safe strings are required.",
    example: "01GE3M77X04HK8QG9E47167WMJ",
    guideCodeExample: `import { ulid } from 'ulid';\n\nconst id = ulid();\n// '01GE3M77X04HK8QG9E47167WMJ'`
  },
  nanoid: { 
    title: "NanoID", 
    desc: "Tiny, secure, URL-friendly unique string generator.", 
    details: "A compact string ID generator. 21 characters by default. Faster than UUIDv4 and uses a larger alphabet to achieve similar collision resistance in a smaller output.", 
    algorithm: "Generates secure random bytes, then maps them against a 64-character URL-friendly alphabet (A-Za-z0-9_-) to produce a highly compact string representation.",
    useCase: "Ideal for short URLs, fast client-side ID generation, and environments where payload size is heavily constrained (e.g. mobile, edge devices).",
    example: "V1StGXR8_Z5jdHi6B-myT",
    guideCodeExample: `import { nanoid } from 'nanoid';\n\nconst id = nanoid();\n// 'V1StGXR8_Z5jdHi6B-myT'`
  },
  cuid2: { 
    title: "CUID2", 
    desc: "Collision-resistant ids optimized for horizontal scaling.", 
    details: "Secure, collision-resistant ids optimized for horizontal scaling and performance. Not vulnerable to machine specific timing attacks.", 
    algorithm: "Combines a random entropy pool, session counter, and a machine fingerprint, then runs them through a secure hash function (like SHA-3) to ensure unpredictability.",
    useCase: "Excellent for web applications handling high concurrency where you need security against ID-guessing enumeration attacks and want robust collision prevention.",
    example: "tz4a98xxat96iwsdz6zufidl",
    guideCodeExample: `import { createId } from '@paralleldrive/cuid2';\n\nconst id = createId();\n// 'tz4a98xxat96iwsdz6zufidl'`
  },
  snowflake: { 
    title: "Snowflake", 
    desc: "64-bit time-sortable integer. Very fast.", 
    details: "A 64-bit integer designed to be highly scalable and sortable by time. Contains a timestamp, a worker ID, and a sequence number. Fits into a database BIGINT.", 
    algorithm: "Bitwise composition: 41-bit timestamp (ms since a custom epoch), 10-bit machine/worker ID, and a 12-bit sequence number incrementing per millisecond.",
    useCase: "Massively distributed, ultra-high-throughput systems (like Twitter, Discord, Instagram) requiring ordered IDs that can be native 64-bit integers in databases.",
    example: "1627583617300754432",
    guideCodeExample: `// Implementation of Snowflake generation\n\nlet sequence = 0;\nlet lastTimestamp = -1;\nfunction nextId() {\n  let timestamp = Date.now();\n  if (timestamp === lastTimestamp) {\n    sequence = (sequence + 1) & 4095;\n    if (sequence === 0) {\n      while (timestamp <= lastTimestamp) { timestamp = Date.now(); }\n    }\n  } else {\n    sequence = 0;\n  }\n  lastTimestamp = timestamp;\n  // 1288834974657n is Twitter Epoch\n  return ((BigInt(timestamp) - 1288834974657n) << 22n) | (1n << 12n) | BigInt(sequence);\n}`
  }
};

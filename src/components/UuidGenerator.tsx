import React, { useState, useEffect, useCallback } from 'react';
import { v1, v3, v4, v5, v6, v7, v1ToV6, NIL, MAX, validate } from 'uuid';
import { ulid } from 'ulid';
import { nanoid } from 'nanoid';
import { createId as cuid2 } from '@paralleldrive/cuid2';
import { Copy, RefreshCw, Settings, Check, Settings2, Moon, Sun, Monitor, Info, BookOpen, X, Menu, FileText, FileSpreadsheet } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from './ThemeProvider';

type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'nil' | 'max' | 'ulid' | 'nanoid' | 'cuid2' | 'snowflake';
type NamespaceType = 'dns' | 'url' | 'oid' | 'x500' | 'custom';

const DESCRIPTIONS: Record<UuidVersion, {title: string, desc: string, details: string, algorithm: string, useCase: string, example: string}> = {
  v1: { 
    title: "UUID v1", 
    desc: "Time-based. Contains MAC address and timestamp. Predictable.", 
    details: "Generated from the current computational time and a node ID (usually the MAC address). Because it includes the MAC address, it can be traced back to the machine that generated it.", 
    algorithm: "Combines a 60-bit timestamp (number of 100ns intervals since Oct 15, 1582) and a 48-bit node identity (MAC address). A 14-bit clock sequence prevents duplicates if the clock rolls backward.",
    useCase: "Legacy systems requiring chronologically ordered identifiers or multi-node systems where node tracking is necessary. Not recommended for modern systems due to privacy concerns (exposes MAC address).",
    example: "719f9b5c-b984-11ed-afa1-0242ac120002" 
  },
  v3: { 
    title: "UUID v3", 
    desc: "MD5 hash based on a namespace and string. Consistent output for given inputs.", 
    details: "Generates a deterministic UUID using MD5 hashing of a namespace and name. If you use the same namespace and name, you'll always get the same UUID.", 
    algorithm: "Computes the MD5 hash of a namespace UUID concatenated with a name string. The resulting 128-bit hash is modified to set the version (3) and variant bits.",
    useCase: "When you need reproducible identifiers across different systems or runs, mapped from unique names (like a URL, FQDN, or object ID).",
    example: "a3bb189e-8bf9-3888-9912-ace4e6543002" 
  },
  v4: { 
    title: "UUID v4", 
    desc: "Randomly generated using secure PRNG. Most common standard UUID.", 
    details: "Completely random sequence generated using cryptographic random number generators. It is the most commonly used UUID version with almost zero chance of collision.", 
    algorithm: "Generates 122 bits of cryptographically secure random data. The remaining 6 bits are fixed to indicate the version (4) and the variant (RFC 4122).",
    useCase: "General-purpose identifiers, session tokens, API keys, and anywhere you need a unique, unguessable ID without relying on time or machine identity.",
    example: "493d7c35-3c1d-4447-9275-c6375bc983cc" 
  },
  v5: { 
    title: "UUID v5", 
    desc: "SHA-1 hash based on a namespace and string. Better than v3.", 
    details: "Similar to v3, but uses the more secure SHA-1 hashing algorithm instead of MD5. It is also deterministic.", 
    algorithm: "Computes the SHA-1 hash of a namespace UUID concatenated with a name string. The 160-bit hash is truncated to 128 bits, and specific bits are altered for version (5) and variant.",
    useCase: "Same as v3, but preferred over v3 when security and lower collision probability in the hashing algorithm are prioritized.",
    example: "807bdad8-d227-5ea0-880c-e6fcbb95c555" 
  },
  v6: { 
    title: "UUID v6", 
    desc: "Time-based, lexicographically sortable. Reordered version of v1.", 
    details: "A re-ordering of UUIDv1 so that the timestamp parts are strictly ordered from most to least significant, making it sortable in standard databases while still containing the MAC address.", 
    algorithm: "Takes the exact same field values as a v1 UUID, but reorganizes the timestamp fields (time_low, time_mid, time_hi) so the most significant bits come first, allowing natural byte/string sorting.",
    useCase: "Migrating from legacy systems using v1 UUIDs to a sortable format without losing the MAC address metadata constraints.",
    example: "1edb9847-19f9-6b5c-afa1-0242ac120002" 
  },
  v7: { 
    title: "UUID v7", 
    desc: "Time-based, chronological. Highly recommended for database primary keys.", 
    details: "Features a time-ordered value field. It is designed to be used as a primary key in databases. Since it is time-ordered, it improves locality of reference and database performance.", 
    algorithm: "A 48-bit Unix timestamp (milliseconds) occupies the most significant bits. The remaining 74 bits are cryptographically secure random numbers. Includes version (7) and variant bits.",
    useCase: "Modern databases and distributed systems where indexing performance, localized insertions (avoiding B-tree fragmentation), and sortability are critical.",
    example: "01869e5d-7a32-7fd8-8c1d-4e9dfc985fa0" 
  },
  nil: { 
    title: "NIL UUID", 
    desc: "Empty UUID containing all zeros.", 
    details: "A special case UUID that has all 128 bits set to zero. It is often used to represent an unknown or uninitialized UUID.", 
    algorithm: "Hardcoded generation: 128 bits of 0.",
    useCase: "Used as a placeholder or sentinel value in databases or code indicating 'no ID', 'unassigned', or 'empty'.",
    example: "00000000-0000-0000-0000-000000000000" 
  },
  max: { 
    title: "MAX UUID", 
    desc: "Full UUID containing all ones.", 
    details: "A special case UUID that has all 128 bits set to one.", 
    algorithm: "Hardcoded generation: 128 bits of 1.",
    useCase: "Used primarily for querying bounds, representing the absolute maximum possible UUID value in range queries.",
    example: "ffffffff-ffff-ffff-ffff-ffffffffffff" 
  },
  ulid: { 
    title: "ULID", 
    desc: "Sortable, 26-char base32 string. Great for horizontal scalability.", 
    details: "Universally Unique Lexicographically Sortable Identifier. Uses base32 encoding (no confusing characters like I, L, O, U) and is slightly shorter than UUIDs.", 
    algorithm: "Combines a 48-bit Unix timestamp (milliseconds) with an 80-bit random sequence. It is then encoded as a 26-character Base32 string (using Crockford's Base32).",
    useCase: "Used extensively in large-scale cloud applications where sortable, collision-free, short, and URL-safe strings are required.",
    example: "01GE3M77X04HK8QG9E47167WMJ" 
  },
  nanoid: { 
    title: "NanoID", 
    desc: "Tiny, secure, URL-friendly unique string generator.", 
    details: "A compact string ID generator. 21 characters by default. Faster than UUIDv4 and uses a larger alphabet to achieve similar collision resistance in a smaller output.", 
    algorithm: "Generates secure random bytes, then maps them against a 64-character URL-friendly alphabet (A-Za-z0-9_-) to produce a highly compact string representation.",
    useCase: "Ideal for short URLs, fast client-side ID generation, and environments where payload size is heavily constrained (e.g. mobile, edge devices).",
    example: "V1StGXR8_Z5jdHi6B-myT" 
  },
  cuid2: { 
    title: "CUID2", 
    desc: "Collision-resistant ids optimized for horizontal scaling.", 
    details: "Secure, collision-resistant ids optimized for horizontal scaling and performance. Not vulnerable to machine specific timing attacks.", 
    algorithm: "Combines a random entropy pool, session counter, and a machine fingerprint, then runs them through a secure hash function (like SHA-3) to ensure unpredictability.",
    useCase: "Excellent for web applications handling high concurrency where you need security against ID-guessing enumeration attacks and want robust collision prevention.",
    example: "tz4a98xxat96iwsdz6zufidl" 
  },
  snowflake: { 
    title: "Snowflake", 
    desc: "64-bit time-sortable integer. Very fast.", 
    details: "A 64-bit integer designed to be highly scalable and sortable by time. Contains a timestamp, a worker ID, and a sequence number. Fits into a database BIGINT.", 
    algorithm: "Bitwise composition: 41-bit timestamp (ms since a custom epoch), 10-bit machine/worker ID, and a 12-bit sequence number incrementing per millisecond.",
    useCase: "Massively distributed, ultra-high-throughput systems (like Twitter, Discord, Instagram) requiring ordered IDs that can be native 64-bit integers in databases.",
    example: "1627583617300754432" 
  }
};

let sfSequence = 0;
let sfLastTimestamp = -1;
function generateSnowflake(): string {
  let timestamp = Date.now();
  if (timestamp === sfLastTimestamp) {
    sfSequence = (sfSequence + 1) & 4095;
    if (sfSequence === 0) {
      while (Date.now() <= timestamp) {} // Wait to avoid collision
      timestamp = Date.now();
    }
  } else {
    sfSequence = 0;
  }
  sfLastTimestamp = timestamp;
  const epoch = 1288834974657n; // Twitter Epoch
  const time = BigInt(timestamp) - epoch;
  return ((time << 22n) | (1n << 12n) | BigInt(sfSequence)).toString();
}

interface GeneratorOptions {
  version: UuidVersion;
  quantity: number;
  uppercase: boolean;
  hyphens: boolean;
  braces: boolean;
  namespaceType: NamespaceType;
  customNamespace: string;
  nameValue: string;
}

const DEFAULT_OPTIONS: GeneratorOptions = {
  version: 'v4',
  quantity: 10,
  uppercase: false,
  hyphens: true,
  braces: false,
  namespaceType: 'dns',
  customNamespace: '',
  nameValue: '',
};

const NAMESPACES = {
  dns: v3.DNS,
  url: v3.URL,
  oid: undefined, // Will be hardcoded if needed or just use standard
  x500: undefined,
};

// Hardcoded standard namespaces just in case
const NS_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const NS_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
const NS_OID = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
const NS_X500 = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';

export default function UuidGenerator() {
  const [options, setOptions] = useState<GeneratorOptions>(DEFAULT_OPTIONS);
  const [generatedItems, setGeneratedItems] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

  // Generate UUIDs based on options
  const generateUuids = useCallback(() => {
    const { version, quantity, uppercase, hyphens, braces, namespaceType, customNamespace, nameValue } = options;
    const newItems: string[] = [];

    // Resolve namespace
    let resolvedNamespace = NS_DNS;
    if (namespaceType === 'url') resolvedNamespace = NS_URL;
    else if (namespaceType === 'oid') resolvedNamespace = NS_OID;
    else if (namespaceType === 'x500') resolvedNamespace = NS_X500;
    else if (namespaceType === 'custom') {
        if (customNamespace && validate(customNamespace)) {
            resolvedNamespace = customNamespace;
        } else {
            // fallback if invalid
            resolvedNamespace = NS_DNS;
        }
    }

    const safeName = nameValue || 'example';

    try {
      for (let i = 0; i < quantity; i++) {
        let id = '';
        switch (version) {
          case 'v1':
            id = v1();
            break;
          case 'v3':
            id = v3(safeName, resolvedNamespace);
            break;
          case 'v4':
            id = v4();
            break;
          case 'v5':
            id = v5(safeName, resolvedNamespace);
            break;
          case 'v6':
            id = v6 ? v6() : v1ToV6 ? v1ToV6(v1()) : v4();
            break;
          case 'v7':
            // Check if v7 is available, if not fallback to v4 or throw
            id = v7 ? v7() : v4(); 
            break;
          case 'nil':
            id = NIL;
            break;
          case 'max':
            // If MAX is available in the library use it, otherwise use constant
            id = MAX || 'ffffffff-ffff-ffff-ffff-ffffffffffff';
            break;
          case 'ulid':
            id = ulid();
            break;
          case 'nanoid':
            id = nanoid();
            break;
          case 'cuid2':
            id = cuid2();
            break;
          case 'snowflake':
            id = generateSnowflake();
            break;
          default:
            id = v4();
        }

        // Apply formatting (only if it's a UUID version that has hyphens by default, but let's apply across if possible)
        if (!hyphens && ['v1', 'v3', 'v4', 'v5', 'v6', 'v7', 'nil', 'max'].includes(version)) {
          id = id.replace(/-/g, '');
        }
        if (uppercase && ['v1', 'v3', 'v4', 'v5', 'v6', 'v7', 'nil', 'max'].includes(version) || version === 'ulid' && uppercase) {
          id = id.toUpperCase();
        }
        if (braces && ['v1', 'v3', 'v4', 'v5', 'v6', 'v7', 'nil', 'max'].includes(version)) {
          id = `{${id}}`;
        }

        newItems.push(id);
      }
    } catch (e) {
      console.error("Error generating UUID:", e);
      newItems.push("Error generating UUIDs with current parameters");
    }

    setGeneratedItems(newItems);
  }, [options]);

  // Initial generation
  useEffect(() => {
    generateUuids();
  }, [generateUuids]);

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const exportToTxt = () => {
    if (generatedItems.length === 0) return;
    const content = generatedItems.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${options.version}-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCsv = () => {
    if (generatedItems.length === 0) return;
    const content = `Index,UUID,Type\n` + generatedItems.map((id, index) => `${index + 1},${id},${options.version}`).join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${options.version}-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOptionChange = <K extends keyof GeneratorOptions>(
    key: K,
    value: GeneratorOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const needsNamespace = options.version === 'v3' || options.version === 'v5';
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col h-full w-full">
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1219] flex items-center justify-between px-4 sm:px-6 shrink-0 transition-colors duration-200 z-30 relative">
        <div className="flex items-center gap-3">
          <button 
             onClick={() => setIsMobileSettingsOpen(!isMobileSettingsOpen)}
             className="md:hidden p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isMobileSettingsOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-sm hidden md:flex">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">UUID <span className="text-blue-500 dark:text-blue-400">Generator</span></span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-widest hidden lg:block">
            UNIVERSAL UNIQUE IDENTIFIERS
          </div>
          <button 
             onClick={() => setIsGuideOpen(true)}
             className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
             <BookOpen className="w-4 h-4" />
             <span className="hidden sm:inline">Guide</span>
          </button>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
             <button onClick={() => setTheme('light')} className={cn("p-1.5 rounded-md transition-colors", theme === 'light' ? "bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300")} title="Light Mode">
               <Sun className="w-3.5 h-3.5" />
             </button>
             <button onClick={() => setTheme('system')} className={cn("p-1.5 rounded-md transition-colors", theme === 'system' ? "bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300")} title="System Mode">
               <Monitor className="w-3.5 h-3.5" />
             </button>
             <button onClick={() => setTheme('dark')} className={cn("p-1.5 rounded-md transition-colors", theme === 'dark' ? "bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300")} title="Dark Mode">
               <Moon className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        {/* Mobile Backdrop */}
        {isMobileSettingsOpen && (
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-10 md:hidden transition-opacity"
            onClick={() => setIsMobileSettingsOpen(false)}
          />
        )}

        {/* Settings Sidebar */}
        <aside className={cn(
          "absolute md:relative z-20 md:z-auto h-full w-[280px] md:w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1219] p-5 flex flex-col gap-6 shrink-0 overflow-y-auto transition-transform duration-300 md:translate-x-0 shadow-2xl md:shadow-none",
          isMobileSettingsOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <section>
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-3 block tracking-wider">
              UUID Version
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'v1', label: 'UUID v1' },
                { value: 'v3', label: 'UUID v3' },
                { value: 'v4', label: 'UUID v4' },
                { value: 'v5', label: 'UUID v5' },
                { value: 'v6', label: 'UUID v6' },
                { value: 'v7', label: 'UUID v7' },
                { value: 'ulid', label: 'ULID' },
                { value: 'nanoid', label: 'NanoID' },
                { value: 'cuid2', label: 'CUID2' },
                { value: 'snowflake', label: 'Snowflake' },
                { value: 'nil', label: 'NIL' },
                { value: 'max', label: 'MAX' },
              ].map((v) => (
                <button
                  key={v.value}
                  onClick={() => handleOptionChange('version', v.value as UuidVersion)}
                  className={cn(
                    "px-3 py-2 rounded text-xs text-left font-medium transition-colors",
                    options.version === v.value
                      ? "bg-blue-50 dark:bg-blue-600/10 border border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
            
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded flex gap-2 border border-slate-100 dark:border-slate-800 transition-colors">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{DESCRIPTIONS[options.version].title}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{DESCRIPTIONS[options.version].desc}</div>
              </div>
            </div>
          </section>

          {/* Namespace settings for v3/v5 */}
          <AnimatePresence>
            {needsNamespace && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block tracking-wider">
                    Namespace Type
                  </label>
                  <select
                    value={options.namespaceType}
                    onChange={(e) => handleOptionChange('namespaceType', e.target.value as NamespaceType)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded text-xs p-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value="dns">DNS (Fully qualified domain)</option>
                    <option value="url">URL</option>
                    <option value="oid">OID (ISO OID)</option>
                    <option value="x500">X.500 (DN)</option>
                    <option value="custom">Custom Namespace (UUID)</option>
                  </select>
                </div>

                {options.namespaceType === 'custom' && (
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block tracking-wider">
                      Custom Namespace (UUID)
                    </label>
                    <input
                      type="text"
                      value={options.customNamespace}
                      onChange={(e) => handleOptionChange('customNamespace', e.target.value)}
                      placeholder="Valid UUID..."
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded text-xs p-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block tracking-wider">
                    Name String
                  </label>
                  <input
                    type="text"
                    value={options.nameValue}
                    onChange={(e) => handleOptionChange('nameValue', e.target.value)}
                    placeholder="Enter string to hash..."
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded text-xs p-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <section className="space-y-4">
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block tracking-wider">Configuration</label>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-600 dark:text-slate-400">Quantity</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono font-medium">{options.quantity}</span>
              </div>
              <input
                type="range"
                min="1"
                max="500"
                value={options.quantity}
                onChange={(e) => handleOptionChange('quantity', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
              />
            </div>
            
            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-300 font-medium transition-colors">Include Hyphens</span>
                <input
                  type="checkbox"
                  checked={options.hyphens}
                  onChange={(e) => handleOptionChange('hyphens', e.target.checked)}
                  className="w-4 h-4 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 accent-blue-500 cursor-pointer transition-colors"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-300 font-medium transition-colors">Uppercase Output</span>
                <input
                  type="checkbox"
                  checked={options.uppercase}
                  onChange={(e) => handleOptionChange('uppercase', e.target.checked)}
                  className="w-4 h-4 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 accent-blue-500 cursor-pointer transition-colors"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-300 font-medium transition-colors">Include Braces</span>
                <input
                  type="checkbox"
                  checked={options.braces}
                  onChange={(e) => handleOptionChange('braces', e.target.checked)}
                  className="w-4 h-4 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 accent-blue-500 cursor-pointer transition-colors"
                />
              </label>
            </div>
          </section>
          
          <section className="mt-auto pt-5 border-t border-slate-200 dark:border-slate-800">
            <button
               onClick={() => {
                 generateUuids();
                 if (window.innerWidth < 768) setIsMobileSettingsOpen(false);
               }}
               className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-xs rounded font-bold text-white shadow-md shadow-blue-500/20 dark:shadow-blue-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              Generate New
            </button>
          </section>
        </aside>

        {/* Main Editor/Result Area */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
              <span className="hidden sm:inline">Output Terminal</span>
              <span className="sm:hidden">Terminal</span>
            </h2>
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={exportToTxt}
                title="Export as TXT"
                className="p-1.5 sm:px-3 sm:py-1.5 bg-white dark:bg-slate-800 text-xs rounded border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">TXT</span>
              </button>
              <button
                onClick={exportToCsv}
                title="Export as CSV"
                className="p-1.5 sm:px-3 sm:py-1.5 bg-white dark:bg-slate-800 text-xs rounded border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CSV</span>
              </button>
              <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-0.5 sm:mx-1 self-center"></div>
              <button
                onClick={() => copyToClipboard(generatedItems.join('\n'))}
                className="px-3 sm:px-4 py-1.5 bg-white dark:bg-slate-800 text-xs rounded border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 shadow-sm min-w-[90px] justify-center"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Panel */}
          <div className="flex-1 bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm p-0 flex flex-col overflow-hidden shadow-sm dark:shadow-2xl transition-colors duration-200">
            <div className="flex bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-2 text-[10px] uppercase text-slate-500 dark:text-slate-500 gap-2 sm:gap-4 shrink-0 transition-colors">
              <span className="w-6 sm:w-8 font-medium">#</span>
              <span className="flex-1 font-medium truncate">Value ({DESCRIPTIONS[options.version].title})</span>
              <span className="w-12 sm:w-20 text-right pr-2 sm:pr-4 font-medium">Action</span>
            </div>
            <div className="flex-1 overflow-y-auto bg-transparent">
              {generatedItems.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 font-medium py-20 text-xs sm:text-sm">
                  No UUIDs generated yet.
                </div>
              ) : (
                <div className="pb-2">
                  {generatedItems.map((id, index) => (
                    <div 
                      key={`${index}-${id}`} 
                      className="flex px-3 sm:px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group items-center gap-2 sm:gap-4"
                    >
                      <span className="w-6 sm:w-8 text-slate-400 dark:text-slate-600 text-[10px] sm:text-[11px] shrink-0">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="flex-1 text-slate-800 dark:text-blue-300 selection:bg-blue-500 selection:text-white truncate font-medium dark:font-normal text-[11px] sm:text-[13px] tracking-tight sm:tracking-normal">
                        {id}
                      </span>
                      <div className="w-12 sm:w-20 text-right pr-1 sm:pr-2">
                        <button
                          onClick={() => copyToClipboard(id, index)}
                          className={cn(
                            "p-1.5 rounded transition-all inline-flex",
                            copiedIndex === index 
                              ? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10" 
                              : "text-slate-400 dark:text-slate-500 opacity-100 sm:opacity-0 group-hover:opacity-100 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          )}
                          title="Copy to clipboard"
                        >
                          {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* System Status Bar */}
          <footer className="mt-4 flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded px-4 py-2 shrink-0 transition-colors duration-200 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> SYSTEM ONLINE
              </div>
              <span className="opacity-30 font-bold hidden sm:inline">|</span>
              <div className="hidden sm:block">TOTAL GENERATED: {generatedItems.length}</div>
            </div>
            <div className="text-slate-500 dark:text-slate-600">
              SECURE PRNG ACTIVE
            </div>
          </footer>
        </div>
      </main>
      
      {/* Guide Modal */}
      <AnimatePresence>
        {isGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsGuideOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 10 }}
               className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-tight">Identifier Types Guide</h3>
                    <p className="text-xs text-slate-500 font-medium">Detailed overviews and examples for each format</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGuideOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Object.keys(DESCRIPTIONS) as UuidVersion[]).map(key => {
                    const info = DESCRIPTIONS[key];
                    return (
                      <div key={key} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-blue-600 dark:text-blue-400 text-[15px]">{info.title}</h4>
                          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                            {key}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mb-3">{info.desc}</p>
                        
                        <div className="space-y-4 flex-1 mb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          <p>{info.details}</p>
                          
                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700/50">
                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1.5"><Settings2 size={12}/> Algorithm</div>
                            <p>{info.algorithm}</p>
                          </div>
                          
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><Check size={12}/> Use Case</div>
                            <p>{info.useCase}</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 rounded p-3 border border-slate-100 dark:border-slate-700/50 mt-auto">
                          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Example Output:</div>
                          <code className="text-[11px] font-mono text-slate-700 dark:text-slate-300 break-all">{info.example}</code>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

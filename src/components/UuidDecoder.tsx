import React, { useState } from 'react';
import { validate, version as getUuidVersion } from 'uuid';
import { Menu, X, Settings, BookOpen, Sun, Monitor, Moon, Search, FileText, Code2, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { cn } from '../lib/utils';
import { DESCRIPTIONS } from '../data/uuid-data';

export default function UuidDecoder() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
  const [inputUuid, setInputUuid] = useState('');

  const parseUuid = (uuidStr: string) => {
    const cleanUuid = uuidStr.trim();
    if (!cleanUuid) return null;

    if (cleanUuid === '00000000-0000-0000-0000-000000000000') {
      return { valid: true, type: 'nil', version: 'nil', note: 'NIL UUID (All zeros)' };
    }
    if (cleanUuid.toLowerCase() === 'ffffffff-ffff-ffff-ffff-ffffffffffff') {
      return { valid: true, type: 'max', version: 'max', note: 'MAX UUID (All ones)' };
    }

    const isUlid = /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(cleanUuid);
    const isNanoId = /^[A-Za-z0-9_-]{21}$/.test(cleanUuid);
    const isCuid2 = /^[a-z0-9]{24}$/.test(cleanUuid);
    const isSnowflake = /^[0-9]{17,20}$/.test(cleanUuid);
    
    let isStandardUuid = validate(cleanUuid);
    let withHyphens = cleanUuid;
    
    // If missing hyphens but valid length, try to insert hyphens
    if (!isStandardUuid && /^[0-9a-fA-F]{32}$/.test(cleanUuid)) {
      withHyphens = `${cleanUuid.slice(0, 8)}-${cleanUuid.slice(8, 12)}-${cleanUuid.slice(12, 16)}-${cleanUuid.slice(16, 20)}-${cleanUuid.slice(20)}`;
      if (validate(withHyphens)) {
        isStandardUuid = true;
      }
    }

    if (!isStandardUuid) {
      if (isUlid) {
         try {
           const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
           const timeStr = cleanUuid.substring(0, 10).toUpperCase();
           let time = 0;
           for (let i = 0; i < 10; i++) {
             time = time * 32 + CROCKFORD_BASE32.indexOf(timeStr[i]);
           }
           return { valid: true, type: 'ulid', version: 'ulid', date: new Date(time), note: 'This is a ULID.' };
         } catch(e) {
           return { valid: true, type: 'ulid', version: 'ulid', note: 'This is a ULID.' };
         }
      }
      if (isNanoId) {
         return { valid: true, type: 'nanoid', version: 'nanoid', note: 'This looks like a NanoID.' };
      }
      if (isCuid2) {
         return { valid: true, type: 'cuid2', version: 'cuid2', note: 'This looks like a CUID2.' };
      }
      if (isSnowflake) {
         try {
           const val = BigInt(cleanUuid);
           const ms = Number(val >> 22n) + 1288834974657; // Default twitter epoch
           return { valid: true, type: 'snowflake', version: 'snowflake', date: new Date(ms), note: 'This looks like a Snowflake ID (assuming Twitter Epoch).' };
         } catch (e) {
           return { valid: true, type: 'snowflake', version: 'snowflake', note: 'This looks like a Snowflake ID.' };
         }
      }
      return { valid: false, error: 'Invalid identifier format.' };
    }

    // Try to parse as UUID
    const normalized = withHyphens.replace(/-/g, '').toLowerCase();
    const ver = getUuidVersion(withHyphens);
    
    // Variant
    const variantChar = normalized.charAt(16);
    const variantInt = parseInt(variantChar, 16);
    let variantStr = 'Unknown';
    if (variantInt >= 0 && variantInt <= 7) variantStr = 'NCS backward compatibility (0 x x)';
    else if (variantInt >= 8 && variantInt <= 11) variantStr = 'RFC 4122 / DCE 1.1 (1 0 x)';
    else if (variantInt >= 12 && variantInt <= 13) variantStr = 'Microsoft Corporation (1 1 0)';
    else if (variantInt >= 14) variantStr = 'Reserved for Future Use (1 1 1)';

    let date: Date | null = null;
    let timeStr = '';

    try {
      if (ver === 1) {
          const time_low = normalized.substring(0, 8);
          const time_mid = normalized.substring(8, 12);
          const time_hi = normalized.substring(13, 16);
          const timeHex = time_hi + time_mid + time_low;
          const time100ns = BigInt('0x' + timeHex);
          const unixTimeMs = Number((time100ns - 122192928000000000n) / 10000n);
          date = new Date(unixTimeMs);
      } else if (ver === 6) {
          const time_high = normalized.substring(0, 8);
          const time_mid = normalized.substring(8, 12);
          const time_low = normalized.substring(13, 16);
          const timeHex = time_high + time_mid + time_low;
          const time100ns = BigInt('0x' + timeHex);
          const unixTimeMs = Number((time100ns - 122192928000000000n) / 10000n);
          date = new Date(unixTimeMs);
      } else if (ver === 7) {
          const timeHex = normalized.substring(0, 12);
          const unixTimeMs = Number(BigInt('0x' + timeHex));
          date = new Date(unixTimeMs);
      }
    } catch(e) {
      // Ignore timestamp parsing errors
    }

    return {
      valid: true,
      type: 'uuid',
      version: ver,
      variant: variantStr,
      date: date
    }
  };

  const parsed = parseUuid(inputUuid);

  return (
    <div className="flex flex-col h-full w-full">
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1219] flex items-center justify-between px-4 sm:px-6 shrink-0 transition-colors duration-200 z-30 relative">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-sm hidden md:flex">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">UUID <span className="text-blue-500 dark:text-blue-400">Generator</span></span>
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800/80">
            <button 
              onClick={() => navigate('/')} 
              className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Generator
            </button>
            <button 
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm transition-colors"
            >
              Decoder
            </button>
          </div>

          <button 
             onClick={() => navigate('/guide')}
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

      <main className="flex-1 overflow-y-auto w-full p-4 sm:p-8 flex justify-center">
        <div className="max-w-2xl w-full flex flex-col gap-6 pt-4 sm:pt-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">UUID Decoder</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Paste a UUID to parse its version, variant, and creation time (if applicable).</p>
          </div>

          <div className="bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm">
            <label className="text-xs uppercase font-bold text-slate-500 mb-2 block tracking-wider">
              ENTER UUID
            </label>
            <div className="relative">
              <input 
                type="text"
                value={inputUuid}
                onChange={(e) => setInputUuid(e.target.value)}
                placeholder="e.g. 018b3f2c-e160-7000-a1cf-b30f836173a1"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm p-4 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>

            <div className="mt-8">
              {inputUuid.trim() === '' ? (
                 <div className="text-center py-12 text-slate-400 dark:text-slate-500 flex flex-col items-center gap-3">
                    <Code2 className="w-8 h-8 opacity-50" />
                    <p className="text-sm font-medium">Waiting for input...</p>
                 </div>
              ) : parsed ? (
                 parsed.valid ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      {['ulid', 'nanoid', 'cuid2', 'snowflake', 'nil', 'max'].includes(parsed.type as string) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Type</div>
                            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                              {DESCRIPTIONS[String(parsed.version).toLowerCase() as keyof typeof DESCRIPTIONS]?.title || String(parsed.version).toUpperCase()}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {DESCRIPTIONS[String(parsed.version).toLowerCase() as keyof typeof DESCRIPTIONS]?.desc}
                            </div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-3 p-3 bg-white dark:bg-[#0F1219] rounded border border-slate-100 dark:border-slate-800">
                              {parsed.note}
                            </div>
                          </div>
                          {parsed.date && (
                            <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
                              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Creation Time (UTC)</div>
                              <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                {parsed.date.toUTCString()}
                              </div>
                              <div className="text-xs font-mono text-slate-500 mt-1">
                                UNIX Epoch: {parsed.date.getTime()} ms
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                Local time: {parsed.date.toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Version</div>
                            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                              Version {parsed.version} 
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {parsed.version !== null && DESCRIPTIONS[`v${parsed.version}` as keyof typeof DESCRIPTIONS]?.title || "Unknown Specification"}
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Variant</div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {parsed.variant}
                            </div>
                          </div>

                          {parsed.date ? (
                            <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
                              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Creation Time (UTC)</div>
                              <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                {parsed.date.toUTCString()}
                              </div>
                              <div className="text-xs font-mono text-slate-500 mt-1">
                                UNIX Epoch: {parsed.date.getTime()} ms
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                Local time: {parsed.date.toLocaleString()}
                              </div>
                            </div>
                          ) : (
                            <div className="sm:col-span-2 p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-200 border-dashed dark:border-slate-800 rounded-lg text-slate-500 text-xs text-center italic">
                               Time extraction is not available for UUID Version {parsed.version}. (Only v1, v6, v7 contain embedded timestamps).
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                 ) : (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-red-800 dark:text-red-400 text-sm flex gap-3">
                      <X className="w-5 h-5 shrink-0" />
                      <div>
                        <strong>Invalid Input:</strong> {parsed.error}
                      </div>
                    </div>
                 )
              ) : null}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Copy, RefreshCw, Settings, Check, Settings2, Moon, Sun, Monitor, Info, BookOpen, X, Menu, FileText, FileSpreadsheet, ArrowRight, Loader2, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from './ThemeProvider';
import { UuidVersion, DESCRIPTIONS } from '../data/uuid-data';
import { useNavigate } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { UuidParseResult } from './UuidParseResult';
import { parseUuid } from '../lib/uuid-parser';
import SeoHead from './SeoHead';
import {
  getBreadcrumbJsonLd,
  getOrganizationJsonLd,
  getSoftwareApplicationJsonLd,
  getWebsiteJsonLd,
} from '../lib/seo';

type NamespaceType = 'dns' | 'url' | 'oid' | 'x500' | 'custom';

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

import { useUuidStore } from '../store/uuidStore';

export default function UuidGenerator() {
  const navigate = useNavigate();
  const { options, setOptions, generatedItems, setGeneratedItems, isInitialLoad, setIsInitialLoad } = useUuidStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
  const [selectedDecodeUuid, setSelectedDecodeUuid] = useState<string | null>(null);
  
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/uuid-worker.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (e) => {
      setGeneratedItems(e.data.results);
      setIsGenerating(false);
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, [setGeneratedItems]);

  // Generate UUIDs based on options
  const generateUuids = useCallback((delay = 200) => {
    setIsGenerating(true);
    const timeout = setTimeout(() => {
      if (workerRef.current) {
        workerRef.current.postMessage({ options });
      }
    }, delay);
    return () => clearTimeout(timeout);
  }, [options]);

  const previousOptions = useRef(options);

  useEffect(() => {
    // If options changed, auto-generate with 500ms debounce
    if (previousOptions.current !== options) {
      previousOptions.current = options;
      return generateUuids(500);
    }
    
    // If we're here, it means we just mounted (options are same as initial).
    // If we have no items in the global store, generate immediately.
    // Otherwise, we do nothing and preserve existing items.
    if (generatedItems.length === 0) {
      return generateUuids(100);
    }
  }, [options, generateUuids, generatedItems.length]);


  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: generatedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 5,
  });

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
  const generatorDescription =
    'Generate UUIDs, ULIDs, NanoIDs, CUID2, and Snowflake IDs with batch export and formatting controls.';
  const generatorJsonLd = useMemo(
    () => [
      getWebsiteJsonLd(),
      getOrganizationJsonLd(),
      getSoftwareApplicationJsonLd('/', generatorDescription),
      getBreadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'UUID Generator', path: '/' },
      ]),
    ],
    [generatorDescription]
  );

  return (
    <div className="flex flex-col h-full w-full">
      <SeoHead
        title="UUID Generator"
        description={generatorDescription}
        pathname="/"
        jsonLd={generatorJsonLd}
      />
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1219] flex items-center justify-between px-4 sm:px-6 shrink-0 transition-colors duration-200 z-30 relative">
        <div className="flex items-center gap-3">
          <button 
             onClick={() => setIsMobileSettingsOpen(!isMobileSettingsOpen)}
             aria-label={isMobileSettingsOpen ? 'Close settings panel' : 'Open settings panel'}
             aria-expanded={isMobileSettingsOpen}
             aria-controls="generator-settings-panel"
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
          <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800/80">
            <button 
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm transition-colors"
            >
              Generator
            </button>
            <button 
              onClick={() => navigate('/decode')} 
              className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
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
        )} id="generator-settings-panel">
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
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {DESCRIPTIONS[options.version].desc}
                  <button onClick={() => navigate(`/guide/${options.version}`)} className="ml-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-0.5">
                    Read more <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
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
                <label htmlFor="quantity-input" className="text-slate-600 dark:text-slate-400 font-medium pt-1 mt-auto mb-auto">
                  Quantity
                </label>
                <input
                  id="quantity-input"
                  type="number"
                  min="1"
                  max="10000"
                  value={options.quantity}
                  onChange={(e) => {
                    let val = parseInt(e.target.value);
                    if (isNaN(val)) val = 1;
                    if (val > 10000) val = 10000;
                    if (val < 1) val = 1;
                    handleOptionChange('quantity', val);
                  }}
                  className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-right px-2 py-1 text-xs font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <input
                type="range"
                min="1"
                max="10000"
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
                 generateUuids(150);
                 if (window.innerWidth < 768) setIsMobileSettingsOpen(false);
               }}
               disabled={isGenerating}
               className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-xs rounded font-bold text-white shadow-md shadow-blue-500/20 dark:shadow-blue-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Generate New
                </>
              )}
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
            <div className="flex-1 bg-transparent overflow-y-auto" ref={parentRef}>
              {generatedItems.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 font-medium py-20 text-xs sm:text-sm">
                  No UUIDs generated yet.
                </div>
              ) : (
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const index = virtualRow.index;
                    const id = generatedItems[index];

                    return (
                      <div
                        key={virtualRow.key}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                        className="flex px-3 sm:px-4 py-2 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group items-center gap-2 sm:gap-4 box-border"
                      >
                        <span className="w-6 sm:w-8 text-slate-400 dark:text-slate-600 text-[10px] sm:text-[11px] shrink-0">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="flex-1 text-slate-800 dark:text-blue-300 selection:bg-blue-500 selection:text-white truncate font-medium dark:font-normal text-[11px] sm:text-[13px] tracking-tight sm:tracking-normal">
                          {id}
                        </span>
                        <div className="w-16 sm:w-24 flex items-center justify-end gap-1 pr-1 sm:pr-2 shrink-0">
                          <button
                            onClick={() => setSelectedDecodeUuid(id)}
                            className="p-1.5 rounded transition-all inline-flex text-slate-400 dark:text-slate-500 opacity-100 sm:opacity-0 group-hover:opacity-100 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            title="Decode Identifier"
                          >
                            <Search className="w-4 h-4" />
                          </button>
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
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* System Status Bar */}
          <footer className="mt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 uppercase font-mono bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded px-4 py-2 shrink-0 transition-colors duration-200 shadow-sm dark:shadow-none gap-2 sm:gap-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> SYSTEM ONLINE
              </div>
              <span className="opacity-30 font-bold hidden sm:inline">|</span>
              <div className="hidden sm:block">TOTAL GENERATED: {generatedItems.length}</div>
            </div>
            <a 
              href="https://link.thanhlv.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1 normal-case tracking-normal text-xs"
            >
              Check out more tools at link.thanhlv.com <ArrowRight className="w-3 h-3" />
            </a>
          </footer>
        </div>
      </main>

      {/* Decode Modal */}
      {selectedDecodeUuid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm sm:p-6" onClick={() => setSelectedDecodeUuid(null)}>
          <div className="bg-white dark:bg-[#0F1219] w-full max-w-2xl rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
               <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Identifier Details</h3>
                  <div className="text-xs text-slate-500 font-mono mt-1 break-all">{selectedDecodeUuid}</div>
               </div>
               <button
                 onClick={() => setSelectedDecodeUuid(null)}
                 aria-label="Close decode details"
                 className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
               >
                  <X className="w-5 h-5" />
               </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto">
               <UuidParseResult parsed={parseUuid(selectedDecodeUuid)} />
            </div>
            <div className="p-4 sm:p-6 pb-6 pt-2 bg-slate-50 border-t border-slate-200 dark:bg-slate-800/20 dark:border-slate-800 flex justify-end">
               <button onClick={() => setSelectedDecodeUuid(null)} className="px-4 py-2 font-medium text-sm text-slate-600 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                  Close
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

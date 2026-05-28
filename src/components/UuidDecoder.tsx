import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Menu, X, Settings, BookOpen, Sun, Monitor, Moon, Search, FileText, Code2, ArrowRight, Upload, Download, Trash2, FileJson, Share2, Check } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { cn } from '../lib/utils';
import { DESCRIPTIONS } from '../data/uuid-data';
import { parseUuid, ParsedIdentifier } from '../lib/uuid-parser';
import { UuidParseResult } from './UuidParseResult';
import { useVirtualizer } from '@tanstack/react-virtual';

export default function UuidDecoder() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
  const [inputContent, setInputContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#q=')) {
      try {
        const decoded = decodeURIComponent(atob(hash.slice(3)));
        setInputContent(decoded);
      } catch (e) {
        console.error('Failed to decode share URL', e);
      }
    }
  }, []);

  const handleShare = () => {
    try {
      const hash = '#q=' + btoa(encodeURIComponent(inputContent));
      const url = window.location.origin + window.location.pathname + hash;
      navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch (e) {
      console.error('Failed to copy share URL', e);
    }
  };

  const items = useMemo(() => {
    const text = inputContent.trim();
    if (!text) return [];

    try {
      const list = JSON.parse(text);
      if (Array.isArray(list)) {
        return list.map(i => String(i)).filter(i => i.trim() !== '');
      }
    } catch(e) {
      // Not JSON or Not Array
    }

    // Split by comma or newline
    return text.split(/[\n,]+/).map(s => s.trim()).filter(s => s !== '');
  }, [inputContent]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setInputContent(event.target.result as string);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadDemoText = () => {
    const content = `018b3f2c-e160-7000-a1cf-b30f836173a1\n00000000-0000-0000-0000-000000000000\nffffffff-ffff-ffff-ffff-ffffffffffff`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demo-identifiers.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDemoJson = () => {
    const content = JSON.stringify([
       "018b3f2c-e160-7000-a1cf-b30f836173a1",
       "00000000-0000-0000-0000-000000000000",
       "01HGW45Y1A12AJSFG13MQQFXX1"
    ], null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demo-identifiers.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDemoCsv = () => {
    const content = `018b3f2c-e160-7000-a1cf-b30f836173a1,00000000-0000-0000-0000-000000000000,ffffffff-ffff-ffff-ffff-ffffffffffff\n01HGW45Y1A12AJSFG13MQQFXX1`;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demo-identifiers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportResultsCsv = () => {
    const csvRows = [];
    csvRows.push(['Identifier', 'Valid', 'Type', 'Version', 'Variant', 'Date (UTC)', 'Note'].join(','));
    items.forEach(idStr => {
      const parsed = parseUuid(idStr);
      let dateStr = '';
      if (parsed?.date) {
        dateStr = parsed.date.toISOString();
      }
      const row = [
        idStr,
        parsed?.valid ? 'true' : 'false',
        parsed?.type || '',
        parsed?.version || '',
        parsed?.variant || '',
        dateStr,
        `"${(parsed?.note || parsed?.error || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });
    const content = csvRows.join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decoded-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180, // estimated height of result card
    overscan: 5,
  });

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

      <main className="flex-1 overflow-hidden w-full flex justify-center bg-slate-50 dark:bg-[#0B0E14] relative">
        <div className="max-w-4xl w-full flex flex-col h-full overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.02)] sm:shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-none bg-white dark:bg-[#0F1219] sm:border-x border-slate-200 dark:border-slate-800">
          
          {/* Header Area inside main layout */}
          <div className="p-4 sm:p-6 pb-4 sm:pb-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-500" />
              Batch Decoder
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 max-w-xl">
              Paste multiple UUIDs, ULIDs, or other identifiers (comma or newline separated). 
              Or upload a text/JSON file.
            </p>
          </div>

          <div className="flex flex-col flex-1 min-h-0">
            {/* Input Area */}
            <div className="p-4 sm:p-6 shrink-0 bg-slate-50/50 dark:bg-[#0B0E14]/50 border-b border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                  Data Input
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                  </button>
                  <button 
                    onClick={downloadDemoText}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    title="Download Text Demo"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Demo TXT
                  </button>
                  <button 
                    onClick={downloadDemoJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    title="Download JSON Demo"
                  >
                     <FileJson className="w-3.5 h-3.5" />
                     Demo JSON
                  </button>
                  <button 
                    onClick={downloadDemoCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    title="Download CSV Demo"
                  >
                     <FileText className="w-3.5 h-3.5" />
                     Demo CSV
                  </button>
                  <input 
                    type="file" 
                    accept=".txt,.json,.csv" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                  {inputContent.trim().length > 0 && (
                    <button 
                      onClick={() => setInputContent('')}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors ml-1"
                      title="Clear Input"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <textarea 
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="Paste identifiers here...\n018b3f2c-e160-7000-a1cf-b30f836173a1\n00000000-0000-0000-0000-000000000000"
                className="w-full h-32 sm:h-40 bg-white dark:bg-[#0F1219] border border-slate-300 dark:border-slate-700 rounded-lg text-sm p-3 sm:p-4 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner resize-none"
              />
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-auto bg-white dark:bg-[#0F1219] p-4 sm:p-6" ref={parentRef}>
              {items.length === 0 ? (
                 <div className="text-center py-12 text-slate-400 dark:text-slate-500 flex flex-col items-center gap-3">
                    <Code2 className="w-8 h-8 opacity-50" />
                    <p className="text-sm font-medium">Waiting for input...</p>
                 </div>
              ) : (
                 <div className="mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Parsed Results ({items.length})</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleShare}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        title="Share this decode view"
                      >
                        {copiedShare ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                        {copiedShare ? 'Copied' : 'Share'}
                      </button>
                      <button 
                        onClick={exportResultsCsv}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        title="Export Results as CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                      </button>
                    </div>
                 </div>
              )}
              
              {items.length > 0 && (
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const index = virtualRow.index;
                    const idStr = items[index];
                    const parsed = parseUuid(idStr);

                    return (
                      <div
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <div className="mb-6 last:mb-0 pb-6 border-b border-slate-100 dark:border-slate-800/60 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2 mb-3 bg-slate-50 dark:bg-slate-800/40 p-2 rounded border border-slate-100 dark:border-slate-800">
                             <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                               {index + 1}
                             </div>
                             <div className="font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-300 truncate font-semibold" title={idStr}>
                               {idStr}
                             </div>
                          </div>
                          <UuidParseResult parsed={parsed} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

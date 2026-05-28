import React, { useState } from 'react';
import { Menu, X, Settings, BookOpen, Sun, Monitor, Moon, Search, FileText, Code2, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { cn } from '../lib/utils';
import { DESCRIPTIONS } from '../data/uuid-data';
import { parseUuid } from '../lib/uuid-parser';
import { UuidParseResult } from './UuidParseResult';

export default function UuidDecoder() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
  const [inputUuid, setInputUuid] = useState('');

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
              <UuidParseResult parsed={parsed} inputEmpty={inputUuid.trim() === ''} />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

import React from 'react';
import { ParsedIdentifier } from '../lib/uuid-parser';
import { DESCRIPTIONS } from '../data/uuid-data';
import { Code2, X } from 'lucide-react';

interface Props {
  parsed: ParsedIdentifier | null;
  inputEmpty?: boolean;
}

export function UuidParseResult({ parsed, inputEmpty }: Props) {
  if (inputEmpty) {
    return (
      <div className="text-center py-12 text-slate-400 dark:text-slate-500 flex flex-col items-center gap-3">
         <Code2 className="w-8 h-8 opacity-50" />
         <p className="text-sm font-medium">Waiting for input...</p>
      </div>
    );
  }

  if (!parsed) return null;

  if (!parsed.valid) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-red-800 dark:text-red-400 text-sm flex gap-3">
        <X className="w-5 h-5 shrink-0" />
        <div>
          <strong>Invalid Input:</strong> {parsed.error}
        </div>
      </div>
    );
  }

  return (
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
  );
}

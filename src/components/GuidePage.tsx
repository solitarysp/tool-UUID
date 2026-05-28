import React from 'react';
import { ArrowLeft, Check, Copy, Settings2, Info } from 'lucide-react';
import { DESCRIPTIONS, UuidVersion } from '../data/uuid-data';
import { motion } from 'motion/react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';

export default function GuidePage() {
  const navigate = useNavigate();
  const { version } = useParams<{ version: string }>();

  if (!version) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto w-full">
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1219] flex items-center px-4 sm:px-6 shrink-0 z-10 sticky top-0">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Generator</span>
          </button>
          <div className="mx-auto text-lg font-bold text-slate-800 dark:text-slate-200">
            Identifier Types Guide
          </div>
          <div className="w-[84px] sm:w-[94px]"></div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
           <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Algorithm Guide</h1>
              <p className="text-slate-600 dark:text-slate-400">Discover all supported universal unique identifiers, their usage, and generation mechanisms.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {(Object.keys(DESCRIPTIONS) as UuidVersion[]).map(key => {
              const info = DESCRIPTIONS[key];
              return (
                <div 
                  key={key} 
                  onClick={() => navigate(`/guide/${key}`)}
                  className="bg-white dark:bg-[#0F1219] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-blue-600 dark:text-blue-400 text-lg group-hover:text-blue-700 dark:group-hover:text-blue-300">{info.title}</h4>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                      {key}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-3 flex-1">{info.desc}</p>
                  
                  <div className="text-[11px] font-mono text-slate-500 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded border border-slate-100 dark:border-slate-800 truncate">
                    {info.example}
                  </div>
                </div>
              )
            })}
           </div>
        </main>
      </div>
    );
  }

  // Details view
  const keyMatch = version as UuidVersion;
  const info = DESCRIPTIONS[keyMatch];
  
  if (!info) {
    return <Navigate to="/guide" replace />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto w-full">
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1219] flex items-center px-4 sm:px-6 shrink-0 z-10 sticky top-0">
        <button
          onClick={() => navigate('/guide')}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">Back to Guide</span>
        </button>
        
        <div className="mx-auto flex items-center gap-3">
           <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{info.title}</span>
           <span className="text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
             {keyMatch}
           </span>
        </div>

        <div className="w-[84px] sm:w-[124px]"></div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full pb-20">
         <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="space-y-8"
         >
            {/* Core Info */}
            <div className="bg-white dark:bg-[#0F1219] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" /> Description
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed text-slate-700 dark:text-slate-300">
                <p className="text-lg font-medium text-slate-900 dark:text-slate-200">{info.desc}</p>
                <p className="mt-4">{info.details}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Algorithm */}
                <div className="bg-white dark:bg-[#0F1219] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-purple-500" /> Internal Algorithm
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {info.algorithm}
                  </p>
                </div>

                {/* Use Case */}
                <div className="bg-white dark:bg-[#0F1219] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" /> Primary Use Case
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {info.useCase}
                  </p>
                </div>
            </div>

            {/* Code Example */}
            <div className="bg-white dark:bg-[#0F1219] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h2 className="text-md font-bold text-slate-800 dark:text-slate-200 font-mono text-sm">Implementation Example</h2>
                </div>
                <div className="p-6 overflow-x-auto bg-[#0d1017]">
                   <pre className="text-sm font-mono text-slate-300">
                     <code>{info.guideCodeExample}</code>
                   </pre>
                </div>
            </div>
         </motion.div>
      </main>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UuidGenerator from './components/UuidGenerator';
import GuidePage from './components/GuidePage';
import { ThemeProvider } from './components/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <BrowserRouter>
        <div className="h-screen w-full bg-slate-50 dark:bg-[#0B0E14] text-slate-800 dark:text-slate-300 font-sans overflow-hidden flex flex-col transition-colors duration-200">
          <Routes>
            <Route path="/" element={<UuidGenerator />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/guide/:version" element={<GuidePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

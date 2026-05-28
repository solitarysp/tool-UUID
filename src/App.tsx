/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import UuidGenerator from './components/UuidGenerator';
import { ThemeProvider } from './components/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <div className="h-screen w-full bg-slate-50 dark:bg-[#0B0E14] text-slate-800 dark:text-slate-300 font-sans overflow-hidden flex flex-col transition-colors duration-200">
        <UuidGenerator />
      </div>
    </ThemeProvider>
  );
}

'use client';

import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import { BottomNav } from './bottom-nav';
import { ThemeProvider } from '@/components/theme-provider';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 grid-bg scanline">
            <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
        <BottomNav />
      </div>
    </ThemeProvider>
  );
}

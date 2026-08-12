'use client';

import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from 'sonner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f0f1a',
            border: '1px solid rgba(0, 255, 242, 0.15)',
            color: '#e0e0e0',
          },
        }}
      />
    </AppShell>
  );
}

'use client';

import React from 'react';
import { useToasts } from '@/lib/toast';

export default function ToastContainer() {
  const toasts = useToasts();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded shadow-xl backdrop-blur-md border text-sm font-medium animate-in slide-in-from-bottom-5
            ${
              t.level === 'warn'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : t.level === 'error'
                ? 'bg-[#cf6679]/20 text-[#cf6679] border-[#cf6679]/30'
                : 'bg-white/10 text-slate-200 border-white/20'
            }
          `}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

'use client';

import React from 'react';
import { useAppContext } from '@/lib/context';
import Sidebar from './Sidebar';
import ToastContainer from './ToastContainer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, profile } = useAppContext();

  if (!isLoaded) return <div className="min-h-screen bg-[#0c101a] text-slate-200 flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex h-screen bg-[#0c101a] text-slate-200 overflow-hidden relative">
      {/* Mesh Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none z-0"></div>
      
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full z-10 relative">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}

'use client';

import React from 'react';
import { useAppContext } from '@/lib/context';
import { 
    LayoutDashboard, 
    ListChecks, 
    Headphones, 
    BookType, 
    BrainCog, 
    Mic, 
    MessageSquare, 
    AlertTriangle, 
    Ear, 
    CalendarCheck, 
    TrendingUp, 
    Settings 
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { id: 1, label: 'Dashboard', icon: LayoutDashboard },
  { id: 2, label: 'Daily Pipeline', icon: ListChecks },
  { id: 3, label: 'Input Session', icon: Headphones },
  { id: 4, label: 'Construction Journal', icon: BookType },
  { id: 5, label: 'Retrieval Review', icon: BrainCog },
  { id: 6, label: 'Output Trainer', icon: Mic },
  { id: 7, label: 'AI Conversation', icon: MessageSquare },
  { id: 8, label: 'Error Tracker', icon: AlertTriangle },
  { id: 9, label: 'Pronunciation', icon: Ear },
  { id: 10, label: 'Weekly Review', icon: CalendarCheck },
  { id: 11, label: 'Progress & Stage', icon: TrendingUp },
  { id: 12, label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { activeModule, setActiveModule } = useAppContext();

  return (
    <aside className="w-16 md:w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full shrink-0 transition-all relative z-20">
      <div className="p-4 border-b border-zinc-800 hidden md:block">
        <h1 className="text-amber-500 font-mono font-bold text-xl tracking-tight">ACLEAS</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveModule(item.id)}
                  className={clsx(
                    "w-full flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors text-left",
                    isActive 
                      ? "bg-blue-600 hover:bg-blue-500/10 text-amber-500 font-medium" 
                      : "text-slate-400 hover:bg-zinc-800 hover:text-slate-200"
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="hidden md:inline-block text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

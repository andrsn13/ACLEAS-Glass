'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/lib/context';
import { toast } from '@/lib/toast';

export default function WeeklyReview() {
  const { weekly, setWeekly, sessions } = useAppContext();
  
  // Weekly stats
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const recent7 = sessions.filter(s => s.date >= sevenDaysAgo);
  
  const totalInput = recent7.reduce((a, s) => a + s.inputMinutes, 0);
  const totalSpeak = recent7.reduce((a, s) => a + s.speakingMinutes, 0);
  const totalCards = recent7.reduce((a, s) => a + s.cardsReviewed, 0);
  const newConst = recent7.reduce((a, s) => a + s.constructionsCaptured, 0);

  const [form, setForm] = useState({
    recurringErrors: '',
    hesitationPatterns: '',
    comprehensionBottlenecks: '',
    emotionalResistance: '',
    weakConstructions: '',
    priorities: '',
    deepSessionCompleted: false,
    deepSessionMinutes: 0
  });

  const handleSave = () => {
    const entry = {
      ...form,
      weekOf: new Date().toISOString()
    };
    setWeekly([entry, ...weekly]);
    setForm({
      recurringErrors: '',
      hesitationPatterns: '',
      comprehensionBottlenecks: '',
      emotionalResistance: '',
      weakConstructions: '',
      priorities: '',
      deepSessionCompleted: false,
      deepSessionMinutes: 0
    });
    toast('Weekly review saved.');
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-mono text-amber-500 font-bold mb-1">Weekly Review</h2>
        <p className="text-slate-400">Macro-level analysis and course correction.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-center">
            <div className="text-xs text-slate-400 font-bold tracking-wider mb-1">7D INPUT</div>
            <div className="text-2xl font-mono text-slate-200">{totalInput}m</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-center">
            <div className="text-xs text-slate-400 font-bold tracking-wider mb-1">7D OUTPUT</div>
            <div className="text-2xl font-mono text-slate-200">{totalSpeak}m</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-center">
            <div className="text-xs text-slate-400 font-bold tracking-wider mb-1">REVIEWS</div>
            <div className="text-2xl font-mono text-slate-200">{totalCards}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-center">
            <div className="text-xs text-slate-400 font-bold tracking-wider mb-1">NEW CONSTRUCTS</div>
            <div className="text-2xl font-mono text-slate-200">{newConst}</div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6">
        <h3 className="font-mono text-xl text-amber-500">Weekly Reflection</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">What grammar errors kept appearing?</label>
            <textarea value={form.recurringErrors} onChange={(e) => setForm({...form, recurringErrors: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500 h-16 resize-none text-slate-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Where did you hesitate most in speech?</label>
            <textarea value={form.hesitationPatterns} onChange={(e) => setForm({...form, hesitationPatterns: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500 h-16 resize-none text-slate-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">What was hardest to understand?</label>
            <textarea value={form.comprehensionBottlenecks} onChange={(e) => setForm({...form, comprehensionBottlenecks: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500 h-16 resize-none text-slate-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">What parts of practice felt like avoidance?</label>
            <textarea value={form.emotionalResistance} onChange={(e) => setForm({...form, emotionalResistance: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500 h-16 resize-none text-slate-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">What will you focus on next week? (Priorities)</label>
            <textarea value={form.priorities} onChange={(e) => setForm({...form, priorities: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500 h-16 resize-none text-slate-200" />
          </div>

          <div className="flex items-center space-x-6 border-t border-zinc-800 pt-4">
            <label className="flex items-center space-x-2 text-slate-300">
               <input type="checkbox" checked={form.deepSessionCompleted} onChange={(e) => setForm({...form, deepSessionCompleted: e.target.checked})} className="accent-amber-500 w-4 h-4" />
               <span className="text-sm">Completed weekly deep session (2-4 hours)?</span>
             </label>
             {form.deepSessionCompleted && (
                <div className="flex items-center space-x-2">
                 <label className="text-sm text-slate-400">Duration (m):</label>
                 <input type="number" value={form.deepSessionMinutes} onChange={(e) => setForm({...form, deepSessionMinutes: Number(e.target.value)})} className="w-20 bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1" />
                </div>
             )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-8 py-3 rounded-lg font-bold transition-colors">
            Save Weekly Log
          </button>
        </div>
      </div>

      {weekly.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="font-mono text-lg text-slate-400">Past Weeks Log</h3>
          {weekly.map(w => (
            <div key={w.weekOf} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
              <span className="text-amber-500 font-mono text-sm block mb-2">{new Date(w.weekOf).toLocaleDateString()}</span>
              <p className="text-slate-300 text-sm"><strong className="text-slate-500">Priorities:</strong> {w.priorities || 'None set'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { useAppContext } from '@/lib/context';
import { getTodayISO, addDays } from '@/lib/storage';

export default function Dashboard() {
  const { 
    streak, 
    sessions, 
    cards, 
    profile,
    setActiveModule,
    getTodaySession 
  } = useAppContext();

  const todayIso = getTodayISO();
  const todaySession = getTodaySession();

  // VFP Calculation
  const getVFP = () => {
    const cutoff = addDays(todayIso, -7);
    const recent = sessions.filter(s => s.date >= cutoff);
    const reviewed = recent.reduce((a, s) => a + s.cardsReviewed, 0);
    const forgotten = recent.reduce((a, s) => a + s.cardsForgotten, 0);
    if (reviewed === 0) return 0;
    return Math.round((forgotten / reviewed) * 100);
  };
  const vfp = getVFP();
  let vfpColor = "text-green-500";
  if (vfp >= 20) vfpColor = "text-amber-500";
  if (vfp > 40) vfpColor = "text-[#cf6679]";

  // Due Cards
  const dueCardsCount = cards.filter((c) => c.due <= todayIso).length;

  // Stages calculation for progress
  const completedStagesCount = todaySession.pipelineStagesCompleted.length;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-3xl font-mono text-amber-500 font-bold mb-1">Dashboard</h2>
          <p className="text-slate-400">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono text-amber-500">{streak.currentStreak} <span className="text-sm text-slate-400">Day Streak</span></div>
          <div className="text-xs text-slate-500">Longest: {streak.longestStreak}</div>
        </div>
      </header>

      {/* Daily Pipeline Progress */}
      <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-mono text-lg text-slate-200">Daily Pipeline</h3>
          <span className="text-slate-400 font-mono text-sm">{completedStagesCount} / 7 stages complete</span>
        </div>
        <div className="flex space-x-1 h-3 rounded-full overflow-hidden bg-zinc-950">
          {[1,2,3,4,5,6,7].map(stage => {
            const isComplete = todaySession.pipelineStagesCompleted.includes(stage);
            return (
              <div 
                key={stage} 
                className={`flex-1 transition-colors ${isComplete ? 'bg-blue-600 hover:bg-blue-500' : 'bg-zinc-800'}`} 
              />
            );
          })}
        </div>
      </section>

      {/* Today's Stats & Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Due Cards */}
        <button 
          onClick={() => setActiveModule(5)}
          className="bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800 p-4 rounded-xl text-left"
        >
          <div className="text-slate-400 text-sm mb-2">Due Cards</div>
          <div className="text-3xl font-mono text-slate-200">{dueCardsCount}</div>
        </button>

        {/* Input Minutes */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="text-slate-400 text-sm mb-2">Input Mins</div>
          <div className="text-3xl font-mono text-slate-200">{todaySession.inputMinutes}</div>
        </div>

        {/* Speaking Minutes */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="text-slate-400 text-sm mb-2">Speaking Mins</div>
          <div className="text-3xl font-mono text-slate-200">{todaySession.speakingMinutes}</div>
        </div>

        {/* VFP Widget */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="text-slate-400 text-sm mb-2">Forgetting Rate (7d)</div>
          <div className={`text-3xl font-mono ${vfpColor}`}>{vfp}%</div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
        <h3 className="font-mono text-lg text-slate-200 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setActiveModule(3)}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-4 py-2 rounded-md font-medium transition-colors"
          >
            Log Input
          </button>
          <button 
            onClick={() => setActiveModule(5)}
            className="border border-amber-500 text-amber-500 px-4 py-2 rounded-md font-medium hover:bg-blue-500/10 transition-colors"
          >
            Start Review
          </button>
          <button 
            onClick={() => setActiveModule(7)}
            className="bg-zinc-800 text-slate-200 px-4 py-2 rounded-md font-medium hover:bg-zinc-700 transition-colors"
          >
            Open AI Chat
          </button>
        </div>
      </section>

      {/* Alerts */}
      {(todaySession.inputMinutes < 60 || todaySession.speakingMinutes < 20) && (
        <div className="bg-[#cf6679]/10 border border-[#cf6679]/30 p-4 rounded-xl text-[#cf6679] text-sm">
          <strong>Daily Minimum Alerts:</strong>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            {todaySession.inputMinutes < 60 && <li>Input volume below 60m threshold ({todaySession.inputMinutes}m).</li>}
            {todaySession.speakingMinutes < 20 && <li>Speaking volume below 20m threshold ({todaySession.speakingMinutes}m).</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { useAppContext } from '@/lib/context';

export default function ProgressStage() {
  const { profile, cards, sessions, conversations } = useAppContext();

  // Determine stage
  const totalCards = cards.length;
  // Calculate average interval
  const validIntervals = cards.filter(c => c.reps > 0).map(c => c.interval);
  const avgInterval = validIntervals.length > 0 ? (validIntervals.reduce((a,b)=>a+b, 0) / validIntervals.length) : 0;
  
  // VFP 30d
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const recent30 = sessions.filter(s => s.date >= thirtyDaysAgo);
  const rev30 = recent30.reduce((a, s) => a + s.cardsReviewed, 0);
  const forg30 = recent30.reduce((a, s) => a + s.cardsForgotten, 0);
  const vfp30 = rev30 > 0 ? Math.round((forg30 / rev30) * 100) : 0;

  const aiConvCount = conversations.length;
  const deepSessions = 0; // Simulated for now

  let currentStage = 1;
  let stageName = "Stage 1 — Declarative Familiarity";
  let stageDesc = "Learning the structural rules. Explicit memory is high, production is slow.";

  if (totalCards >= 400 && avgInterval >= 45 && vfp30 <= 10 && deepSessions >= 12) {
    currentStage = 5;
    stageName = "Stage 5 — Adaptive Mastery";
    stageDesc = "Implicit structural generation. You adapt to nuances effortlessly.";
  } else if (totalCards >= 200 && avgInterval >= 21 && vfp30 <= 20 && aiConvCount >= 20 && deepSessions >= 4) {
    currentStage = 4;
    stageName = "Stage 4 — Autonomous Fluency";
    stageDesc = "Constructions are firing automatically in most non-specialized contexts.";
  } else if (totalCards >= 100 && avgInterval >= 10 && vfp30 <= 35 && aiConvCount >= 5) {
    currentStage = 3;
    stageName = "Stage 3 — Procedural Emergence";
    stageDesc = "Declarative rules are becoming procedural. Pauses are dropping.";
  } else if (totalCards >= 50 && avgInterval >= 5 && vfp30 > 35) {
    currentStage = 2;
    stageName = "Stage 2 — Controlled Production";
    stageDesc = "You can produce the patterns, but it requires conscious heavy lifting.";
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-mono text-amber-500 font-bold mb-1">Progress & Stage</h2>
        <p className="text-slate-400">Long-term proceduralization tracking.</p>
      </header>

      <div className="bg-blue-600 hover:bg-blue-500/10 border border-amber-500/30 p-8 rounded-xl text-center space-y-4">
        <h3 className="text-amber-500 font-mono tracking-widest text-sm uppercase">Current Mastery Stage</h3>
        <div className="text-4xl font-bold font-mono text-slate-200">{stageName}</div>
        <p className="text-slate-300 max-w-xl mx-auto">{stageDesc}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-center">
            <div className="text-xs text-slate-400 font-bold tracking-wider mb-1">TOTAL CARDS</div>
            <div className="text-2xl font-mono text-slate-200">{totalCards}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-center">
            <div className="text-xs text-slate-400 font-bold tracking-wider mb-1">AVG INTERVAL</div>
            <div className="text-2xl font-mono text-slate-200">{avgInterval.toFixed(1)} <span className="text-sm">days</span></div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-center">
            <div className="text-xs text-slate-400 font-bold tracking-wider mb-1">VFP (30D)</div>
            <div className={`text-2xl font-mono ${vfp30 > 35 ? 'text-[#cf6679]' : 'text-slate-200'}`}>{vfp30}%</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-center">
            <div className="text-xs text-slate-400 font-bold tracking-wider mb-1">AI SESSIONS</div>
            <div className="text-2xl font-mono text-slate-200">{aiConvCount}</div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
        <h3 className="font-mono text-lg text-slate-200">Forbidden Practices Self-Audit</h3>
        <p className="text-sm text-slate-400 mb-4">Are you falling into these traps? (Self-reflection only)</p>
        
        <div className="space-y-3">
          {['Passive binge watching without retrieval/output', 'Isolated vocabulary memorization without constructions', 'Grammar-only study without communication', 'Translation dependency during input', 'Comfort-zone repetition only'].map(t => (
             <label key={t} className="flex items-start space-x-3 text-slate-300">
               <input type="checkbox" className="accent-[#cf6679] mt-1 shrink-0" />
               <span className="text-sm">{t}</span>
             </label>
          ))}
        </div>
      </div>

      {profile?.learnerType === 'heritage' && (
        <div className="bg-[#e6a817]/10 border border-[#e6a817]/30 p-6 rounded-xl">
          <h4 className="text-amber-500 font-bold mb-2">Heritage Learner Note</h4>
          <p className="text-sm text-slate-300">Your track bypasses early phonics tracking (Stage 0) and assumes baseline acoustic recognition. Your staging is weighted heavier on explicitly mapping structures to grammatical forms that you previously only intuited.</p>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/lib/context';
import { toast } from '@/lib/toast';
import MonologueRecorder from './MonologueRecorder';

export default function OutputTrainer() {
  const { getTodaySession, updateTodaySession, constructions } = useAppContext();
  const session = getTodaySession();

  const [activeTab, setActiveTab] = useState<'monologue'|'retelling'|'drill'|'constraint'>('monologue');
  const [minutes, setMinutes] = useState(5);
  const [monologueTopic, setMonologueTopic] = useState('Your Day');
  
  const handleLogSpeak = async (mins: number) => {
    updateTodaySession({ speakingMinutes: session.speakingMinutes + mins });
    toast(`Logged ${mins} minutes of speaking.`);
    try {
      const { syncToDocs } = await import('@/lib/useDocsSync');
      await syncToDocs('logSessionText', {
        title: `Output Trainer: Speak (${activeTab})`,
        details: 'Self-guided practice',
        duration: mins
      });
    } catch (e) {}
  };

  const handleLogWrite = async (mins: number) => {
    updateTodaySession({ writingMinutes: session.writingMinutes + mins });
    toast(`Logged ${mins} minutes of writing.`);
    try {
      const { syncToDocs } = await import('@/lib/useDocsSync');
      await syncToDocs('logSessionText', {
        title: `Output Trainer: Write (${activeTab})`,
        details: 'Self-guided practice',
        duration: mins
      });
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-mono text-amber-500 font-bold mb-1">Output Trainer</h2>
        <p className="text-slate-400">Pushed output to solidify structures. Today&apos;s suggested: Retelling.</p>
      </header>

      <div className="flex space-x-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        <button onClick={() => setActiveTab('monologue')} className={`px-4 py-2 rounded-t-lg font-medium whitespace-nowrap ${activeTab === 'monologue' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl' : 'text-slate-400 hover:bg-zinc-800 hover:text-slate-200'}`}>Monologue</button>
        <button onClick={() => setActiveTab('retelling')} className={`px-4 py-2 rounded-t-lg font-medium whitespace-nowrap ${activeTab === 'retelling' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl' : 'text-slate-400 hover:bg-zinc-800 hover:text-slate-200'}`}>Retelling</button>
        <button onClick={() => setActiveTab('drill')} className={`px-4 py-2 rounded-t-lg font-medium whitespace-nowrap ${activeTab === 'drill' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl' : 'text-slate-400 hover:bg-zinc-800 hover:text-slate-200'}`}>Transformation</button>
        <button onClick={() => setActiveTab('constraint')} className={`px-4 py-2 rounded-t-lg font-medium whitespace-nowrap ${activeTab === 'constraint' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl' : 'text-slate-400 hover:bg-zinc-800 hover:text-slate-200'}`}>Constraint</button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl min-h-[400px]">
        {activeTab === 'monologue' && (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="text-xl font-mono text-slate-200">Activity A: Monologue Timer</h3>
            <p className="text-slate-400">Real-time retrieval under pressure.</p>
            <select 
              value={monologueTopic} 
              onChange={(e) => setMonologueTopic(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option>Your Day</option>
              <option>Opinion</option>
              <option>Summary</option>
              <option>Explanation</option>
              <option>Argument</option>
              <option>Free</option>
            </select>
            <MonologueRecorder topic={monologueTopic} onLogRun={handleLogSpeak} />
          </div>
        )}

        {activeTab === 'retelling' && (
           <div className="space-y-6 animate-in fade-in">
             <h3 className="text-xl font-mono text-slate-200">Activity B: Retelling</h3>
             <p className="text-amber-500/80 font-mono italic">&quot;What did you listen to today? Retell it now WITHOUT notes.&quot;</p>
             <textarea className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-md p-3 text-slate-200 focus:outline-none focus:border-amber-500" placeholder="Type your retelling here if writing, otherwise just speak aloud." />
             <div className="flex space-x-4">
               <button onClick={() => handleLogSpeak(10)} className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-4 py-2 rounded-lg font-bold">Log 10m Speak</button>
               <button onClick={() => handleLogWrite(10)} className="bg-zinc-800 text-slate-200 px-4 py-2 rounded-lg font-bold hover:bg-zinc-700">Log 10m Write</button>
             </div>
           </div>
        )}

        {activeTab === 'drill' && (
           <div className="space-y-6 animate-in fade-in">
             <h3 className="text-xl font-mono text-slate-200">Activity C: Transformation Drills</h3>
             <p className="text-slate-400">Select a construction to transform:</p>
             <select className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-amber-500">
                {constructions.map(c => <option key={c.id}>{c.construction}</option>)}
             </select>
             <div className="space-y-2 text-sm text-amber-500/80 bg-blue-500/10 p-4 rounded-lg">
                <p>1. Change subject (I → She → They)</p>
                <p>2. Change tense frame</p>
                <p>3. Negate it</p>
                <p>4. Make it a question</p>
                <p>5. Use in a completely different context</p>
             </div>
             <button onClick={() => handleLogWrite(5)} className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-6 py-2 rounded-lg font-bold mt-4">Log Drills (5m Write)</button>
           </div>
        )}

        {activeTab === 'constraint' && (
           <div className="space-y-6 animate-in fade-in">
             <h3 className="text-xl font-mono text-slate-200">Activity D: Constraint Speaking</h3>
             <p className="text-slate-400">Impose artificial limitations to force retrieval.</p>
             <div className="space-y-2">
                {['Past tense only', 'Conditionals only', 'Formal register only', '5 random constructions from journal'].map(c => (
                  <label key={c} className="flex items-center space-x-3 text-slate-300">
                    <input type="checkbox" className="accent-amber-500 w-4 h-4" />
                    <span>{c}</span>
                  </label>
                ))}
             </div>
             <div className="flex items-center space-x-4">
              <label className="text-sm font-bold">Minutes:</label>
              <input type="number" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="w-20 bg-zinc-950 border border-zinc-800 rounded-md py-1 px-3 text-center" />
            </div>
             <button onClick={() => handleLogSpeak(minutes)} className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-6 py-2 rounded-lg font-bold">Log Constraint Speech</button>
           </div>
        )}
      </div>
    </div>
  );
}

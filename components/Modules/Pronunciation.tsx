'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/lib/context';

const MINIMAL_PAIRS = [
  'ship / sheep', 'live / leave', 'it / eat', 'full / fool', 'pull / pool',
  'bed / bad', 'man / men', 'sat / set', 'cup / cap', 'fun / fan',
  'thin / tin', 'then / den', 'van / ban', 'rice / lice', 'right / write',
  'hear / here / hair', 'caught / court / cut', 'bought / boat / bat',
  'would / wood / good', 'could / cold / told'
];

const REDUCTIONS = [
  'gonna = going to', 'wanna = want to', 'gotta = got to', 'hafta = have to',
  'kinda = kind of', 'sorta = sort of', 'dunno = don\'t know', 'coulda = could have',
  'woulda = would have', 'shoulda = should have', 'lotta = a lot of', 'betcha = bet you',
  'watcha = what are you'
];

export default function Pronunciation() {
  const { getTodaySession, updateTodaySession } = useAppContext();
  const session = getTodaySession();

  const [activeTab, setActiveTab] = useState<'shadowing' | 'minimal' | 'reduction'>('shadowing');
  const [minutes, setMinutes] = useState(15);
  const [source, setSource] = useState('');

  const [pairRatings, setPairRatings] = useState<Record<string, string>>({});
  const [reductionsChecked, setReductionsChecked] = useState<Record<string, boolean>>({});

  const handleLogShadowing = () => {
    updateTodaySession({ 
      shadowingMinutes: session.shadowingMinutes + minutes,
      sessionNotes: session.sessionNotes + `\nShadowing Log: ${minutes}m - Source: ${source}`
    });
    alert(`Logged ${minutes}m of shadowing.`);
    setSource('');
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-mono text-amber-500 font-bold mb-1">Pronunciation</h2>
        <p className="text-slate-400">Motor-memory, acoustic discrimination, and connected speech.</p>
      </header>

      <div className="flex space-x-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        <button onClick={() => setActiveTab('shadowing')} className={`px-4 py-2 rounded-t-lg font-medium whitespace-nowrap ${activeTab === 'shadowing' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl' : 'text-slate-400 hover:bg-zinc-800'}`}>1. Shadowing</button>
        <button onClick={() => setActiveTab('minimal')} className={`px-4 py-2 rounded-t-lg font-medium whitespace-nowrap ${activeTab === 'minimal' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl' : 'text-slate-400 hover:bg-zinc-800'}`}>2. Minimal Pairs</button>
        <button onClick={() => setActiveTab('reduction')} className={`px-4 py-2 rounded-t-lg font-medium whitespace-nowrap ${activeTab === 'reduction' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl' : 'text-slate-400 hover:bg-zinc-800'}`}>3. Connected Speech</button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl min-h-[400px]">
        {activeTab === 'shadowing' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-blue-600 hover:bg-blue-500/10 border border-amber-500/30 p-4 rounded-lg text-amber-500/90 text-sm space-y-2">
              <p><strong>INSTRUCTIONS:</strong> Play your audio source. Repeat what you hear simultaneously or with a 1-second delay. Do not pause the audio.</p>
              <p><strong>GESTURE HINT:</strong> For action words, mirror the speaker&apos;s implied physical motion while shadowing.</p>
            </div>

            <div className="space-y-4 max-w-sm">
              <div>
                <label className="block text-sm font-bold mb-1 border-slate-400">Source Material:</label>
                <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Podcast episode, clip title..." className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-amber-500" />
              </div>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-bold">Minutes:</label>
                <input type="number" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="w-20 bg-zinc-950 border border-zinc-800 rounded-md py-1 px-3 text-center" />
              </div>
              <button disabled={!source} onClick={handleLogShadowing} className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-6 py-3 rounded-lg font-bold w-full disabled:opacity-50">Log Shadowing Session</button>
            </div>
          </div>
        )}

        {activeTab === 'minimal' && (
           <div className="space-y-6 animate-in fade-in">
             <p className="text-slate-400">Self-report: &quot;Can I clearly hear the difference?&quot;</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MINIMAL_PAIRS.map(pair => (
                  <div key={pair} className="bg-zinc-950 p-4 rounded-lg flex justify-between items-center border border-zinc-800">
                    <span className="font-mono text-lg text-slate-200">{pair}</span>
                    <div className="flex space-x-1">
                      <button onClick={() => setPairRatings({...pairRatings, [pair]: 'yes'})} className={`px-2 py-1 text-xs rounded ${pairRatings[pair] === 'yes' ? 'bg-green-500/20 text-green-500' : 'bg-zinc-800 text-slate-400'}`}>Yes</button>
                      <button onClick={() => setPairRatings({...pairRatings, [pair]: 'no'})} className={`px-2 py-1 text-xs rounded ${pairRatings[pair] === 'no' ? 'bg-[#cf6679]/20 text-[#cf6679]' : 'bg-zinc-800 text-slate-400'}`}>No</button>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        )}

        {activeTab === 'reduction' && (
           <div className="space-y-6 animate-in fade-in">
             <p className="text-slate-400">Mark forms you can hear and comprehend effortlessly in fast native speech.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {REDUCTIONS.map(red => (
                   <label key={red} className="bg-zinc-950 p-4 rounded-lg flex items-center space-x-3 border border-zinc-800 cursor-pointer">
                     <input type="checkbox" checked={reductionsChecked[red] || false} onChange={e => setReductionsChecked({...reductionsChecked, [red]: e.target.checked})} className="accent-amber-500 w-4 h-4" />
                     <span className="font-mono text-slate-300">{red}</span>
                   </label>
                ))}
             </div>
           </div>
        )}
      </div>
    </div>
  );
}

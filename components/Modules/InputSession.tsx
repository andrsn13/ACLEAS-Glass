'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/lib/context';

export default function InputSession() {
  const { getTodaySession, updateTodaySession } = useAppContext();
  const session = getTodaySession();

  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(85);
  
  const [predictionMode, setPredictionMode] = useState(false);
  const [sourceData, setSourceData] = useState({ type: 'Podcast', title: '' });
  const [speedNote, setSpeedNote] = useState('1.0x');
  const [localNote, setLocalNote] = useState('');
  
  const [showRules, setShowRules] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => {
          if (predictionMode && (s + 1) % 300 === 0) { // Every 5 minutes
            alert("Prediction Mode: Pause. Predict what will be said next. Then continue.");
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, predictionMode]);

  const handleStop = () => {
    setIsRunning(false);
    if (seconds > 0) {
      setShowRating(true);
    }
  };

  const saveSessionData = () => {
    const minLogged = Math.round(seconds / 60);
    updateTodaySession({ 
      inputMinutes: session.inputMinutes + minLogged,
      inputComprehension: rating, // Just storing latest for now
      sessionNotes: session.sessionNotes + (localNote ? `\n\nInput Session Notes:\n${localNote}` : '')
    });
    setSeconds(0);
    setShowRating(false);
    setLocalNote('');
    alert(`Logged ${minLogged} minutes of input.`);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getRatingLabel = () => {
    if (rating < 70) return "Too difficult — find easier input";
    if (rating < 95) return "✓ Comprehensible zone (target)";
    return "Too easy — increase difficulty";
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-mono text-amber-500 font-bold mb-1">Input Session</h2>
        <p className="text-slate-400">Target comprehensible input. Track focus and meaning.</p>
      </header>

      {/* Rules Accordion */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <button 
          onClick={() => setShowRules(!showRules)}
          className="w-full px-6 py-4 flex justify-between items-center hover:bg-zinc-800 transition-colors"
        >
          <span className="font-mono text-amber-500">Input Rules Refresher</span>
          <span>{showRules ? '▲' : '▼'}</span>
        </button>
        {showRules && (
          <div className="px-6 pb-4 text-sm text-slate-300 space-y-2 border-t border-zinc-800 pt-4">
            <p><strong>Rule A:</strong> No passive consumption. Predict, notice, track meaning.</p>
            <p><strong>Rule B:</strong> At least 70% of input must be audio.</p>
            <p><strong>Rule C:</strong> No translation during input. Tolerate ambiguity.</p>
            <p><strong>Replay Rule:</strong> Replay difficult sections 2-5 times, then move on.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Logger & Timer */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6">
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-400">Source Type</label>
            <select 
              value={sourceData.type}
              onChange={(e) => setSourceData({...sourceData, type: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500"
            >
              {['Podcast', 'YouTube Interview', 'Sitcom', 'Audiobook', 'Documentary', 'News', 'Conversation', 'Lecture', 'Other'].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            
            <input 
              type="text"
              placeholder="Title / URL (Optional)"
              value={sourceData.title}
              onChange={(e) => setSourceData({...sourceData, title: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
            <div className="text-5xl font-mono tracking-wider text-amber-500">{formatTime(seconds)}</div>
            <div className="flex flex-col space-y-2">
              {!isRunning ? (
                <button onClick={() => setIsRunning(true)} className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-4 py-2 rounded-md font-bold hover:bg-amber-400 transition-colors">Start</button>
              ) : (
                <button onClick={() => setIsRunning(false)} className="bg-blue-600 hover:bg-blue-500/20 text-amber-500 px-4 py-2 rounded-md font-bold hover:bg-blue-500/30 transition-colors">Pause</button>
              )}
              <button 
                onClick={handleStop}
                disabled={seconds === 0}
                className="bg-[#cf6679]/20 text-[#cf6679] px-4 py-2 rounded-md font-bold hover:bg-[#cf6679]/30 transition-colors disabled:opacity-50"
              >
                Stop
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="pred-mode"
              checked={predictionMode}
              onChange={(e) => setPredictionMode(e.target.checked)}
              className="accent-amber-500 w-4 h-4"
            />
            <label htmlFor="pred-mode" className="text-sm text-slate-300">Enable Prediction Mode (5m prompts)</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Audio Speed Setting</label>
            <input 
              type="text"
              value={speedNote}
              onChange={(e) => setSpeedNote(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500 text-sm"
              placeholder="e.g. 0.85x"
            />
            <p className="text-xs text-slate-500 mt-2">Target native speed eventually. Reduce if comprehension &lt; 70%.</p>
          </div>

        </div>

        {/* Rating & Notes */}
        <div className="space-y-6">
          {showRating && (
            <div className="bg-zinc-800/50 border border-amber-500/50 p-6 rounded-xl space-y-4 animate-in fade-in zoom-in duration-300">
              <h3 className="font-mono text-lg text-amber-500">Comprehension Rating</h3>
              <p className="text-sm text-slate-300">How much did you naturally understand?</p>
              
              <div className="flex items-center space-x-4">
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <span className="font-mono text-xl w-16 text-right">{rating}%</span>
              </div>
              
              <div className={`text-sm font-medium ${rating < 70 ? 'text-[#cf6679]' : rating >= 95 ? 'text-amber-500' : 'text-green-500'}`}>
                {getRatingLabel()}
              </div>

              <button 
                onClick={saveSessionData}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-4 py-3 rounded-md font-bold hover:bg-amber-400 transition-colors mt-4"
              >
                Log Session
              </button>
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex-1 h-full flex flex-col">
            <label className="block text-sm font-bold text-slate-200 mb-2">Session Notepad</label>
            <p className="text-xs text-slate-500 mb-4">In-session notes (enhances encoding). Auto-saves to daily log.</p>
            <textarea
              value={localNote}
              onChange={(e) => setLocalNote(e.target.value)}
              className="w-full flex-1 min-h-[200px] bg-zinc-950 border border-zinc-800 rounded-md p-3 text-slate-200 focus:outline-none focus:border-amber-500 resize-none font-mono text-sm"
              placeholder="Captured odd phrasing... noticed a tense shift..."
            />
          </div>
        </div>

      </div>
    </div>
  );
}

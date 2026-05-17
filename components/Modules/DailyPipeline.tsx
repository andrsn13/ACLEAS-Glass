'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/lib/context';
import { toast } from '@/lib/toast';
import confetti from 'canvas-confetti';
import { SessionLog } from '@/lib/types';

const STAGES = [
  { id: 1, name: 'Input Immersion', min: '60 min input logged', key: 'inputMinutes', target: 60 },
  { id: 2, name: 'Construction Capture', min: '5 constructions added today', key: 'constructionsCaptured', target: 5 },
  { id: 3, name: 'Retrieval Review', min: 'All due/20 cards min', key: 'cardsReviewed', target: 20 },
  { id: 4, name: 'Pushed Output', min: '20 min speaking logged', key: 'speakingMinutes', target: 20 },
  { id: 5, name: 'Repair & Feedback', min: '1 AI conversation/log', key: 'aiConversationMinutes', target: 1 },
  { id: 6, name: 'Passive Saturation', min: 'Optional log', key: 'passiveMinutes', target: 0 },
  { id: 7, name: 'Sleep Consolidation', min: 'Log sleep hours', key: 'sleepHours', target: 7.5 },
];

export default function DailyPipeline() {
  const { getTodaySession, updateTodaySession, sessions } = useAppContext();
  const session = getTodaySession();
  const [sleepInput, setSleepInput] = useState('');
  const [viewHistory, setViewHistory] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionLog | null>(null);

  const toggleStage = (stageId: number) => {
    const isComplete = session.pipelineStagesCompleted.includes(stageId);
    let newStages;
    if (isComplete) {
      newStages = session.pipelineStagesCompleted.filter(id => id !== stageId);
    } else {
      newStages = [...session.pipelineStagesCompleted, stageId];
    }
    updateTodaySession({ pipelineStagesCompleted: newStages });
  };

  const updateNotes = (notes: string) => {
    updateTodaySession({ sessionNotes: notes });
  };

  const handleEndDay = () => {
    const hours = parseFloat(sleepInput);
    if (!isNaN(hours)) {
      const newStages = session.pipelineStagesCompleted.includes(7) 
        ? session.pipelineStagesCompleted 
        : [...session.pipelineStagesCompleted, 7];

      updateTodaySession({ 
        sleepHours: hours,
        pipelineStagesCompleted: newStages
      });

      if (newStages.length >= 7) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast('INCREDIBLE! All daily stages complete. Day ended and sleep logged!');
      } else {
        toast('Day ended and sleep logged! Great work.');
      }
      setSleepInput('');
    }
  };

  if (viewHistory) {
    // Sort descending by date
    const history = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="space-y-6">
        <header className="border-b border-zinc-800 pb-4 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-mono text-amber-500 font-bold mb-1">Pipeline History</h2>
            <p className="text-slate-400">Past daily records.</p>
          </div>
          <button 
            onClick={() => setViewHistory(false)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Back to Today
          </button>
        </header>

        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-slate-400">No history available yet.</p>
          ) : (
            history.map((s) => (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedSession(s)}
                onKeyDown={(e) => { if (e.key === 'Enter') setSelectedSession(s); }}
                className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-2 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-mono text-lg text-amber-500">{new Date(s.date).toLocaleDateString()}</h3>
                  <span className="text-sm font-mono bg-zinc-800 px-2 py-1 rounded text-slate-300">
                    {s.pipelineStagesCompleted.length}/{STAGES.length} Stages
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block">Input</span>
                    <span className="text-slate-300">{s.inputMinutes}m</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Output</span>
                    <span className="text-slate-300">S:{s.speakingMinutes}m W:{s.writingMinutes}m</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Constructions</span>
                    <span className="text-slate-300">{s.constructionsCaptured} Added</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Sleep</span>
                    <span className="text-slate-300">{s.sleepHours ? s.sleepHours + 'h' : 'Not Logged'}</span>
                  </div>
                </div>
                {s.sessionNotes && (
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Notes</span>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{s.sessionNotes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 mx-4 relative">
              <button
                onClick={() => setSelectedSession(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-200"
                aria-label="Close summary"
              >
                ✕
              </button>

              <header className="mb-4">
                <h3 className="text-2xl font-mono text-amber-500">{new Date(selectedSession.date).toLocaleDateString()}</h3>
                <p className="text-slate-400 text-sm">{selectedSession.pipelineStagesCompleted.length}/{STAGES.length} stages completed</p>
              </header>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-slate-500 block">Input</span>
                  <span className="text-slate-300">{selectedSession.inputMinutes}m</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Output</span>
                  <span className="text-slate-300">S:{selectedSession.speakingMinutes}m W:{selectedSession.writingMinutes}m</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Constructions</span>
                  <span className="text-slate-300">{selectedSession.constructionsCaptured} Added</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Sleep</span>
                  <span className="text-slate-300">{selectedSession.sleepHours ? selectedSession.sleepHours + 'h' : 'Not Logged'}</span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs uppercase text-slate-500 mb-2">Stages</h4>
                <ul className="space-y-2">
                  {STAGES.map((stage) => {
                    const done = selectedSession.pipelineStagesCompleted.includes(stage.id);
                    return (
                      <li key={stage.id} className={`flex items-center ${done ? 'text-amber-400' : 'text-slate-400'}`}>
                        <span className={`w-6 h-6 mr-3 flex items-center justify-center rounded-full ${done ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-800'}`}>{done ? '✓' : stage.id}</span>
                        <div>
                          <div className="font-mono">{stage.name}</div>
                          <div className="text-xs text-slate-500">{done ? 'Completed' : 'Not completed'}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-6">
                <h4 className="text-xs uppercase text-slate-500 mb-2">Notes</h4>
                <div className="bg-zinc-950 border border-zinc-800 rounded p-4 text-slate-300 text-sm whitespace-pre-wrap">
                  {selectedSession.sessionNotes || 'No notes for this day.'}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    const summary = `Date: ${selectedSession.date}\nStages: ${selectedSession.pipelineStagesCompleted.length}/${STAGES.length}\nInput: ${selectedSession.inputMinutes}m\nSpeaking: ${selectedSession.speakingMinutes}m\nNotes: ${selectedSession.sessionNotes || ''}`;
                    navigator.clipboard?.writeText(summary).then(() => toast('Summary copied to clipboard'));
                  }}
                  className="bg-zinc-800 px-4 py-2 rounded text-slate-300 hover:bg-zinc-700"
                >
                  Copy Summary
                </button>
                <button onClick={() => setSelectedSession(null)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-zinc-800 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-mono text-amber-500 font-bold mb-1">Daily Pipeline</h2>
          <p className="text-slate-400">Complete stages sequentially to maximize structural encoding.</p>
        </div>
        <button 
          onClick={() => setViewHistory(true)}
          className="text-slate-400 hover:text-slate-200 transition-colors bg-zinc-900 px-4 py-2 border border-zinc-800 rounded-md"
        >
          History
        </button>
      </header>

      <div className="space-y-4">
        {STAGES.map((stage) => {
          const isComplete = session.pipelineStagesCompleted.includes(stage.id);
          // @ts-ignore
          const currentValue = session[stage.key] || 0;
          const isGated = stage.id === 4 && currentValue < stage.target;

          return (
            <div 
              key={stage.id} 
              className={`bg-zinc-900 border-l-4 p-5 rounded-r-xl border-y border-r border-y-zinc-800 border-r-zinc-800 ${isComplete ? 'border-l-amber-500' : 'border-l-zinc-700'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-mono text-lg text-slate-200">
                    {stage.id}. {stage.name}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Requirement: {stage.min}</p>
                  <p className="text-sm text-amber-500/80 mt-1">Today&apos;s Progress: {currentValue}</p>
                  {isGated && !isComplete && (
                    <p className="text-[#cf6679] text-xs mt-1">Warning: Target not met, override advised only if necessary.</p>
                  )}
                </div>
                <button
                  onClick={() => toggleStage(stage.id)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    isComplete 
                      ? 'bg-blue-500/20 text-amber-500 border border-amber-500/50' 
                      : 'bg-zinc-800 text-slate-300 hover:bg-zinc-700'
                  }`}
                >
                  {isComplete ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
        <h3 className="font-mono text-lg text-slate-200">Session Notes</h3>
        <textarea
          value={session.sessionNotes}
          onChange={(e) => updateNotes(e.target.value)}
          className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-md p-3 text-slate-200 focus:outline-none focus:border-amber-500"
          placeholder="Jot down any overarching thoughts for today..."
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4 mt-8 flex flex-col items-center text-center">
        <h3 className="font-mono text-lg text-amber-500">End Day & Sleep Consolidation</h3>
        <p className="text-slate-400 text-sm">Enter hours of sleep from last night (target 7.5 - 9h). Memory consolidation happens during rest.</p>
        <div className="flex space-x-3 w-full max-w-sm">
          <input 
            type="number" 
            step="0.5"
            placeholder="Ex: 8.0"
            value={sleepInput}
            onChange={(e) => setSleepInput(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 text-center"
          />
          <button 
            onClick={handleEndDay}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-6 py-2 rounded-md font-bold transition-colors"
          >
            End Day
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/lib/context';
import { toast } from '@/lib/toast';

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
  const { getTodaySession, updateTodaySession } = useAppContext();
  const session = getTodaySession();
  const [sleepInput, setSleepInput] = useState('');

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
      updateTodaySession({ sleepHours: hours });
      toast('Day ended and sleep logged! Great work.');
      setSleepInput('');
    }
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-mono text-amber-500 font-bold mb-1">Daily Pipeline</h2>
        <p className="text-slate-400">Complete stages sequentially to maximize structural encoding.</p>
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

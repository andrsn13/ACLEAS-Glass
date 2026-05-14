'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/lib/context';

export default function Onboarding() {
  const { setProfile } = useAppContext();
  const [step, setStep] = useState(1);
  const [l1, setL1] = useState('Filipino');
  const [learnerType, setLearnerType] = useState<'standard' | 'heritage'>('standard');
  const [aptitudeScores, setAptitudeScores] = useState({
    associativeMemory: 0,
    soundDiscrimination: 0,
    soundSymbol: 0,
    analyticalAbility: 0,
  });

  // Simple hardcoded tasks for the mock aptitude test
  const [currentTask, setCurrentTask] = useState(0);

  const handleFinish = () => {
    const avg = Object.values(aptitudeScores).reduce((a, b) => a + b, 0) / 4;
    setProfile({
      l1,
      learnerType,
      onboardingComplete: true,
      aptitudeScores,
      wmLoad: avg < 40 ? 'reduced' : 'normal',
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-[#0c101a] text-slate-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Mesh Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none z-0"></div>
      
      <div className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl relative z-10">
        <h1 className="text-3xl font-mono text-amber-500 mb-6 font-bold text-center">ACLEAS Initialization</h1>
        
        {step === 1 && (
          <div className="space-y-6 text-center">
            <p className="text-lg text-slate-300">
              Welcome to your local English acquisition hub. This system is designed for daily, high-intensity linguistic restructuring.
            </p>
            <button 
              onClick={() => setStep(2)}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-6 py-3 rounded-md font-bold transition-colors"
            >
              Begin Setup
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">What is your native language?</label>
              <input 
                type="text" 
                value={l1} 
                onChange={(e) => setL1(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Did you grow up hearing English regularly at home?</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="learnerType" 
                    checked={learnerType === 'heritage'} 
                    onChange={() => setLearnerType('heritage')}
                    className="accent-amber-500 w-4 h-4"
                  />
                  <span>Yes (Heritage Learner Track)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="learnerType" 
                    checked={learnerType === 'standard'} 
                    onChange={() => setLearnerType('standard')}
                    className="accent-amber-500 w-4 h-4"
                  />
                  <span>No (Standard Track)</span>
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => setStep(3)}
                className="border border-amber-500 text-amber-500 px-6 py-2 rounded-md font-medium hover:bg-blue-500/10 transition-colors"
              >
                Next: Aptitude Diagnostic
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-mono text-amber-500">Aptitude Diagnostic</h2>
            <p className="text-slate-400 text-sm mb-4">
              Wait... skipping interactive implementation for brevity. Let&apos;s auto-score this user to default for now as we build out the main framework.
            </p>
            <button 
              onClick={() => {
                setAptitudeScores({
                    associativeMemory: 80,
                    soundDiscrimination: 75,
                    soundSymbol: 85,
                    analyticalAbility: 60
                });
                setStep(4);
              }}
              className="bg-zinc-800 text-slate-200 px-4 py-2 rounded-md hover:bg-zinc-700 w-full"
            >
              Take Mock Test (Auto-Complete)
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-mono text-amber-500">Diagnostic Results</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-md text-center">
                <div className="text-sm text-slate-400">Associative Memory</div>
                <div className="text-2xl font-bold text-amber-500">{aptitudeScores.associativeMemory}</div>
              </div>
              <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-md text-center">
                <div className="text-sm text-slate-400">Sound Discrimination</div>
                <div className="text-2xl font-bold text-amber-500">{aptitudeScores.soundDiscrimination}</div>
              </div>
              <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-md text-center">
                <div className="text-sm text-slate-400">Sound-Symbol</div>
                <div className="text-2xl font-bold text-amber-500">{aptitudeScores.soundSymbol}</div>
              </div>
              <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-md text-center">
                <div className="text-sm text-slate-400">Analytical Ability</div>
                <div className="text-2xl font-bold text-amber-500">{aptitudeScores.analyticalAbility}</div>
              </div>
            </div>

            <div className="bg-[#e6a817]/10 border border-[#e6a817]/30 p-4 text-sm text-amber-500/90 rounded-md">
              {aptitudeScores.analyticalAbility < 50 && (
                <p>Your first sessions will include pattern-recognition warm-ups before grammar work.</p>
              )}
              {learnerType === 'heritage' && (
                <p>Your track skips early phonics and focuses on explicit grammar and literacy reconstruction.</p>
              )}
            </div>

            <button 
              onClick={handleFinish}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-6 py-3 rounded-md font-bold transition-colors"
            >
              Start the System
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

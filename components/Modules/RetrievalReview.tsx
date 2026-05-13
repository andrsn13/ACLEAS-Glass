'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/lib/context';
import { Card, Construction, ErrorEntry } from '@/lib/types';
import { getTodayISO, addDays, generateUUID } from '@/lib/storage';

const getInterleavedCards = (dueCards: Card[], constructions: Construction[]) => {
  // Simple check for interleaving: avoiding same type in a row
  // We'll just shuffle them pseudo-randomly for now.
  const shuffled = [...dueCards].sort(() => Math.random() - 0.5);
  return shuffled;
};

export default function RetrievalReview() {
  const { cards, setCards, constructions, getTodaySession, updateTodaySession, errors, setErrors, profile } = useAppContext();
  const session = getTodaySession();
  
  const todayIso = getTodayISO();
  const dueCardsRaw = cards.filter(c => c.due <= todayIso);
  
  // Apply WM Load limit
  const maxSessionCards = profile?.wmLoad === 'reduced' ? 20 : dueCardsRaw.length;
  const sessionQueueInitial = dueCardsRaw.slice(0, maxSessionCards);

  const [queue, setQueue] = useState<Card[]>(getInterleavedCards(sessionQueueInitial, constructions));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, forgotten: 0 });
  const [isFinished, setIsFinished] = useState(false);
  
  const [showingErrorPrompt, setShowingErrorPrompt] = useState(false);
  const [lastFailedCardId, setLastFailedCardId] = useState<string | null>(null);

  const currentCard = queue[currentIndex];
  // Ignore cards with deleted constructions or missing links
  const constr = currentCard ? constructions.find(c => c.id === currentCard.constructionId) : null;

  const handleGrade = (grade: number) => {
    if (!currentCard) return;

    let { reps, lapses, interval, easeFactor, phase } = currentCard;
    
    if (grade === 1) {
      lapses += 1;
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      phase = 'learning';
    } else if (grade === 2) {
      interval = Math.max(1, Math.ceil(interval * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
    } else if (grade === 3) {
      if (reps === 0) interval = 1;
      else if (reps === 1) interval = 3;
      else interval = Math.ceil(interval * easeFactor);
      phase = 'review';
    } else if (grade === 4) {
      if (reps === 0) interval = 3;
      else if (reps === 1) interval = 7;
      else interval = Math.ceil(interval * easeFactor * 1.3);
      easeFactor = Math.min(2.5, easeFactor + 0.1);
      phase = 'review';
    }

    if (interval > 60 && (grade === 3 || grade === 4)) {
      interval = 60 + (interval % 30);
    }

    const updatedCard: Card = {
      ...currentCard,
      reps: reps + 1,
      lapses,
      interval,
      easeFactor,
      phase,
      lastGrade: grade,
      lastReviewed: todayIso,
      due: addDays(todayIso, interval),
      stabilityScore: Math.min(1.0, interval / 30)
    };

    setCards(cards.map(c => c.id === updatedCard.id ? updatedCard : c));
    
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      forgotten: prev.forgotten + (grade === 1 ? 1 : 0)
    }));

    if (grade === 1) {
      setLastFailedCardId(currentCard.constructionId);
      setShowingErrorPrompt(true);
    } else {
      nextCard();
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    if (currentIndex + 1 >= queue.length) {
      setIsFinished(true);
      updateTodaySession({
        cardsReviewed: session.cardsReviewed + sessionStats.reviewed + 1,
        cardsForgotten: session.cardsForgotten + sessionStats.forgotten
      });
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const logError = (type: 'A'|'B'|'C'|'D') => {
    if (!lastFailedCardId) return;
    const newErr: ErrorEntry = {
      id: generateUUID(),
      date: new Date().toISOString(),
      type,
      description: 'Logged during SRS retrieval failure.',
      constructionId: lastFailedCardId,
      context: 'Retrieval Review session',
      repairAction: type === 'A' ? 'Increase retrieval frequency.' : 'Monitor pattern.',
      resolved: false
    };
    setErrors([...errors, newErr]);
    setShowingErrorPrompt(false);
    nextCard();
  };

  if (queue.length === 0) {
    return (
      <div className="text-center py-20 animate-in fade-in">
        <div className="inline-block p-4 rounded-full bg-zinc-900 border border-zinc-800 mb-4">
          <span className="text-4xl">🎉</span>
        </div>
        <h2 className="text-2xl font-mono text-slate-200">No cards due</h2>
        <p className="text-slate-400 mt-2">Check back tomorrow or add new constructions.</p>
      </div>
    );
  }

  if (isFinished) {
    const vfp = sessionStats.reviewed > 0 ? Math.round((sessionStats.forgotten / sessionStats.reviewed) * 100) : 0;
    const isStrong = vfp < 20 && sessionStats.reviewed > 10;
    
    return (
        <div className="text-center py-10 animate-in fade-in">
          <div className={`inline-block p-6 rounded-xl border mb-6 ${isStrong ? 'bg-blue-600 hover:bg-blue-500/10 border-amber-500/30' : 'bg-zinc-900 border-zinc-800'}`}>
            <h2 className="text-2xl font-mono text-amber-500 mb-2">Review Complete</h2>
            <div className="space-y-1 text-slate-300">
              <p>Cards Reviewed: {sessionStats.reviewed}</p>
              <p>Cards Forgotten: {sessionStats.forgotten}</p>
              <p>Forgetting Rate: {vfp}%</p>
            </div>
            {isStrong && <p className="mt-4 text-green-500 font-medium">Strong retrieval session! ✓</p>}
          </div>
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center text-sm font-mono text-slate-400">
        <span>Card {currentIndex + 1} / {queue.length}</span>
        {currentCard?.reps >= 3 && !isFlipped && (
          <span className="text-amber-500 bg-blue-600 hover:bg-blue-500/10 px-2 py-1 rounded">Procedural Phase (Answer quickly)</span>
        )}
      </div>

      {!constr ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-[#cf6679]">
          <p>Error: Construction data missing for this card.</p>
          <button onClick={() => nextCard()} className="mt-4 bg-zinc-800 px-4 py-2 rounded-md">Skip</button>
        </div>
      ) : showingErrorPrompt ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
          <h3 className="text-xl font-mono text-[#cf6679]">Error Analysis</h3>
          <p className="text-slate-300">Why did you miss this card?</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => logError('A')} className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-amber-500 text-left">
              <strong className="text-amber-500 block">Type A</strong> Retrieval Failure (Known, but inaccessible)
            </button>
            <button onClick={() => logError('C')} className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-amber-500 text-left">
              <strong className="text-amber-500 block">Type C</strong> Processing Failure (Understood too slowly)
            </button>
            <button onClick={() => logError('D')} className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-amber-500 text-left">
              <strong className="text-amber-500 block">Type D</strong> Fossilized Pattern (Repeated wrong form)
            </button>
            <button onClick={() => logError('B')} className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-amber-500 text-left">
              <strong className="text-amber-500 block">Type B</strong> Knowledge Gap (Wait, I know nothing about this)
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          <div className="absolute top-4 left-4 bg-zinc-800 text-slate-400 text-xs px-2 py-1 rounded tracking-wider uppercase font-mono">
            {constr.type}
          </div>

          <div className="w-full space-y-6">
            <div className="text-slate-400 text-sm uppercase tracking-wider">Situation / Prompt:</div>
            <p className="text-xl text-slate-200">&quot;{constr.example}&quot;</p>
            <p className="text-slate-500 italic text-sm">Target Function: {constr.function}</p>
            
            {constr.l1InterferenceFlag && (
              <div className="mt-4 bg-[#cf6679]/10 text-[#cf6679] py-1 px-3 rounded-full text-xs inline-block">
                Focus: morphological cue → <strong>{constr.morphCueHighlight}</strong>
              </div>
            )}
          </div>

          {!isFlipped ? (
            <div className="mt-12 w-full pt-6 border-t border-zinc-800">
              <button 
                onClick={() => setIsFlipped(true)}
                className="w-full py-4 text-center text-xl font-bold font-mono bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors text-slate-200"
              >
                REVEAL
              </button>
            </div>
          ) : (
            <div className="mt-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-zinc-950 border-l-4 border-amber-500 text-left p-6 rounded-r-xl space-y-4">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Target Construction</div>
                  <div className="text-2xl font-bold text-slate-200 font-mono">{constr.construction}</div>
                </div>
                
                {constr.personalSentence && (
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Your Personal Sentence</div>
                    <div className="text-amber-500/90 font-mono">&quot;{constr.personalSentence}&quot;</div>
                  </div>
                )}
                
                {constr.gestureNote && (
                  <div className="text-sm text-slate-400 flex items-center space-x-2">
                    <span>✋</span> <span>Gesture: {constr.gestureNote}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 mt-6">
                <button onClick={() => handleGrade(1)} className="py-3 bg-[#cf6679]/10 text-[#cf6679] hover:bg-[#cf6679]/20 rounded-xl font-bold border border-[#cf6679]/30">
                  <div className="text-xs font-mono font-normal opacity-70">1</div> Again
                </button>
                <button onClick={() => handleGrade(2)} className="py-3 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded-xl font-bold border border-orange-500/30">
                  <div className="text-xs font-mono font-normal opacity-70">2</div> Hard
                </button>
                <button onClick={() => handleGrade(3)} className="py-3 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-xl font-bold border border-green-500/30">
                  <div className="text-xs font-mono font-normal opacity-70">3</div> Good
                </button>
                <button onClick={() => handleGrade(4)} className="py-3 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-xl font-bold border border-blue-500/30">
                  <div className="text-xs font-mono font-normal opacity-70">4</div> Easy
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/lib/context';
import { Construction, Card } from '@/lib/types';
import { generateUUID, getTodayISO } from '@/lib/storage';

const INITIAL_CONSTRUCTION: Omit<Construction, 'id' | 'addedAt'> = {
  construction: '',
  function: '',
  example: '',
  variation: '',
  personalSentence: '',
  l1Translation: '',
  gestureNote: '',
  imageUrl: '',
  l1InterferenceFlag: false,
  explicitRule: '',
  morphCueHighlight: '',
  type: 'grammar',
  source: '',
};

export default function ConstructionJournal() {
  const { constructions, setConstructions, cards, setCards, profile, getTodaySession, updateTodaySession } = useAppContext();
  const session = getTodaySession();
  
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState(INITIAL_CONSTRUCTION);
  
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Count additions today
  const todayIso = getTodayISO();
  const todayCount = constructions.filter(c => c.addedAt === todayIso).length;

  const handleEdit = (c: Construction) => {
    setFormData(c);
    setEditingId(c.id);
    setView('form');
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this construction and its associated flashcard?")) {
      setConstructions(constructions.filter(c => c.id !== id));
      setCards(cards.filter(c => c.constructionId !== id));
    }
  };

  const handleSave = () => {
    // Validation
    if (!formData.construction.trim().includes(' ')) {
      alert("Warning: Single words are not constructions. Add context (e.g., 'despite the fact that...').");
      return;
    }
    if (!formData.personalSentence.trim()) {
      alert("Personal sentence is mandatory.");
      return;
    }

    if (editingId) {
      setConstructions(constructions.map(c => c.id === editingId ? { ...formData, id: editingId, addedAt: c.addedAt } : c));
    } else {
      const newId = generateUUID();
      const newConstruction: Construction = {
        ...formData,
        id: newId,
        addedAt: todayIso,
      };
      setConstructions([newConstruction, ...constructions]);
      
      // Create associated card
      const newCard: Card = {
        id: generateUUID(),
        constructionId: newId,
        due: todayIso,
        interval: 1,
        easeFactor: 2.5,
        reps: 0,
        lapses: 0,
        phase: 'learning',
        lastReviewed: 'Never',
        lastGrade: 0,
        stabilityScore: 1.0,
      };
      setCards([...cards, newCard]);

      updateTodaySession({ constructionsCaptured: session.constructionsCaptured + 1 });
    }

    setView('list');
    setFormData(INITIAL_CONSTRUCTION);
    setEditingId(null);
  };

  const filteredConstructions = constructions.filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (searchQuery && !c.construction.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-3xl font-mono text-amber-500 font-bold mb-1">Construction Journal</h2>
          <p className="text-slate-400">Capture multi-word frames and functional language.</p>
        </div>
        {view === 'list' && (
          <button 
            onClick={() => {
              setFormData({...INITIAL_CONSTRUCTION, l1Translation: ''});
              setEditingId(null);
              setView('form');
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-4 py-2 rounded-md font-bold hover:bg-amber-400 transition-colors"
          >
            + Add Construction
          </button>
        )}
      </header>

      {view === 'list' ? (
        <div className="space-y-4">
          <div className="flex space-x-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <input 
              type="text" 
              placeholder="Search constructions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500"
            />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Types</option>
              <option value="grammar">Grammar</option>
              <option value="discourse">Discourse</option>
              <option value="vocabulary">Vocabulary</option>
              <option value="pronunciation">Pronunciation</option>
            </select>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {filteredConstructions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p>No constructions found. Start building your repository.</p>
                <button 
                  onClick={() => setView('form')}
                  className="mt-4 border border-zinc-700 px-4 py-2 rounded-md hover:bg-zinc-800"
                >
                  Create First Entry
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {filteredConstructions.map(c => (
                  <li key={c.id} className="p-4 hover:bg-zinc-800/50 transition-colors flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-lg font-bold text-slate-200">{c.construction}</h4>
                        <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-slate-400 font-mono tracking-wider">{c.type}</span>
                        {c.l1InterferenceFlag && <span className="text-xs px-2 py-0.5 rounded-full bg-[#cf6679]/20 text-[#cf6679] font-mono">L1 Block</span>}
                      </div>
                      <p className="text-sm text-slate-400">{c.function}</p>
                      <p className="text-sm text-amber-500/80 mt-2 font-mono">&quot;{c.personalSentence}&quot;</p>
                    </div>
                    <div className="flex space-x-2 shrink-0">
                      <button onClick={() => handleEdit(c)} className="p-2 text-slate-400 hover:text-amber-500">Edit</button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-[#cf6679]">Del</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className={`text-sm text-right ${todayCount > 15 ? 'text-[#cf6679]' : 'text-slate-500'}`}>
            Daily capture count: {todayCount}/15 {todayCount > 15 && '(Warning: Overload risk)'}
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-mono text-xl text-amber-500">{editingId ? 'Edit' : 'Add'} Construction</h3>
            <button onClick={() => setView('list')} className="text-slate-400 hover:text-slate-200">Cancel</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Construction (multi-word frame)</label>
                <input 
                  type="text" 
                  value={formData.construction} 
                  onChange={(e) => setFormData({...formData, construction: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500 font-bold"
                  placeholder="e.g. despite the fact that..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Function/Meaning</label>
                <input 
                  type="text" 
                  value={formData.function} 
                  onChange={(e) => setFormData({...formData, function: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Expressing contrast"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                <select 
                  value={formData.type} 
                  // @ts-ignore
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500"
                >
                  <option value="grammar">Grammar</option>
                  <option value="discourse">Discourse</option>
                  <option value="vocabulary">Vocabulary</option>
                  <option value="pronunciation">Pronunciation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Source</label>
                <input 
                  type="text" 
                  value={formData.source} 
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500"
                  placeholder="Podcast episode, article..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Example sentence (from source)</label>
                <textarea 
                  value={formData.example} 
                  onChange={(e) => setFormData({...formData, example: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500 h-20 resize-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-500 mb-1">Your personal sentence (mandatory)</label>
                <textarea 
                  value={formData.personalSentence} 
                  onChange={(e) => setFormData({...formData, personalSentence: e.target.value})}
                  className="w-full bg-zinc-950 border border-amber-500/50 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500 h-20 resize-none font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Variation</label>
                <textarea 
                  value={formData.variation} 
                  onChange={(e) => setFormData({...formData, variation: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500 h-16 resize-none font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-6">
            <h4 className="text-sm font-mono text-slate-500 mb-4 uppercase tracking-wider">Advanced Encoding Hooks</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">L1 Translation (Optional, {profile?.l1})</label>
                <input 
                  type="text" 
                  value={formData.l1Translation} 
                  onChange={(e) => setFormData({...formData, l1Translation: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-1.5 px-3 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Physical Gesture Association</label>
                <input 
                  type="text" 
                  value={formData.gestureNote} 
                  onChange={(e) => setFormData({...formData, gestureNote: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-1.5 px-3 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Image URL</label>
                <input 
                  type="text" 
                  value={formData.imageUrl} 
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-1.5 px-3 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Morphological Cue to Highlight</label>
                <input 
                  type="text" 
                  value={formData.morphCueHighlight} 
                  onChange={(e) => setFormData({...formData, morphCueHighlight: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-1.5 px-3 focus:outline-none focus:border-amber-500 text-sm"
                  placeholder="e.g. -ed"
                />
              </div>
            </div>
            
            <div className="mt-4 flex items-center space-x-3 bg-[#cf6679]/5 border border-[#cf6679]/20 p-3 rounded-md">
              <input 
                type="checkbox" 
                id="l1-block"
                checked={formData.l1InterferenceFlag} 
                onChange={(e) => setFormData({...formData, l1InterferenceFlag: e.target.checked})}
                className="accent-[#cf6679] w-4 h-4"
              />
              <label htmlFor="l1-block" className="text-sm text-[#cf6679]">My L1 blocks this feature (requires extra focus)</label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-800">
            <button 
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-8 py-3 rounded-md font-bold hover:bg-amber-400 transition-colors"
            >
              Save Construction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

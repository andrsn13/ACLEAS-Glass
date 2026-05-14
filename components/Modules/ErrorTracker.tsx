'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/lib/context';
import { ErrorEntry } from '@/lib/types';
import { generateUUID } from '@/lib/storage';

export default function ErrorTracker() {
  const { errors, setErrors, constructions } = useAppContext();
  const [view, setView] = useState<'list' | 'add'>('list');

  const [formData, setFormData] = useState<Partial<ErrorEntry>>({
    type: 'A',
    description: '',
    constructionId: '',
    context: '',
    repairAction: 'Increase retrieval frequency. Review card daily.',
    resolved: false
  });

  const handleTypeChange = (type: 'A'|'B'|'C'|'D') => {
    let repairAction = '';
    if (type === 'A') repairAction = 'Increase retrieval frequency. Review card daily.';
    if (type === 'B') repairAction = 'Add to Construction Journal immediately.';
    if (type === 'C') repairAction = 'Reduce audio speed temporarily. Replay this segment.';
    if (type === 'D') repairAction = 'High-frequency corrective production drills on this form.';
    
    setFormData({ ...formData, type, repairAction });
  };

  const handleSave = () => {
    const newErr: ErrorEntry = {
      id: generateUUID(),
      date: new Date().toISOString(),
      type: formData.type as 'A'|'B'|'C'|'D',
      description: formData.description || '',
      constructionId: formData.constructionId || '',
      context: formData.context || '',
      repairAction: formData.repairAction || '',
      resolved: false
    };
    setErrors([...errors, newErr]);
    setView('list');
    setFormData({ type: 'A', description: '', constructionId: '', context: '', repairAction: 'Increase retrieval frequency. Review card daily.', resolved: false });
  };

  const toggleResolved = (id: string, current: boolean) => {
    setErrors(errors.map(e => e.id === id ? { ...e, resolved: !current } : e));
  };

  const typeACount = errors.filter(e => e.type === 'A').length;
  const typeBCount = errors.filter(e => e.type === 'B').length;
  const typeCCount = errors.filter(e => e.type === 'C').length;
  const typeDCount = errors.filter(e => e.type === 'D').length;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-3xl font-mono text-amber-500 font-bold mb-1">Error Tracker</h2>
          <p className="text-slate-400">Log and manage language errors.</p>
        </div>
        {view === 'list' && (
          <button 
            onClick={() => setView('add')}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-4 py-2 rounded-md font-bold transition-colors"
          >
            + Log Error
          </button>
        )}
      </header>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg text-center">
          <div className="text-xs text-slate-400 font-bold tracking-wider mb-1">A: RETRIEVAL</div>
          <div className="text-2xl font-mono text-slate-200">{typeACount}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg text-center">
          <div className="text-xs text-slate-400 font-bold tracking-wider mb-1">B: KNOWLEDGE</div>
          <div className="text-2xl font-mono text-slate-200">{typeBCount}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg text-center">
          <div className="text-xs text-slate-400 font-bold tracking-wider mb-1">C: PROCESSING</div>
          <div className="text-2xl font-mono text-slate-200">{typeCCount}</div>
        </div>
        <div className="bg-[#cf6679]/10 border border-[#cf6679]/30 p-4 rounded-lg text-center">
          <div className="text-xs text-[#cf6679] font-bold tracking-wider mb-1">D: FOSSILIZED</div>
          <div className="text-2xl font-mono text-[#cf6679]">{typeDCount}</div>
        </div>
      </div>

      {view === 'list' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {errors.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No errors logged. Continue immersion.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-950/50 text-slate-400">
                  <tr>
                    <th className="p-4 font-normal">Type</th>
                    <th className="p-4 font-normal">Date</th>
                    <th className="p-4 font-normal">Description</th>
                    <th className="p-4 font-normal">Action</th>
                    <th className="p-4 font-normal text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {errors.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(e => (
                    <tr key={e.id} className="hover:bg-zinc-800/30">
                      <td className="p-4"><span className={`px-2 py-1 rounded font-mono text-xs ${e.type === 'D' ? 'bg-[#cf6679]/20 text-[#cf6679]' : 'bg-blue-500/10 text-amber-500'}`}>Type {e.type}</span></td>
                      <td className="p-4 text-slate-500">{new Date(e.date).toLocaleDateString()}</td>
                      <td className="p-4 text-slate-200">{e.description}</td>
                      <td className="p-4 text-slate-400 text-xs truncate max-w-[200px]">{e.repairAction}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => toggleResolved(e.id, e.resolved)}
                          className={`px-3 py-1 rounded-full text-xs font-bold ${e.resolved ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 'bg-zinc-800 text-slate-400 hover:text-slate-200 hover:bg-zinc-700 border border-zinc-700'}`}
                        >
                          {e.resolved ? 'Resolved' : 'Active'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {view === 'add' && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-mono text-xl text-amber-500">Log New Error</h3>
            <button onClick={() => setView('list')} className="text-slate-400 hover:text-slate-200">Cancel</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Error Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleTypeChange('A')} className={`p-3 text-left border rounded-md ${formData.type === 'A' ? 'border-amber-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-950'}`}>
                  <strong className="block text-slate-200 font-mono">A. Retrieval Failure</strong><span className="text-xs text-slate-500">Known but inaccessible</span>
                </button>
                <button onClick={() => handleTypeChange('B')} className={`p-3 text-left border rounded-md ${formData.type === 'B' ? 'border-amber-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-950'}`}>
                  <strong className="block text-slate-200 font-mono">B. Knowledge Gap</strong><span className="text-xs text-slate-500">Construction absent</span>
                </button>
                <button onClick={() => handleTypeChange('C')} className={`p-3 text-left border rounded-md ${formData.type === 'C' ? 'border-amber-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-950'}`}>
                  <strong className="block text-slate-200 font-mono">C. Processing Failure</strong><span className="text-xs text-slate-500">Understood too slowly</span>
                </button>
                <button onClick={() => handleTypeChange('D')} className={`p-3 text-left border rounded-md ${formData.type === 'D' ? 'border-[#cf6679] bg-[#cf6679]/10' : 'border-zinc-800 bg-zinc-950'}`}>
                  <strong className="block text-[#cf6679] font-mono">D. Fossilized Pattern</strong><span className="text-xs text-slate-500">Repeated stable incorrect form</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
              <input 
                type="text" 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500 text-slate-200"
                placeholder="e.g. Used present perfect instead of past simple."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Linked Construction (Optional)</label>
              <select 
                value={formData.constructionId}
                onChange={e => setFormData({...formData, constructionId: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500 text-slate-200"
              >
                <option value="">None</option>
                {constructions.map(c => <option key={c.id} value={c.id}>{c.construction}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Context</label>
              <textarea 
                value={formData.context}
                onChange={e => setFormData({...formData, context: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500 h-20 resize-none text-sm text-slate-200"
                placeholder="Was speaking to a colleague about..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Repair Action</label>
              <textarea 
                value={formData.repairAction}
                onChange={e => setFormData({...formData, repairAction: e.target.value})}
                className="w-full bg-zinc-950 border border-amber-500/50 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500 h-16 resize-none text-sm font-mono text-amber-500/90"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-8 py-3 rounded-lg font-bold transition-colors"
              >
                Log Error
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

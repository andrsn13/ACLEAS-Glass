'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/lib/context';
import { toast } from '@/lib/toast';

export default function Settings() {
  const { apiKey, setApiKey, profile, setProfile } = useAppContext();
  
  const [localKey, setLocalKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSaveProfile = (updates: Partial<typeof profile>) => {
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  const handleClearData = () => {
    if (confirmClear) {
      localStorage.clear();
      window.location.reload();
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  const handleExport = () => {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('acleas_')) {
            data[key] = localStorage.getItem(key);
        }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acleas_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (confirm("This will overwrite your existing data. Proceed?")) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                for (const key in data) {
                    if (key.startsWith('acleas_')) {
                        localStorage.setItem(key, data[key]);
                    }
                }
                toast("Import successful. Application will reload.");
                window.location.reload();
            } catch (err) {
                toast("Invalid JSON file.");
            }
        };
        reader.readAsText(file);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <header className="border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-mono text-amber-500 font-bold mb-1">System Settings</h2>
        <p className="text-slate-400">Configure parameters and manage local data.</p>
      </header>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
        <h3 className="font-mono text-lg text-slate-200">Gemini 2.5 Flash API Key</h3>
        <p className="text-sm text-slate-400">Get your free key at <a href="https://aistudio.google.com" target="_blank" className="text-amber-500 hover:underline">aistudio.google.com</a>.</p>
        
        <div className="flex space-x-3">
          <input 
            type={showKey ? 'text' : 'password'}
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            placeholder="AIzaSy..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
          />
          <button 
            onClick={() => setShowKey(!showKey)}
            className="bg-zinc-800 px-4 rounded-md text-slate-300 hover:bg-zinc-700 font-medium"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
          <button 
            onClick={() => setApiKey(localKey)}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-6 rounded-md font-bold"
          >
            Save
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6">
        <h3 className="font-mono text-lg text-slate-200">Learner Profile</h3>
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Native Language (L1)</label>
          <input 
            type="text" 
            value={profile.l1}
            onChange={(e) => handleSaveProfile({ l1: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Learner Track</label>
          <div className="flex space-x-6">
            <label className="flex items-center space-x-2">
              <input type="radio" name="learnerTrack" className="accent-amber-500" 
                checked={profile.learnerType === 'standard'} 
                onChange={() => handleSaveProfile({ learnerType: 'standard' })}
              />
              <span className="text-slate-300 text-sm">Standard</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="learnerTrack" className="accent-amber-500" 
                checked={profile.learnerType === 'heritage'} 
                onChange={() => handleSaveProfile({ learnerType: 'heritage' })}
              />
              <span className="text-slate-300 text-sm">Heritage</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Working Memory Load</label>
          <div className="flex space-x-6">
            <label className="flex items-center space-x-2">
              <input type="radio" name="wmLoad" className="accent-amber-500" 
                checked={profile.wmLoad === 'normal'} 
                onChange={() => handleSaveProfile({ wmLoad: 'normal' })}
              />
              <span className="text-slate-300 text-sm">Normal (No SRS card cap)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="wmLoad" className="accent-amber-500" 
                checked={profile.wmLoad === 'reduced'} 
                onChange={() => handleSaveProfile({ wmLoad: 'reduced' })}
              />
              <span className="text-slate-300 text-sm">Reduced (Max 20 cards per session)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
        <h3 className="font-mono text-lg text-slate-200">Data Management</h3>
        <p className="text-sm text-slate-400 mb-4">All your data is stored locally in this browser. Export regularly.</p>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleExport}
            className="border border-amber-500 text-amber-500 px-6 py-2 rounded-md font-medium hover:bg-blue-500/10 transition-colors"
          >
            Export Backup (.json)
          </button>
          
          <label className="border border-zinc-700 text-slate-300 px-6 py-2 rounded-md font-medium hover:bg-zinc-800 hover:text-slate-200 transition-colors cursor-pointer inline-flex items-center">
            Import Backup
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>

        <div className="pt-8 border-t border-zinc-800 mt-8">
            <h4 className="text-[#cf6679] font-bold mb-2">Danger Zone</h4>
            <button 
              onClick={handleClearData}
              className="bg-[#cf6679]/10 text-[#cf6679] border border-[#cf6679]/30 px-6 py-2 rounded-md font-bold hover:bg-[#cf6679]/20 transition-colors"
            >
              {confirmClear ? "Click again to confirm DELETE" : "Clear All Data & Reset App"}
            </button>
        </div>
      </div>
    </div>
  );
}

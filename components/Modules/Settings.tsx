'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/lib/context';
import { toast } from '@/lib/toast';
import { googleSignIn, logout, initAuth } from '@/lib/firebase';
import { User } from 'firebase/auth';

export default function Settings() {
  const { apiKey, setApiKey, profile, setProfile } = useAppContext();
  
  const [localKey, setLocalKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (googleUser) => setUser(googleUser),
      () => setUser(null)
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        toast('Logged in to Google Workspace successfully.');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      toast('Login failed: ' + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    toast('Logged out of Google Workspace.');
  };

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
        <h3 className="font-mono text-lg text-slate-200">Google Workspace Sync</h3>
        <p className="text-sm text-slate-400">Sign in to save your session logs to Google Docs and save audio recordings to Google Drive.</p>
        
        {user ? (
          <div className="flex items-center space-x-4 border border-green-500/30 bg-green-500/10 p-4 rounded-md">
            <img src={user.photoURL || ''} alt="User" className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-200">{user.displayName}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-zinc-800 hover:bg-zinc-700 text-slate-200 px-4 py-2 rounded-md font-bold text-sm"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div>
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="mt-2 gsi-material-button bg-white text-slate-900 flex items-center space-x-2 px-4 py-2 font-medium rounded shadow-sm hover:bg-slate-100 disabled:opacity-50"
            >
              <div className="w-5 h-5">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span>{isLoggingIn ? 'Signing in...' : 'Sign in with Google'}</span>
            </button>
          </div>
        )}
      </div>

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

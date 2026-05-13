'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/lib/context';
import { generateUUID, getTodayISO } from '@/lib/storage';
import { AIConversation as AIType } from '@/lib/types';

export default function AIConversation() {
  const { apiKey, profile, errors, getTodaySession, updateTodaySession, conversations, setConversations } = useAppContext();
  const session = getTodaySession();
  
  const [mode, setMode] = useState<'drill' | 'conversation'>('drill');
  const [topic, setTopic] = useState('Daily Life');
  
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [delayedFeedback, setDelayedFeedback] = useState<string>('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const callGemini = async (systemPrompt: string, history: any[], userInput?: string) => {
    if (!apiKey) throw new Error('NO_API_KEY');

    const contents = [...history];
    if (userInput) {
      contents.push({ role: 'user', parts: [{ text: userInput }] });
    }

    const payload = {
      contents,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );

    if (res.status === 429) throw new Error('RATE_LIMIT');
    if (!res.ok) throw new Error('API_ERROR');

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  };

  const getSystemPrompt = () => {
    if (mode === 'drill') {
      const topErrors = Array.from(new Set(errors.slice(-5).map(e => e.type))).join(', ');
      return `You are an English language drill instructor. The user is a ${profile?.l1 || 'Filipino'} speaker learning English.
      Your role: present grammar and construction drills. After each user response, immediately provide corrective feedback if there is any error.
      Be concise, precise, and direct. Focus on error types: ${topErrors || 'general grammar'}.
      Keep corrections brief (one sentence). Then present the next drill prompt. Start by presenting a drill immediately.`;
    } else {
      return `You are a natural English conversation partner. The user is a ${profile?.l1 || 'Filipino'} speaker practicing English. Your role: have a genuine, flowing conversation on the chosen topic.
      RULES:
      1. Do NOT correct grammar errors mid-conversation. Maintain conversational flow.
      2. When the user's meaning is unclear, respond with a natural clarification request (e.g., "Wait, did you mean X or Y?"). Do NOT say "That was grammatically incorrect."
      3. Maintain native speed and natural phrasing. Do not oversimplify.
      4. If the user pauses or seems stuck, ask a follow-up question to keep them going.
      5. After the conversation ends, you will be asked to provide feedback — NOT during the conversation.
      Topic: ${topic}`;
    }
  };

  const handleStart = async () => {
    if (!apiKey) {
      alert("API Key missing! Please add it in Settings.");
      return;
    }
    
    setChatHistory([]);
    setDelayedFeedback('');
    setSessionStartTime(Date.now());
    const newId = generateUUID();
    setActiveConversationId(newId);
    
    setIsLoading(true);
    try {
      const response = await callGemini(getSystemPrompt(), []);
      setChatHistory([{ role: 'model', text: response }]);
    } catch (e: any) {
      alert(`AI Error: ${e.message}`);
    }
    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userMsg = inputText.trim();
    setInputText('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    
    setIsLoading(true);
    try {
      const gHistory = chatHistory.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
      const response = await callGemini(getSystemPrompt(), gHistory, userMsg);
      setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    } catch (e: any) {
      alert(`AI Error: ${e.message}`);
    }
    setIsLoading(false);
  };

  const handleEnd = async () => {
    if (!activeConversationId) return;

    const durationMinutes = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 60000) : 0;
    
    updateTodaySession({ 
      aiConversationMinutes: session.aiConversationMinutes + durationMinutes 
    });

    let finalFeedback = '';

    if (mode === 'conversation' && chatHistory.length > 2) {
      setIsLoading(true);
      try {
        const transcriptText = chatHistory.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
        const feedbackPrompt = `You just had this conversation:\n${transcriptText}\n\nNow provide a brief post-session feedback summary covering:
        1. Most significant grammar/construction errors (list max 3, with correction)
        2. Pronunciation or fluency notes you inferred from phrasing
        3. One construction the user should add to their journal
        4. One thing done well
        Keep feedback concise and constructive.`;
        
        finalFeedback = await callGemini(feedbackPrompt, []);
        setDelayedFeedback(finalFeedback);
      } catch (e: any) {
        console.error("Feedback error", e);
      }
      setIsLoading(false);
    }

    const newLog: AIType = {
      id: activeConversationId,
      date: getTodayISO(),
      mode,
      topic,
      transcript: chatHistory,
      durationMinutes,
      delayedFeedback: finalFeedback
    };

    setConversations([newLog, ...conversations]);
    setActiveConversationId(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <header className="border-b border-zinc-800 pb-4 mb-4 shrink-0">
        <h2 className="text-3xl font-mono text-amber-500 font-bold mb-2">AI Conversation</h2>
        
        {!activeConversationId ? (
          <div className="flex items-center space-x-4 bg-zinc-900 border border-zinc-800 p-2 rounded-xl">
            <div className="flex bg-zinc-950 rounded-lg p-1">
              <button 
                onClick={() => setMode('drill')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'drill' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Drill Mode (Immediate)
              </button>
              <button 
                onClick={() => setMode('conversation')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'conversation' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Conversation Mode (Delayed)
              </button>
            </div>
            
            {mode === 'conversation' && (
              <select 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 focus:outline-none focus:border-amber-500 text-sm text-slate-200"
              >
                {['Daily Life', 'Current Events', 'Opinions & Arguments', 'Storytelling', 'Explaining a Concept', 'Debating'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}

            <button 
              onClick={handleStart}
              className="ml-auto bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-6 py-2 rounded-lg font-bold hover:bg-amber-400 transition-colors"
            >
              Start Connection
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center bg-zinc-900 border border-amber-500/30 p-4 rounded-xl">
            <div>
              <span className="text-amber-500 font-mono tracking-wider uppercase text-sm animate-pulse">● Live Connection Active</span>
              <p className="text-xs text-slate-400 mt-1">Mode: {mode.toUpperCase()} {mode === 'conversation' && `| Topic: ${topic}`}</p>
            </div>
            <button 
              onClick={handleEnd}
              className="bg-[#cf6679]/20 text-[#cf6679] border border-[#cf6679]/50 px-4 py-2 rounded-lg font-bold hover:bg-[#cf6679]/30 transition-colors"
            >
              End Conversation
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2">
        {chatHistory.length === 0 && !activeConversationId && !delayedFeedback && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
            <span className="text-4xl text-zinc-800">● 💬 ●</span>
            <p className="max-w-md text-center">
              Ensure you have provided a free Gemini API key in Settings.
              Choose Drill Mode for intensive structural correction, or Conversation Mode for fluency and delayed feedback.
            </p>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl' : 'bg-zinc-800 text-slate-200'}`}>
              <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 text-slate-400 max-w-[80%] rounded-2xl p-4 flex items-center space-x-2">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {delayedFeedback && (
        <div className="mt-4 p-6 bg-zinc-900 border border-amber-500/50 rounded-xl space-y-2 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-amber-500 font-mono font-bold text-lg mb-4">Delayed Structural Feedback</h3>
          <p className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {delayedFeedback}
          </p>
        </div>
      )}

      {activeConversationId && (
        <div className="mt-4 shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex space-x-2"
          >
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-slate-200 focus:outline-none focus:border-amber-500 disabled:opacity-50"
              placeholder="Type your response... (Speak aloud as you type for maximum effect)"
            />
            <button 
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl px-8 rounded-lg font-bold hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

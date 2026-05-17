'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Pause, Mic, Clock, UploadCloud } from 'lucide-react';
import { syncToDocs, uploadAudioToDrive } from '@/lib/useDocsSync';
import { toast } from '@/lib/toast';

type TimestampMarker = {
  timeOffset: number; // in seconds
  label: string;
};

export default function MonologueRecorder({ topic, onLogRun }: { topic: string, onLogRun: (durationMinutes: number) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [markers, setMarkers] = useState<TimestampMarker[]>([]);
  const [notes, setNotes] = useState('');
  const [markerLabelInput, setMarkerLabelInput] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setMarkers([]);
      setAudioUrl(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      toast('Failed to access microphone.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const handleAddMarker = () => {
    if (!isRecording) return;
    setMarkers([...markers, { timeOffset: recordingTime, label: markerLabelInput || 'Marked' }]);
    setMarkerLabelInput('');
  };

  const handleSyncToDocs = async () => {
    if (audioChunksRef.current.length === 0) return;
    setIsSyncing(true);
    toast('Syncing to Google Docs and Drive...');

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Upload audio to Drive
      let driveLink = '';
      try {
        const link = await uploadAudioToDrive(audioBlob);
        if (link) driveLink = link;
      } catch (e) {
        console.warn('Could not upload audio to Drive', e);
      }

      // Format notes and timestamps
      let details = `Notes:\n${notes}\n\n`;
      if (markers.length > 0) {
        details += `Timestamps:\n${markers.map(m => `- ${Math.floor(m.timeOffset / 60)}:${String(m.timeOffset % 60).padStart(2,'0')} - ${m.label}`).join('\n')}\n\n`;
      }
      if (driveLink) {
        details += `Audio File: ${driveLink}\n`;
      }

      const durationMinutes = Math.max(1, Math.round(recordingTime / 60));
      
      const success = await syncToDocs('logSessionText', {
        title: `Monologue: ${topic}`,
        details: details.trim(),
        duration: durationMinutes
      });

      if (success) {
        toast('Successfully saved to Google Docs!');
        onLogRun(durationMinutes);
      } else {
        toast('Failed to save to Google Docs. Please check settings/login.');
      }
    } catch (e) {
      console.error(e);
      toast('An error occurred during sync.');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${isRecording && !isPaused ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-zinc-800 text-slate-400'}`}>
            <Mic size={24} />
          </div>
          <div className="font-mono text-2xl text-slate-200">
            {formatTime(recordingTime)}
          </div>
        </div>

        <div className="flex space-x-2">
          {!isRecording && !audioUrl && (
            <button onClick={startRecording} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold">
              <Play size={18} /> <span>Start</span>
            </button>
          )}
          {isRecording && !isPaused && (
            <button onClick={pauseRecording} className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-bold">
              <Pause size={18} /> <span>Pause</span>
            </button>
          )}
          {isRecording && isPaused && (
            <button onClick={resumeRecording} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold">
              <Play size={18} /> <span>Resume</span>
            </button>
          )}
          {isRecording && (
            <button onClick={stopRecording} className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
              <Square size={18} /> <span>Stop</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-400">Mark Timestamp</label>
          <div className="flex space-x-2">
            <input 
              type="text" 
              value={markerLabelInput}
              onChange={(e) => setMarkerLabelInput(e.target.value)}
              placeholder="E.g., Stumbled on vocab..." 
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              disabled={!isRecording}
            />
            <button 
              onClick={handleAddMarker} 
              disabled={!isRecording}
              className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-slate-200 px-3 py-2 rounded-md font-bold flex items-center space-x-1"
            >
              <Clock size={16} /> <span>Mark</span>
            </button>
          </div>
          {markers.length > 0 && (
            <div className="bg-zinc-900 p-3 rounded-md space-y-1 max-h-32 overflow-y-auto">
              {markers.map((m, i) => (
                <div key={i} className="text-xs flex items-center space-x-2">
                  <span className="font-mono text-amber-500">{formatTime(m.timeOffset)}</span>
                  <span className="text-slate-300">{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-400">Session Notes</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write reflections, new ideas, or feedback here..." 
            className="w-full h-24 bg-zinc-900 border border-zinc-700 rounded-md py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>
      </div>

      {audioUrl && !isRecording && (
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
          <audio src={audioUrl} controls className="h-10" />
          <button 
            onClick={handleSyncToDocs}
            disabled={isSyncing}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-bold"
          >
            <UploadCloud size={18} />
            <span>{isSyncing ? 'Syncing...' : 'Save & Sync to Google Docs'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Profile,
  Construction,
  Card,
  SessionLog,
  ErrorEntry,
  WeeklyReview,
  Streak,
  AIConversation,
} from './types';
import { storage, getTodayISO, addDays } from './storage';

type AppContextType = {
  activeModule: number;
  setActiveModule: (id: number) => void;
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
  constructions: Construction[];
  setConstructions: (c: Construction[]) => void;
  cards: Card[];
  setCards: (c: Card[]) => void;
  sessions: SessionLog[];
  setSessions: (s: SessionLog[]) => void;
  errors: ErrorEntry[];
  setErrors: (e: ErrorEntry[]) => void;
  weekly: WeeklyReview[];
  setWeekly: (w: WeeklyReview[]) => void;
  streak: Streak;
  setStreak: (s: Streak) => void;
  conversations: AIConversation[];
  setConversations: (c: AIConversation[]) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  isLoaded: boolean;
  getTodaySession: () => SessionLog;
  updateTodaySession: (updates: Partial<SessionLog>) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeModule, setActiveModuleState] = useState(1);
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [constructions, setConstructionsState] = useState<Construction[]>([]);
  const [cards, setCardsState] = useState<Card[]>([]);
  const [sessions, setSessionsState] = useState<SessionLog[]>([]);
  const [errors, setErrorsState] = useState<ErrorEntry[]>([]);
  const [weekly, setWeeklyState] = useState<WeeklyReview[]>([]);
  const [streak, setStreakState] = useState<Streak>({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    totalDaysActive: 0,
  });
  const [conversations, setConversationsState] = useState<AIConversation[]>([]);
  const [apiKey, setApiKeyState] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveModuleState(storage.getActiveModule());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfileState(storage.getProfile());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConstructionsState(storage.getConstructions());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCardsState(storage.getCards());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionsState(storage.getSessions());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrorsState(storage.getErrors());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWeeklyState(storage.getWeekly());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConversationsState(storage.getConversations());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApiKeyState(storage.getApiKey());

    // Initialize or load streak
    const loadedStreak = storage.getStreak();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreakState(loadedStreak);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, []);

  const setActiveModule = (id: number) => {
    setActiveModuleState(id);
    storage.setActiveModule(id);
  };

  const setProfile = (p: Profile) => {
    setProfileState(p);
    storage.setProfile(p);
  };

  const setConstructions = (c: Construction[]) => {
    setConstructionsState(c);
    storage.setConstructions(c);
  };

  const setCards = (c: Card[]) => {
    setCardsState(c);
    storage.setCards(c);
  };

  const setSessions = (s: SessionLog[]) => {
    setSessionsState(s);
    storage.setSessions(s);
  };

  const setErrors = (e: ErrorEntry[]) => {
    setErrorsState(e);
    storage.setErrors(e);
  };

  const setWeekly = (w: WeeklyReview[]) => {
    setWeeklyState(w);
    storage.setWeekly(w);
  };

  const setStreak = (s: Streak) => {
    setStreakState(s);
    storage.setStreak(s);
  };

  const setConversations = (c: AIConversation[]) => {
    setConversationsState(c);
    storage.setConversations(c);
  };

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    storage.setApiKey(key);
  };

  const getTodaySession = () => {
    const today = getTodayISO();
    let currentSession = sessions.find((s) => s.date === today);
    if (!currentSession) {
      currentSession = {
        id: crypto.randomUUID(),
        date: today,
        inputMinutes: 0,
        inputComprehension: 0,
        speakingMinutes: 0,
        writingMinutes: 0,
        shadowingMinutes: 0,
        passiveMinutes: 0,
        constructionsCaptured: 0,
        cardsReviewed: 0,
        cardsForgotten: 0,
        aiConversationMinutes: 0,
        pipelineStagesCompleted: [],
        sessionNotes: '',
        sleepHours: 0,
      };
      // We do NOT call setSessions here because getTodaySession is called during render.
    }
    return currentSession;
  };

  const updateTodaySession = (updates: Partial<SessionLog>) => {
    const today = getTodayISO();
    let currentSession = sessions.find((s) => s.date === today);
    
    if (currentSession) {
      const updated = { ...currentSession, ...updates };
      setSessions(sessions.map((s) => (s.date === today ? updated : s)));
    } else {
      const newSession: SessionLog = {
        id: crypto.randomUUID(),
        date: today,
        inputMinutes: 0,
        inputComprehension: 0,
        speakingMinutes: 0,
        writingMinutes: 0,
        shadowingMinutes: 0,
        passiveMinutes: 0,
        constructionsCaptured: 0,
        cardsReviewed: 0,
        cardsForgotten: 0,
        aiConversationMinutes: 0,
        pipelineStagesCompleted: [],
        sessionNotes: '',
        sleepHours: 0,
        ...updates
      };
      setSessions([...sessions, newSession]);
    }

    // Update streak logic here
    const s = { ...streak };
    const yesterday = addDays(today, -1);
    
    // Check local context today check
    const isTodayActive = (currentSession?.pipelineStagesCompleted.length || updates.pipelineStagesCompleted?.length || 0) > 0;
    
    if (isTodayActive && s.lastActiveDate !== today) {
        if (s.lastActiveDate === yesterday) {
            s.currentStreak += 1;
        } else {
            s.currentStreak = 1;
        }
        s.totalDaysActive += 1;
        s.lastActiveDate = today;
        s.longestStreak = Math.max(s.longestStreak, s.currentStreak);
        setStreak(s);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeModule,
        setActiveModule,
        profile,
        setProfile,
        constructions,
        setConstructions,
        cards,
        setCards,
        sessions,
        setSessions,
        errors,
        setErrors,
        weekly,
        setWeekly,
        streak,
        setStreak,
        conversations,
        setConversations,
        apiKey,
        setApiKey,
        isLoaded,
        getTodaySession,
        updateTodaySession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

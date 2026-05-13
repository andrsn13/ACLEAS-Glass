'use client';

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

// Helper to safely access localStorage
const getItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
};

// Data schemas keys
const KEYS = {
  PROFILE: 'acleas_profile',
  CONSTRUCTIONS: 'acleas_constructions',
  CARDS: 'acleas_cards',
  SESSIONS: 'acleas_sessions',
  ERRORS: 'acleas_errors',
  WEEKLY: 'acleas_weekly',
  STREAK: 'acleas_streak',
  AI_CONVERSATIONS: 'acleas_ai_conversations',
  API_KEY: 'acleas_apikey',
  ACTIVE_MODULE: 'acleas_activeModule',
};

// API
export const storage = {
  getProfile: () => getItem<Profile | null>(KEYS.PROFILE, null),
  setProfile: (profile: Profile) => setItem(KEYS.PROFILE, profile),

  getConstructions: () => getItem<Construction[]>(KEYS.CONSTRUCTIONS, []),
  setConstructions: (constructions: Construction[]) =>
    setItem(KEYS.CONSTRUCTIONS, constructions),

  getCards: () => getItem<Card[]>(KEYS.CARDS, []),
  setCards: (cards: Card[]) => setItem(KEYS.CARDS, cards),

  getSessions: () => getItem<SessionLog[]>(KEYS.SESSIONS, []),
  setSessions: (sessions: SessionLog[]) => setItem(KEYS.SESSIONS, sessions),

  getErrors: () => getItem<ErrorEntry[]>(KEYS.ERRORS, []),
  setErrors: (errors: ErrorEntry[]) => setItem(KEYS.ERRORS, errors),

  getWeekly: () => getItem<WeeklyReview[]>(KEYS.WEEKLY, []),
  setWeekly: (weekly: WeeklyReview[]) => setItem(KEYS.WEEKLY, weekly),

  getStreak: () =>
    getItem<Streak>(KEYS.STREAK, {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      totalDaysActive: 0,
    }),
  setStreak: (streak: Streak) => setItem(KEYS.STREAK, streak),

  getConversations: () => getItem<AIConversation[]>(KEYS.AI_CONVERSATIONS, []),
  setConversations: (conversations: AIConversation[]) =>
    setItem(KEYS.AI_CONVERSATIONS, conversations),

  getApiKey: () => getItem<string>(KEYS.API_KEY, ''),
  setApiKey: (key: string) => setItem(KEYS.API_KEY, key),

  getActiveModule: () => getItem<number>(KEYS.ACTIVE_MODULE, 1),
  setActiveModule: (id: number) => setItem(KEYS.ACTIVE_MODULE, id),
};

export const getTodayISO = () => new Date().toISOString().split('T')[0];

export const addDays = (isoDate: string, days: number) => {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const generateUUID = () => {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
};

import { useState, useEffect } from 'react';

export type ToastLevel = 'info' | 'success' | 'warn' | 'error';

export type ToastMessage = {
  id: string;
  message: string;
  level: ToastLevel;
};

let listeners: ((toasts: ToastMessage[]) => void)[] = [];
let toasts: ToastMessage[] = [];

let counter = 0;

export const toast = (message: string, level: ToastLevel = 'info') => {
  const id = String(Date.now() + ++counter);
  toasts = [...toasts, { id, message, level }];
  listeners.forEach((l) => l(toasts));
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((l) => l(toasts));
  }, 3000);
};

export const useToasts = () => {
  const [currentToasts, setCurrentToasts] = useState<ToastMessage[]>(toasts);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentToasts(toasts);
    listeners.push(setCurrentToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setCurrentToasts);
    };
  }, []);
  return currentToasts;
};

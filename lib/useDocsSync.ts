import { getTodayISO } from './storage';
import { getAccessToken } from './firebase';

type SyncPayload = {
  title: string;
  details?: string;
  duration?: number;
};

export const syncToDocs = async (action: string, payload: SyncPayload) => {
  const token = await getAccessToken();
  if (!token) {
    console.warn('Cannot sync to Docs, no access token available. Please sign in via Settings.');
    return false;
  }

  try {
    const res = await fetch('/api/docs/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        action,
        date: getTodayISO(),
        payload
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return true;
  } catch (err) {
    console.error('Sync failed:', err);
    return false;
  }
};

export const uploadAudioToDrive = async (audioBlob: Blob): Promise<string | null> => {
   const token = await getAccessToken();
   if (!token) return null;

   const formData = new FormData();
   formData.append('file', audioBlob, `Monologue-${new Date().getTime()}.webm`);

   try {
     const res = await fetch('/api/docs/upload-audio', {
       method: 'POST',
       headers: {
         Authorization: `Bearer ${token}`
       },
       body: formData
     });
     const data = await res.json();
     if (!res.ok) throw new Error(data.error);
     return data.link;
   } catch (err) {
     console.error('Audio upload failed:', err);
     return null;
   }
};

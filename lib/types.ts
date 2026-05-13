export type Profile = {
  l1: string;
  learnerType: 'standard' | 'heritage';
  onboardingComplete: boolean;
  aptitudeScores: {
    associativeMemory: number;
    soundDiscrimination: number;
    soundSymbol: number;
    analyticalAbility: number;
  };
  wmLoad: 'normal' | 'reduced';
  createdAt: string;
};

export type Construction = {
  id: string;
  construction: string;
  function: string;
  example: string;
  variation: string;
  personalSentence: string;
  l1Translation: string;
  gestureNote: string;
  imageUrl: string;
  l1InterferenceFlag: boolean;
  explicitRule: string;
  morphCueHighlight: string;
  type: 'grammar' | 'discourse' | 'vocabulary' | 'pronunciation';
  addedAt: string;
  source: string;
};

export type Card = {
  id: string;
  constructionId: string;
  due: string;
  interval: number;
  easeFactor: number;
  reps: number;
  lapses: number;
  phase: 'learning' | 'review';
  lastReviewed: string;
  lastGrade: number;
  stabilityScore: number;
};

export type SessionLog = {
  id: string;
  date: string;
  inputMinutes: number;
  inputComprehension: number;
  speakingMinutes: number;
  writingMinutes: number;
  shadowingMinutes: number;
  passiveMinutes: number;
  constructionsCaptured: number;
  cardsReviewed: number;
  cardsForgotten: number;
  aiConversationMinutes: number;
  pipelineStagesCompleted: number[];
  sessionNotes: string;
  sleepHours: number;
};

export type ErrorEntry = {
  id: string;
  date: string;
  type: 'A' | 'B' | 'C' | 'D';
  description: string;
  constructionId: string;
  context: string;
  repairAction: string;
  resolved: boolean;
};

export type WeeklyReview = {
  weekOf: string;
  recurringErrors: string;
  hesitationPatterns: string;
  comprehensionBottlenecks: string;
  emotionalResistance: string;
  weakConstructions: string;
  priorities: string;
  deepSessionCompleted: boolean;
  deepSessionMinutes: number;
};

export type Streak = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalDaysActive: number;
};

export type AIConversation = {
  id: string;
  date: string;
  mode: 'drill' | 'conversation';
  topic: string;
  transcript: { role: 'user' | 'model'; text: string }[];
  durationMinutes: number;
  delayedFeedback: string;
};

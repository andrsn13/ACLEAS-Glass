'use client';

import React from 'react';
import { AppProvider, useAppContext } from '@/lib/context';
import Onboarding from '@/components/Onboarding';
import MainLayout from '@/components/MainLayout';
import Dashboard from '@/components/Modules/Dashboard';
import DailyPipeline from '@/components/Modules/DailyPipeline';
import InputSession from '@/components/Modules/InputSession';
import ConstructionJournal from '@/components/Modules/ConstructionJournal';
import RetrievalReview from '@/components/Modules/RetrievalReview';
import OutputTrainer from '@/components/Modules/OutputTrainer';
import AIConversation from '@/components/Modules/AIConversation';
import ErrorTracker from '@/components/Modules/ErrorTracker';
import Pronunciation from '@/components/Modules/Pronunciation';
import WeeklyReview from '@/components/Modules/WeeklyReview';
import ProgressStage from '@/components/Modules/ProgressStage';
import Settings from '@/components/Modules/Settings';

function AppContent() {
  const { isLoaded, profile, activeModule } = useAppContext();

  if (!isLoaded) return null;

  if (!profile?.onboardingComplete) {
    return <Onboarding />;
  }

  const renderModule = () => {
    switch (activeModule) {
      case 1: return <Dashboard />;
      case 2: return <DailyPipeline />;
      case 3: return <InputSession />;
      case 4: return <ConstructionJournal />;
      case 5: return <RetrievalReview />;
      case 6: return <OutputTrainer />;
      case 7: return <AIConversation />;
      case 8: return <ErrorTracker />;
      case 9: return <Pronunciation />;
      case 10: return <WeeklyReview />;
      case 11: return <ProgressStage />;
      case 12: return <Settings />;
      default: return <div className="text-amber-500 font-mono text-center mt-20">Module {activeModule} under development.</div>;
    }
  };

  return (
    <MainLayout>
      {renderModule()}
    </MainLayout>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

'use client';
import { useState } from 'react';
import SettingsPage from '../components/SettingsPage';
import InterviewPage from '../components/InterviewPage';
import { InterviewRequirementsSchema } from '../lib/schemas';
import { z } from 'zod';

export default function Home() {
  const [interviewSettings, setInterviewSettings] = useState<z.infer<typeof InterviewRequirementsSchema> | null>(null);

  const handleGenerateInterviewRequirements = async (settings: z.infer<typeof InterviewRequirementsSchema>) => {
    try {
      const response = await fetch('/api/generate-interview-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      setInterviewSettings(data.body);
    } catch (error) {
      console.error('Error generating interview:', error);
    }
  };

  const handleReturnToSettings = () => {
    setInterviewSettings(null);
  };

  return (
    <main className="flex flex-col items-center justify-center bg-gray-900 min-h-screen text-white bg-cover bg-center bg-no-repeat bg-[url('/background5.webp')] saturate-[80%]">
      <div className="w-full min-h-screen -z-10 backdrop-blur-[16px] saturate-[180%] backdrop-filter w-full">
        <h1 className="text-4xl font-bold text-center text-white mb-6 pt-4">
          AI Interview Simulator
        </h1>
        {!interviewSettings ? (
          <SettingsPage onGenerateInterviewRequirements={handleGenerateInterviewRequirements} />
        ) : (
          <InterviewPage settings={interviewSettings} onReturnToSettings={handleReturnToSettings} />
        )}
      </div>
    </main>
  );
}
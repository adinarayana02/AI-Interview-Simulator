'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AIResponseSchema } from '../lib/schemas';
import { z } from 'zod';
import { motion } from 'framer-motion';

interface InterviewSummaryProps {
  summary: z.infer<typeof AIResponseSchema['overall_evaluation']>;
  interviewData: z.infer<typeof AIResponseSchema> | null;
  onReturnToSettings: () => void; // New prop for handling return to settings
}

export default function InterviewSummary({ summary, interviewData, onReturnToSettings }: InterviewSummaryProps) {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Calculate total possible score
  const totalPossibleScore = interviewData?.question_data.reduce((total, question) => {
    return total + question.evaluation.total_score;
  }, 0) || 0;

  const handleDownloadSummary = (): void => {
    setIsDownloading(true);
    const summaryText: string = `
Interview Summary

Total Score: ${summary.total_score}

Summary:
${summary.summary}

Strengths:
${summary.strengths.map((s: string) => `- ${s}`).join('\n')}

Areas for Improvement:
${summary.areas_for_improvement.map((a: string) => `- ${a}`).join('\n')}
    `;

    const blob: Blob = new Blob([summaryText], { type: 'text/plain' });
    const url: string = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = 'interview_summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDownloading(false);
  };

  const handleDownloadQuestions = (): void => {
    setIsDownloading(true);
    if (!interviewData) return;

    const questionsText: string = interviewData.question_data.map((q, index) => `
Question ${index + 1}: ${q.question}
Your Answer: ${q.my_answer}
Evaluation:
  Score: ${q.evaluation.score}/${q.evaluation.total_score}
  Feedback: ${q.evaluation.feedback}
Example Answer: ${q.example_answer}
    `).join('\n');

    const blob: Blob = new Blob([questionsText], { type: 'text/plain' });
    const url: string = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = 'interview_questions_and_answers.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDownloading(false);
  };

  return (
    <div className="flex justify-center sm:py-3 text-white h-[85vh]">
      <div className="max-w-[95vw] w-full mx-auto px-2 sm:px-3 flex flex-col">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="shadow-lg rounded-2xl p-3 sm:p-4 bg-gray-900/70 backdrop-blur-sm flex flex-col h-full"
        >
          <h1 className="text-2xl font-bold mb-4 text-center text-white">Interview Summary</h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Overall Score</h2>
            <div className="text-3xl font-bold text-blue-400">
              {summary.total_score.toFixed(2)} / {totalPossibleScore.toFixed(2)}
            </div>
          </div>

          <div className="flex-grow overflow-y-auto mb-6 border-b-2 border-gray-800">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Summary</h2>
              <p className="text-gray-300">{summary.summary}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Strengths</h2>
              <ul className="list-disc list-inside text-green-400">
                {summary.strengths.map((strength: string, index: number) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Areas for Improvement</h2>
              <ul className="list-disc list-inside text-yellow-400">
                {summary.areas_for_improvement.map((area: string, index: number) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleDownloadSummary}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              disabled={isDownloading}
            >
              Download Summary
            </Button>
            <Button
              onClick={handleDownloadQuestions}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              disabled={isDownloading}
            >
              Download Questions & Answers
            </Button>
            <Button
              onClick={onReturnToSettings}
              className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
            >
              Return to Settings
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
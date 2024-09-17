'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AIResponseSchema, InterviewRequirementsSchema } from '../lib/schemas';
import { z } from 'zod';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { motion } from 'framer-motion';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import InterviewSummary from './InterviewSummary';

interface InterviewPageProps {
  settings: z.infer<typeof InterviewRequirementsSchema>;
  onReturnToSettings: () => void;
}

export default function InterviewPage({ settings, onReturnToSettings }: InterviewPageProps) {
  const [interviewData, setInterviewData] = useState<z.infer<typeof AIResponseSchema> | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const { isListening, startListening, stopListening, interimTranscript } = useVoiceRecognition(userInput, setUserInput);
  const [isLoading, setIsLoading] = useState(false);

  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);

  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);

  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [interviewSummary, setInterviewSummary] = useState<z.infer<typeof AIResponseSchema['overall_evaluation']> | null>(null);

  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (settings) {
      const total = settings.interview_process.reduce((acc, stage) => acc + stage.questions.length, 0);
      setTotalQuestions(total);
      setCurrentQuestionNumber(1);
      setAnswers(new Array(total).fill(''));
      startInterview();
    }
  }, [settings]);

  useEffect(() => {
    if (interviewData) {
      setUserInput('');
      stopListening();
    }
  }, [interviewData, currentQuestionIndex]);

  const startInterview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: settings }),
      });
      const data = await response.json();
      console.log(data)
      setInterviewData(data.body);
    } catch (error) {
      console.error('Error starting interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!interviewData || isLoading) return;

    if (isListening) {
      stopListening();
    }

    setIsLoading(true);
    try {
      const currentAnswer = userInput;
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionNumber - 1] = currentAnswer;
      setAnswers(updatedAnswers);

      const response = await fetch('/api/generate-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            ...settings,
            userInput: currentAnswer,
            currentStage: settings.interview_process[currentStageIndex],
            currentQuestion: settings.interview_process[currentStageIndex].questions[currentQuestionIndex],
            answers: updatedAnswers,
          },
        }),
      });
      const data = await response.json();
      setInterviewData(data.body);
      setAnsweredQuestions(prev => prev + 1);
      setCurrentQuestionNumber(prev => prev + 1);

      if (currentQuestionIndex < settings.interview_process[currentStageIndex].questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else if (currentStageIndex < settings.interview_process.length - 1) {
        setCurrentStageIndex(prev => prev + 1);
        setCurrentQuestionIndex(0);
      } else {
        setIsInterviewComplete(true);
        setInterviewSummary(data.body.overall_evaluation);
      }

      setUserInput('');
      stopListening();
    } catch (error) {
      console.error('Error getting next question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!interviewData) return (
    <div className="py-2 flex justify-center w-full items-center item sm:py-3 text-white h-[60vh]">
      <div className="max-w-[95vw] flex justify-center items-center mx-auto px-2 sm:px-3">
        <div className="loader2">
          <div className="dot2"></div>
          <div className="dot2"></div>
          <div className="dot2"></div>
        </div>
      </div>
    </div>
  );

  if (isInterviewComplete && interviewSummary) {
    return <InterviewSummary 
      summary={interviewSummary} 
      interviewData={interviewData} 
      onReturnToSettings={onReturnToSettings}
    />;
  }

  const currentStage = settings.interview_process[currentStageIndex];
  const currentQuestion = currentStage.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen py-2 sm:py-3 text-white overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-1/2 w-full">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="shadow-lg rounded-2xl p-3 sm:p-4 bg-gray-900/70 backdrop-blur-sm mb-4"
            >
              <h1 className="text-lg font-bold mb-4 text-center text-white">
                Job Interview: {currentStage.stage_name}
              </h1>
              
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                  <span>Stage {currentStageIndex + 1} of {settings.interview_process.length}</span>
                  <span>{currentQuestionNumber} / {totalQuestions} questions</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <motion.div 
                    className="bg-blue-600/80 h-2 rounded-full" 
                    style={{ width: `${(currentQuestionNumber / totalQuestions) * 100}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentQuestionNumber / totalQuestions) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
              </div>

              <motion.div 
                className="mb-4 bg-gray-800/70 p-4 rounded-xl shadow-md backdrop-blur-sm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-lg font-semibold text-white mb-2">Question {currentQuestionIndex + 1}</h2>
                <p className="text-base text-gray-200">{currentQuestion}</p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        value={userInput + (isListening ? ' ' + interimTranscript : '')}
                        onChange={(e) => {
                          setUserInput(e.target.value);
                        }}
                        placeholder="Type your answer here"
                        className="mb-4 bg-gray-800/60 text-white text-sm h-10 placeholder-gray-400"
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Enter your response to the question</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>

              <motion.div 
                className="mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={toggleListening} 
                        className={`mb-2 w-full ${
                          isListening 
                            ? 'bg-red-600/80 hover:bg-red-700/80' 
                            : 'bg-indigo-600/80 hover:bg-indigo-700/80'
                        } text-sm h-10`}
                      >
                        {isListening ? 'Stop Recording' : 'Start Recording'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{isListening ? 'Click to stop voice recognition' : 'Click to start voice recognition'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button 
                  onClick={handleNextQuestion} 
                  className="bg-blue-600/80 hover:bg-blue-700/80 relative w-full text-sm h-10 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="loader absolute inset-0 flex items-center justify-center">
                      <div className="circle"><div className="dot"></div><div className="outline"></div></div>
                      <div className="circle"><div className="dot"></div><div className="outline"></div></div>
                      <div className="circle"><div className="dot"></div><div className="outline"></div></div>
                      <div className="circle"><div className="dot"></div><div className="outline"></div></div>
                    </div>
                  ) : (
                    'Next Question'
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </div>

          <div className="lg:w-1/2 w-full space-y-3 flex flex-col">
            <div className='mb-6 lg:mb-12'>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-blue-900 p-2 rounded-lg">
                  <h3 className="font-semibold text-xs mb-1">Stay Calm</h3>
                  <p className="text-xs">Take deep breaths and maintain composure.</p>
                </div>
                <div className="bg-green-900 p-2 rounded-lg">
                  <h3 className="font-semibold text-xs mb-1">Be Concise</h3>
                  <p className="text-xs">Provide clear and focused answers.</p>
                </div>
                <div className="bg-yellow-900 p-2 rounded-lg">
                  <h3 className="font-semibold text-xs mb-1">Show Enthusiasm</h3>
                  <p className="text-xs">Demonstrate your passion for the role.</p>
                </div>
                <div className="bg-purple-900 p-2 rounded-lg">
                  <h3 className="font-semibold text-xs mb-1">Ask Questions</h3>
                  <p className="text-xs">Prepare thoughtful questions for the interviewer.</p>
                </div>
              </div>
              
              <div className="bg-gray-800 shadow-lg rounded-2xl p-3 mt-3">
                <h2 className="text-base font-bold mb-2">Interview Tips</h2>
                <p className="text-xs mb-2">
                  Remember to provide specific examples from your experience when answering questions. 
                  This helps illustrate your skills and achievements.
                </p>
                <p className="text-xs mb-2">
                  It's okay to take a moment to think before answering. This shows you're considering 
                  the question carefully.
                </p>
                <p className="text-xs font-semibold">
                  Stay positive and focus on what you can bring to the role!
                </p>
              </div>
            </div>
            
            <div className="text-center text-xs text-gray-300 bg-black bg-opacity-30 backdrop-filter backdrop-blur-sm p-2 rounded-lg mt-auto">
              <p>Powered by EchoHive</p>
              <p className="mt-1">© 2023 Interview Coach. All rights reserved.</p>
              <div className="mt-2">
                <a href="#" className="text-blue-400 hover:underline mr-4">Privacy Policy</a>
                <a href="#" className="text-blue-400 hover:underline mr-4">Terms of Service</a>
                <a href="#" className="text-blue-400 hover:underline">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
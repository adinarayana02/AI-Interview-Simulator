'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InterviewRequirementsSchema } from '../lib/schemas';
import { z } from 'zod';

interface SettingsPageProps {
  onGenerateInterviewRequirements: (settings: z.infer<typeof InterviewRequirementsSchema>) => void;
}

export default function SettingsPage({ onGenerateInterviewRequirements }: SettingsPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<z.infer<typeof InterviewRequirementsSchema>>({
    job_description: '',
    job_requirements: [],
    interview_process: [],
    interviewer_tone: 'formal',
    interview_language: 'English',
    interview_style: 'structured',
    interview_level: 'junior',
    max_questions_per_stage: 5
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'job_description' || name === 'interview_language' ? value : value.split('\n').filter(item => item.trim() !== '')
    }));
  };

  const handleSelectChange = (name: keyof z.infer<typeof InterviewRequirementsSchema>, value: string) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: parseInt(value, 10) || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onGenerateInterviewRequirements(settings);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };


  return (
    <motion.div 
      className="py-2 flex justify-center sm:py-3 text-white overflow-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-[95vw] w-full mx-auto px-2 sm:px-3m ">
        <div className="flex flex-col lg:flex-row gap-4 ">
          {/* Left side: Settings */}
          <motion.div className="lg:w-1/2 w-full" variants={itemVariants}>
            <div className="shadow-lg rounded-2xl p-3 sm:p-4 bg-gray-900/70 backdrop-blur-sm">
              <h1 className="text-lg font-bold mb-4 text-center text-white">Interview Settings</h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Textarea
                            name="job_description"
                            placeholder="Job Description"
                            value={settings.job_description}
                            onChange={handleChange}
                            className="col-span-2 h-12 bg-gray-700 text-white placeholder-gray-400 text-sm"
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Enter a brief description of the job position</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Textarea
                            name="job_requirements"
                            placeholder="Job Requirements"
                            value={settings.job_requirements.join('\n')}
                            onChange={handleChange}
                            className="h-12 bg-gray-700 text-white placeholder-gray-400 text-sm"
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>List the key requirements for the job, one per line</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Textarea
                            name="interview_process"
                            placeholder="Interview Process or stages (Optional)"
                            value={settings.interview_process.join('\n')}
                            onChange={handleChange}
                            className="h-12 bg-gray-700 text-white placeholder-gray-400 text-sm"
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Describe the steps of the interview process or stages</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Select
                              value={settings.interviewer_tone}
                              onValueChange={(value) => handleSelectChange('interviewer_tone', value as z.infer<typeof InterviewRequirementsSchema>['interviewer_tone'])}
                            >
                              <SelectTrigger className="bg-gray-700 text-white text-sm h-8">
                                <SelectValue placeholder="Interviewer Tone" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-700 text-white">
                                <SelectItem value="formal">Formal</SelectItem>
                                <SelectItem value="casual">Casual</SelectItem>
                                <SelectItem value="friendly">Friendly</SelectItem>
                                <SelectItem value="strict">Strict</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Choose the tone the interviewer should adopt</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Input
                            name="interview_language"
                            placeholder="Interview Language"
                            value={settings.interview_language}
                            onChange={handleChange}
                            className="bg-gray-700 text-white placeholder-gray-400 text-sm h-8"
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Specify the language in which the interview will be conducted</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Select
                              value={settings.interview_style}
                              onValueChange={(value) => handleSelectChange('interview_style', value as z.infer<typeof InterviewRequirementsSchema>['interview_style'])}
                            >
                              <SelectTrigger className="bg-gray-700 text-white text-sm h-8">
                                <SelectValue placeholder="Interview Style" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-700 text-white">
                                <SelectItem value="structured">Structured</SelectItem>
                                <SelectItem value="semi-structured">Semi-structured</SelectItem>
                                <SelectItem value="unstructured">Unstructured</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>
                            Choose the interview style:
                            <br />- Structured: Predetermined questions and scoring
                            <br />- Semi-structured: Set questions with flexibility
                            <br />- Unstructured: No set format, open-ended
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Select
                              value={settings.interview_level}
                              onValueChange={(value) => handleSelectChange('interview_level', value as z.infer<typeof InterviewRequirementsSchema>['interview_level'])}
                            >
                              <SelectTrigger className="bg-gray-700 text-white text-sm h-8">
                                <SelectValue placeholder="Interview Level" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-700 text-white">
                                <SelectItem value="entry">Entry</SelectItem>
                                <SelectItem value="junior">Junior</SelectItem>
                                <SelectItem value="mid">Mid</SelectItem>
                                <SelectItem value="senior">Senior</SelectItem>
                                <SelectItem value="executive">Executive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Select the experience level for the interview</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="col-span-2 flex items-center space-x-2">
                            <span className="text-sm">Max questions per interview stage</span>
                            <Input
                              type="number"
                              name="max_questions_per_stage"
                              placeholder="Max Questions Per Stage"
                              value={settings.max_questions_per_stage}
                              onChange={handleNumberChange}
                              min={1}
                              max={300} 
                              className="w-full bg-gray-700 text-white placeholder-gray-400 text-sm h-8"
                            /> 
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Set the maximum number of questions to generate per interview stage</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button type="submit" className="w-full bg-blue-600 relative hover:bg-blue-700 text-white text-sm h-10 rounded-xl" disabled={isLoading}>
                    {isLoading ? (
                      <div className="loader absolute inset-0 flex items-center justify-center">
                        <div className="circle"><div className="dot"></div><div className="outline"></div></div>
                        <div className="circle"><div className="dot"></div><div className="outline"></div></div>
                        <div className="circle"><div className="dot"></div><div className="outline"></div></div>
                        <div className="circle"><div className="dot"></div><div className="outline"></div></div>
                      </div>
                    ) : (
                      'Generate Interview'
                    )}
                  </Button>
                </motion.div>
              </form>
            </div>
          </motion.div>

          {/* Right side: Inspiring content */}
          <motion.div className="lg:w-1/2 w-full space-y-3 flex flex-col" variants={itemVariants}>
            <div className='mb-6 lg:mb-12'>
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                variants={containerVariants}
              >
                <motion.div className="bg-blue-900 p-2 rounded-lg" variants={itemVariants}>
                  <h3 className="font-semibold text-xs mb-1">Boost Confidence</h3>
                  <p className="text-xs">Practice makes perfect. Gain confidence for your interviews.</p>
                </motion.div>
                <motion.div className="bg-green-900 p-2 rounded-lg" variants={itemVariants}>
                  <h3 className="font-semibold text-xs mb-1">Tailored Experience</h3>
                  <p className="text-xs">Customize settings to match real-world scenarios.</p>
                </motion.div>
                <motion.div className="bg-yellow-900 p-2 rounded-lg" variants={itemVariants}>
                  <h3 className="font-semibold text-xs mb-1">Instant Feedback</h3>
                  <p className="text-xs">Get insights and improve your skills in real-time.</p>
                </motion.div>
                <motion.div className="bg-purple-900 p-2 rounded-lg" variants={itemVariants}>
                  <h3 className="font-semibold text-xs mb-1">Career Growth</h3>
                  <p className="text-xs">Unlock opportunities with better interview performance.</p>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="bg-gray-800 shadow-lg rounded-2xl p-3 mt-3"
                variants={itemVariants}
              >
                <h2 className="text-base font-bold mb-2">Elevate Your Interview Game</h2>
                <p className="text-xs mb-2">
                  Our AI-powered Interview Coach helps you prepare for any job interview with confidence. 
                  Suitable for fresh graduates and seasoned professionals alike.
                </p>
                <p className="text-xs mb-2">
                  With customizable settings and instant feedback, you'll be ready to impress 
                  any interviewer and land your dream job.
                </p>
                <p className="text-xs font-semibold">
                  Start your journey to interview success today!
                </p>
              </motion.div>
            </div>
            
            {/* Footer */}
            <motion.div 
              className="text-center text-xs text-gray-300 bg-black bg-opacity-30 backdrop-filter backdrop-blur-sm p-2 rounded-lg"
              variants={itemVariants}
            >
              <p>Powered by EchoHive</p>
              <p className="mt-1">© 2023 Interview Coach. All rights reserved.</p>
              <div className="mt-2">
                <a href="#" className="text-blue-400 hover:underline mr-4">Privacy Policy</a>
                <a href="#" className="text-blue-400 hover:underline mr-4">Terms of Service</a>
                <a href="#" className="text-blue-400 hover:underline">Contact Us</a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
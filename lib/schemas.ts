import { z } from "zod";

// Define the schema for the AI response
const InterviewQuestion = z.object({
  question: z.string(),
  question_number: z.number(),
  my_answer: z.string(),
  evaluation: z.object({
    score: z.number(),
    total_score: z.number(), // Add total_score
    feedback: z.string(),
  }),
  example_answer: z.string(), // Add example_answer
});

export const AIResponseSchema = z.object({
  question_data: z.array(InterviewQuestion),
  overall_evaluation: z.object({
    total_score: z.number(),
    summary: z.string(),
    strengths: z.array(z.string()),
    areas_for_improvement: z.array(z.string()),
  }),
  interview_status: z.enum(["in_progress", "completed"]),
});

// Define a schema for individual interview stages
const InterviewStage = z.object({
  stage_name: z.string(),
  interview_mode: z.enum(["text", "voice", "both"]),
  questions: z.array(z.string()), // Add a maximum limit
});

// Updated schema for interview requirements
export const InterviewRequirementsSchema = z.object({
  job_description: z.string(),
  job_requirements: z.array(z.string()),
  interview_process: z.array(InterviewStage),
  interviewer_tone: z.enum(["formal", "casual", "friendly", "strict"]),
  interview_language: z.string(),
  interview_style: z.enum(["structured", "semi-structured", "unstructured"]),
  interview_level: z.enum(["entry", "junior", "mid", "senior", "executive"]),
  max_questions_per_stage: z.number(),
});
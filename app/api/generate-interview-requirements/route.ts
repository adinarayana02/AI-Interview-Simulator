import { InterviewRequirementsSchema } from "../../../lib/schemas";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

export async function POST(request: Request) {
  const body = await request.json();
  
  const openai = new OpenAI();
  try {
    const { 
      job_title, 
      company_name, 
      industry, 
      interview_level,
      job_description,
      job_requirements,
      interview_process,
      interview_questions,
      interviewer_tone,
      interview_language,
      interview_style,
      max_questions_per_stage
    } = body;

    const system_message = `
      You are an AI assistant tasked with generating interview requirements for a job position.
      Based on the provided information, create a comprehensive set of interview requirements.
      Ensure that the generated content is relevant and appropriate for the given job, industry, and interview level.
      The interview level (${interview_level}) should influence the difficulty and depth of the questions and requirements.
      IMPORTANT: Generate up to ${max_questions_per_stage} questions for each interview stage, but do not exceed this number.
    `
    const data_string = JSON.stringify({ job_title, company_name, industry, interview_level, job_description, job_requirements, interview_process, interview_questions, interviewer_tone, interview_language, interview_style })
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system_message },
        { role: "user", content: data_string},
      ],
      response_format: zodResponseFormat(InterviewRequirementsSchema, "event"),
    });

    const event = completion.choices[0].message.parsed;

    return new Response(JSON.stringify({
      request: 'POST',
      body: event,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error("Error in generating interview requirements:", error);
    return new Response(JSON.stringify({
      request: 'POST',
      error: error.message || "An unexpected error occurred",
    }), {
      status: error.status || 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
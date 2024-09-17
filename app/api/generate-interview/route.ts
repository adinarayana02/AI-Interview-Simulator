import { NextApiRequest, NextApiResponse } from "next";
import { AIResponseSchema } from "../../../lib/schemas";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

export async function POST(request: Request) {
  const body = await request.json();
  
  const openai = new OpenAI();
    try {
      const { data } = body;
      const system_message = `
        You are an experienced interviewer conducting a job interview. Your task is to:
        1. Ask the candidate questions based on the job they're applying for.
        2. Evaluate their answers based on the job requirements.
        3. Ask follow-up questions for clarity when needed.
        4. Assign a score to each answer based on how well it meets the job requirements. The score should be in the format X/Y, where X is the score given and Y is the total possible score.
        5. Provide an example of a good answer for each question.
        6. Follow the provided interview process step by step.
        7. Provide an evaluation for each answer and an overall interview assessment.
        8. Adapt your tone (${data.interviewer_tone}) and style (${data.interview_style}) as specified.
        9. Conduct the interview in the specified language: ${data.interview_language}.
        10. If the job requires coding skills, incorporate relevant technical questions when appropriate.
        11. Use the provided answers array to access previous answers when needed.

        Remember to be professional, fair, and thorough in your assessment.
        `
        const {
          userInput,
          job_description,
          job_requirements,
          interview_process,
          interview_questions,
          interviewer_tone,
          interview_language,
          interview_style,
          answers,
        } = data;
        
        const data_string = JSON.stringify({
            job_description,
            job_requirements,
            interview_process,
            interview_questions,
            interviewer_tone,
            interview_language,
            interview_style,
            userInput,
            answers
        }) 
        const completion = await openai.beta.chat.completions.parse({
            model: "gpt-4o-mini",
            messages: [
            { role: "system", content: system_message },
            { role: "user", content: data_string},
            ],
            response_format: zodResponseFormat(AIResponseSchema, "event"),
        });

        const event = completion.choices[0].message.parsed;

        // When returning the response, make sure to include the updated event object
        return new Response(JSON.stringify({
            request: 'POST',
            body: event,
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        }); 
    } catch (error:any) {
      console.error("Error in interview generation:", error);
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
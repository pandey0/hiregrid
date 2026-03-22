import OpenAI from "openai";
import * as Sentry from "@sentry/nextjs";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require("pdf-parse");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parseResumeAndScore(resumeBuffer: Buffer, programName: string, programDescription?: string) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY is not set. AI scoring skipped.");
    return { score: null, reason: "AI scoring not configured" };
  }

  // HG-009: Basic LLM Tracing
  const traceId = `trace-${Date.now()}`;
  console.log(`[ai-trace] ${traceId} | Starting analysis for program: ${programName}`);

  try {
    const data = await pdf(resumeBuffer);
    const text = data.text;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert recruitment AI. Your task is to analyze a resume text against a specific hiring program.
          
          Program: ${programName}
          Description: ${programDescription || "No detailed description provided."}
          
          Return a JSON object with:
          1. "score": a number from 0 to 100 representing how well the candidate matches the program.
          2. "reason": a short 1-2 sentence explanation of the score.
          3. "extractedInfo": an object with "currentRole", "currentCompany", and "yearsExperience" (number).`,
        },
        {
          role: "user",
          content: `Resume text: ${text.substring(0, 6000)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty AI response");

    const result = JSON.parse(content);
    
    console.log(`[ai-trace] ${traceId} | Completed. Score: ${result.score}`);

    return {
      score: result.score as number,
      reason: result.reason as string,
      extractedInfo: result.extractedInfo as {
        currentRole?: string;
        currentCompany?: string;
        yearsExperience?: number;
      },
    };
  } catch (error) {
    console.error(`[ai-trace] ${traceId} | Error:`, error);
    Sentry.captureException(error, {
      extra: { programName, traceId }
    });
    return { score: null, reason: "Failed to process resume with AI" };
  }
}

export async function generateInterviewRubric(resumeUrl: string | null, programName: string, roundName: string, configuredFocusAreas?: string[]) {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    let resumeText = "No resume provided.";
    if (resumeUrl) {
      const response = await fetch(resumeUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      const data = await pdf(buffer);
      resumeText = data.text;
    }

    const focusAreasPrompt = (configuredFocusAreas && configuredFocusAreas.length > 0)
      ? `The recruiter has specifically requested to focus on: ${configuredFocusAreas.join(", ")}. Ensure these are included in the focusAreas and reflected in the questions.`
      : "";

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert technical interviewer.
          Generate a custom interview rubric and 3-5 suggested questions for a candidate based on their resume and the specific interview round.
          
          Program: ${programName}
          Round: ${roundName}
          ${focusAreasPrompt}
          
          Return a JSON object with:
          1. "focusAreas": an array of strings representing key skills to evaluate.
          2. "suggestedQuestions": an array of objects with "question" and "expectedAnswer" (brief summary).`,
        },
        {
          role: "user",
          content: `Candidate Resume: ${resumeText.substring(0, 6000)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = aiResponse.choices[0].message.content;
    if (!content) return null;

    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to generate rubric:", error);
    return null;
  }
}

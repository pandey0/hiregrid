import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require("pdf-parse");

const model = google("gemini-2.0-flash");

export async function parseResumeAndScore(resumeBuffer: Buffer, programName: string, programDescription?: string) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.warn("GOOGLE_GENERATIVE_AI_API_KEY is not set. AI scoring skipped.");
    return { score: null, reason: "AI scoring not configured" };
  }

  // HG-009: Basic LLM Tracing
  const traceId = `trace-${Date.now()}`;
  console.log(`[ai-trace] ${traceId} | Starting analysis for program: ${programName}`);

  try {
    const data = await pdf(resumeBuffer);
    const text = data.text;

    const { object: result } = await generateObject({
      model,
      schema: z.object({
        score: z.number().min(0).max(100),
        reason: z.string(),
        extractedInfo: z.object({
          currentRole: z.string().optional(),
          currentCompany: z.string().optional(),
          yearsExperience: z.number().optional(),
        }),
      }),
      system: `You are an expert recruitment AI. Your task is to analyze a resume text against a specific hiring program.
      
      Program: ${programName}
      Description: ${programDescription || "No detailed description provided."}`,
      prompt: `Resume text: ${text.substring(0, 10000)}`,
    });

    console.log(`[ai-trace] ${traceId} | Completed. Score: ${result.score}`);

    return {
      score: result.score,
      reason: result.reason,
      extractedInfo: result.extractedInfo,
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
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return null;

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

    const { object: result } = await generateObject({
      model,
      schema: z.object({
        focusAreas: z.array(z.string()),
        suggestedQuestions: z.array(z.object({
          question: z.string(),
          expectedAnswer: z.string(),
        })),
      }),
      system: `You are an expert technical interviewer.
      Generate a custom interview rubric and 3-5 suggested questions for a candidate based on their resume and the specific interview round.
      
      Program: ${programName}
      Round: ${roundName}
      ${focusAreasPrompt}`,
      prompt: `Candidate Resume: ${resumeText.substring(0, 10000)}`,
    });

    return result;
  } catch (error) {
    console.error("Failed to generate rubric:", error);
    return null;
  }
}

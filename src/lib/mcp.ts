import { prisma } from "./prisma";
import { getGoogleAuth, createCalendarEvent } from "./google";
import { generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

/**
 * Story 6.2 & 6.3: AI Agent Fulfillment Logic
 * This replaces the previous mock implementation with a real AI agent 
 * that uses tools to interact with Google Calendar.
 */
export async function dispatchInterviewFulfillment(bookingId: number) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        candidate: { include: { organization: true, program: true } },
        programPanelist: true,
        round: true,
      },
    });

    if (!booking) return;

    console.log(`[fulfillment] Starting AI Agent for Booking #${bookingId}`);

    // 1. Get Google Auth for the organization
    const auth = await getGoogleAuth(booking.candidate.organizationId);
    
    if (!auth) {
      console.warn(`[fulfillment] Skipping AI Agent: No Google Auth for org #${booking.candidate.organizationId}`);
      await prisma.booking.update({
        where: { id: bookingId },
        data: { fulfillmentStatus: "FAILED" },
      });
      return;
    }

    // 2. Run AI Agent with Google Calendar tool
    const { toolResults } = await generateText({
      model: openai("gpt-4o"),
      system: `You are the HireGrid Fulfillment Agent. 
      Your job is to coordinate interview logistics.
      You have access to the recruiter's Google Calendar.
      Always create a Google Meet link for interviews.`,
      prompt: `Create a calendar event for an interview between candidate ${booking.candidate.name} and panelist ${booking.programPanelist.externalName}.
      
      Details:
      - Program: ${booking.candidate.program.name}
      - Round: ${booking.round.name}
      - Start: ${booking.slotStart.toISOString()}
      - End: ${booking.slotEnd.toISOString()}
      - Candidate Email: ${booking.candidate.email}
      - Panelist Email: ${booking.programPanelist.externalEmail}`,
      tools: {
        createEvent: tool({
          description: "Create a Google Calendar event with a meeting link",
          parameters: z.object({
            summary: z.string(),
            description: z.string(),
            start: z.string().describe("ISO 8601 date string"),
            end: z.string().describe("ISO 8601 date string"),
            attendees: z.array(z.string()),
          }),
          execute: async ({ summary, description, start, end, attendees }) => {
            return await createCalendarEvent(auth, {
              summary,
              description,
              start: new Date(start),
              end: new Date(end),
              attendees,
            });
          },
        }),
      },
    });

    // 3. Process results and update DB
    const result = toolResults?.[0]?.result as { eventId: string; meetingLink: string } | undefined;

    if (result?.eventId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          fulfillmentStatus: "SUCCESS",
          googleEventId: result.eventId,
          meetingLink: result.meetingLink,
        },
      });
      console.log(`[fulfillment] AI Agent successfully scheduled interview. Link: ${result.meetingLink}`);
    } else {
      throw new Error("AI Agent failed to produce an event ID");
    }
    
  } catch (error) {
    console.error("[fulfillment] AI Agent Error:", error);
    await prisma.booking.update({
      where: { id: bookingId },
      data: { fulfillmentStatus: "FAILED" },
    });
  }
}

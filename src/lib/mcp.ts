import { prisma } from "./prisma";
import { getGoogleAuth, createCalendarEvent } from "./google";
import { generateText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { sendEmail } from "./mail";

/**
 * Story 6.2 & 6.3: AI Agent Fulfillment Logic
 * This replaces the previous mock implementation with a real AI agent 
 * that uses tools to interact with Google Calendar and Email.
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

    const program = booking.candidate.program;

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

    // 2. Run AI Agent with Google Calendar and Email tools
    const { toolResults } = await generateText({
      model: google("gemini-2.0-flash"),
      system: `You are the HireGrid Fulfillment Agent. 
      Your job is to coordinate interview logistics.
      You have access to the recruiter's Google Calendar and the internal Email system.
      Always create a Google Meet link for interviews.
      
      CRITICAL: When sending confirmation emails, you MUST use the following template provided by the recruiter:
      "${program.confirmationTemplate}"
      
      Variables available for the template:
      {{name}} - Name of the participant
      {{programName}} - "${program.name}"
      {{roundName}} - "${booking.round.name}"
      {{startTime}} - The interview start time
      {{endTime}} - The interview end time
      {{meetingLink}} - The generated Google Meet link
      
      You must replace these variables with the actual values.`,
      prompt: `Coordinate the interview for Booking #${bookingId}:
      Candidate: ${booking.candidate.name} (${booking.candidate.email})
      Panelist: ${booking.programPanelist.externalName} (${booking.programPanelist.externalEmail})
      
      Details:
      - Program: ${program.name}
      - Round: ${booking.round.name}
      - Start: ${booking.slotStart.toISOString()}
      - End: ${booking.slotEnd.toISOString()}`,
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
        sendConfirmationEmail: tool({
          description: "Send a confirmation email to a participant",
          parameters: z.object({
            to: z.string().email(),
            subject: z.string(),
            body: z.string().describe("HTML content of the email"),
            participantType: z.enum(["CANDIDATE", "PANELIST"]),
          }),
          execute: async ({ to, subject, body }) => {
            await sendEmail({
              to,
              subject,
              html: body,
              type: "BOOKING_CONFIRMATION",
              bookingId: bookingId,
            });
            return { success: true };
          },
        }),
      },
    });

    // 3. Process results and update DB
    // Look for createEvent result specifically
    const calendarResult = toolResults.find(r => r.toolName === "createEvent")?.result as { eventId: string; meetingLink: string } | undefined;

    if (calendarResult?.eventId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          fulfillmentStatus: "SUCCESS",
          googleEventId: calendarResult.eventId,
          meetingLink: calendarResult.meetingLink,
        },
      });
      console.log(`[fulfillment] AI Agent successfully scheduled interview. Link: ${calendarResult.meetingLink}`);
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

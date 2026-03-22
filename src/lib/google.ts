import { google } from "googleapis";
import { prisma } from "./prisma";

export async function getGoogleAuth(organizationId: number) {
  // 1. Find an admin for this organization who has a Google account connected
  const adminMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      role: "ADMIN",
    },
    include: {
      user: {
        include: {
          accounts: {
            where: { providerId: "google" },
          },
        },
      },
    },
  });

  const account = adminMember?.user.accounts[0];

  if (!account || !account.refreshToken) {
    console.error(`[google] No connected Google account found for organization #${organizationId}`);
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  );

  oauth2Client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken,
    expiry_date: account.accessTokenExpiresAt?.getTime(),
  });

  // Automatically handle token refreshing
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          accessToken: tokens.access_token,
          accessTokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
          refreshToken: tokens.refresh_token || undefined,
        },
      });
    }
  });

  return oauth2Client;
}

export async function createCalendarEvent(
  auth: unknown,
  details: {
    summary: string;
    description: string;
    start: Date;
    end: Date;
    attendees: string[];
  }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calendar = google.calendar({ version: "v3", auth: auth as any });

  const event = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: details.summary,
      description: details.description,
      start: { dateTime: details.start.toISOString() },
      end: { dateTime: details.end.toISOString() },
      attendees: details.attendees.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `hiregrid-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  return {
    eventId: event.data.id,
    meetingLink: event.data.hangoutLink || event.data.conferenceData?.entryPoints?.[0]?.uri,
  };
}

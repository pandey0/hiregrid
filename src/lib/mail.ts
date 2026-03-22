import { Resend } from "resend";

// HG-005.1: Initialize Resend only if key is present to avoid build-time crashes
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendPanelistInvite({
  email,
  name,
  programName,
  roundName,
  magicLink,
}: {
  email: string;
  name?: string;
  programName: string;
  roundName: string;
  magicLink: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set. Email not sent.");
    console.log(`Invite link for ${email}: ${magicLink}`);
    return;
  }

  await resend.emails.send({
    from: "HireGrid <onboarding@resend.dev>", // Replace with verified domain in prod
    to: email,
    subject: `Invitation: Interview Panelist for ${programName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0f172a;">Hello ${name || "there"},</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          You have been invited to be a panelist for the <strong>${programName}</strong> program, 
          specifically for the <strong>${roundName}</strong> round.
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Please provide your availability by clicking the secure link below:
        </p>
        <div style="margin: 32px 0;">
          <a href="${magicLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Submit Availability
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">
          This link is unique to you. No account is required.
        </p>
      </div>
    `,
  });
}

export async function sendCandidateBookingLink({
  email,
  name,
  programName,
  roundName,
  bookingLink,
}: {
  email: string;
  name: string;
  programName: string;
  roundName: string;
  bookingLink: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set. Email not sent.");
    console.log(`Booking link for ${email}: ${bookingLink}`);
    return;
  }

  await resend.emails.send({
    from: "HireGrid <onboarding@resend.dev>",
    to: email,
    subject: `Action Required: Schedule your interview for ${programName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0f172a;">Hi ${name},</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Great news! You have been shortlisted for the <strong>${programName}</strong> program.
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          The next step is the <strong>${roundName}</strong> round. Please use the link below to pick a time slot that works for you:
        </p>
        <div style="margin: 32px 0;">
          <a href="${bookingLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Schedule Interview
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">
          This link will expire in 72 hours.
        </p>
      </div>
    `,
  });
}

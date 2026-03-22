import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  // 1. Check if already a member
  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });
  if (membership) redirect("/dashboard");

  // 2. Check if there is a pending invite for this email
  const invite = await prisma.organizationInvite.findFirst({
    where: { 
      email: session.user.email.toLowerCase(),
      acceptedAt: null
    },
  });

  if (invite) {
    // Auto-accept the invite
    await prisma.$transaction([
      prisma.organizationMember.create({
        data: {
          userId: session.user.id,
          organizationId: invite.organizationId,
          role: invite.role,
        },
      }),
      prisma.organizationInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    redirect("/dashboard");
  }

  return <OnboardingForm userName={session.user.name} />;
}

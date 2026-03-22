import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import TeamClient from "./TeamClient";

export default async function TeamSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  });

  if (!membership) redirect("/onboarding");

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: membership.organizationId },
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  const pendingInvites = await prisma.organizationInvite.findMany({
    where: { organizationId: membership.organizationId, acceptedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const isAdmin = membership.role === "ADMIN";

  const currentUserAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "google" },
  });

  return (
    <TeamClient 
      members={members}
      pendingInvites={pendingInvites}
      isAdmin={isAdmin}
      currentUserUserId={session.user.id}
      isConnected={!!currentUserAccount}
      organizationName={membership.organization.name}
    />
  );
}

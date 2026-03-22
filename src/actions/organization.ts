"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getOrgMembership(userId: string) {
  return prisma.organizationMember.findFirst({
    where: { userId },
    include: { organization: true },
  });
}

export async function addMemberByEmail(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const adminMembership = await getOrgMembership(session.user.id);
  if (!adminMembership || adminMembership.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can invite members");
  }

  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const role = (formData.get("role") as string | null) || "MEMBER";

  if (!email) throw new Error("Email is required");

  // 1. Check if user already exists
  const userToInvite = await prisma.user.findUnique({
    where: { email },
  });

  if (userToInvite) {
    // Check if already a member
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: userToInvite.id,
          organizationId: adminMembership.organizationId,
        },
      },
    });

    if (existingMember) {
      throw new Error("User is already a member of this organization");
    }

    // Add them directly
    await prisma.organizationMember.create({
      data: {
        userId: userToInvite.id,
        organizationId: adminMembership.organizationId,
        role: role as "ADMIN" | "HR" | "MEMBER",
      },
    });
  } else {
    // 2. User doesn't exist, create an invitation
    await prisma.organizationInvite.upsert({
      where: {
        email_organizationId: {
          email,
          organizationId: adminMembership.organizationId,
        },
      },
      update: {
        role: role as "ADMIN" | "HR" | "MEMBER",
        invitedBy: session.user.id,
      },
      create: {
        email,
        organizationId: adminMembership.organizationId,
        role: role as "ADMIN" | "HR" | "MEMBER",
        invitedBy: session.user.id,
      },
    });

    // TODO: Send invitation email
  }

  revalidatePath("/settings/team");
}

export async function removeMember(memberId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const adminMembership = await getOrgMembership(session.user.id);
  if (!adminMembership || adminMembership.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const memberToRemove = await prisma.organizationMember.findUnique({
    where: { id: memberId },
  });

  if (!memberToRemove || memberToRemove.organizationId !== adminMembership.organizationId) {
    throw new Error("Member not found in your organization");
  }

  // Prevent removing self if last admin
  if (memberToRemove.userId === session.user.id) {
    const adminCount = await prisma.organizationMember.count({
      where: {
        organizationId: adminMembership.organizationId,
        role: "ADMIN",
      },
    });
    if (adminCount <= 1) {
      throw new Error("Cannot remove the last admin");
    }
  }

  await prisma.organizationMember.delete({
    where: { id: memberId },
  });

  revalidatePath("/settings/team");
}

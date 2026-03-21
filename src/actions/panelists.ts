"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateToken } from "@/lib/tokens";

export async function invitePanelist(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const programId = parseInt(formData.get("programId") as string);
  const roundId = parseInt(formData.get("roundId") as string);
  const externalEmail = (formData.get("email") as string)?.trim();
  const externalName = (formData.get("name") as string)?.trim();

  if (!programId || !roundId || !externalEmail) {
    throw new Error("Program, round, and email are required");
  }

  const token = generateToken();

  await prisma.programPanelist.create({
    data: {
      programId,
      roundId,
      externalEmail,
      externalName: externalName || null,
      magicLinkToken: token,
      availableSlots: [],
    },
  });

  revalidatePath(`/programs/${programId}/panelists`);
}

export async function saveAvailability(token: string, slots: { start: string; end: string }[]) {
  const panelist = await prisma.programPanelist.findUnique({
    where: { magicLinkToken: token },
  });

  if (!panelist) throw new Error("Invalid link");

  await prisma.programPanelist.update({
    where: { magicLinkToken: token },
    data: {
      availableSlots: slots,
      magicLinkUsedAt: panelist.magicLinkUsedAt ?? new Date(),
    },
  });
}

export async function deletePanelist(panelistId: number, programId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  await prisma.programPanelist.delete({ where: { id: panelistId } });
  revalidatePath(`/programs/${programId}/panelists`);
}

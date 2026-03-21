"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function createOrganization(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const name = (formData.get("name") as string | null)?.trim();
  if (!name) throw new Error("Organization name is required");

  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const slug = `${baseSlug}-${Date.now()}`;

  await prisma.organization.create({
    data: {
      name,
      slug,
      members: {
        create: {
          userId: session.user.id,
          role: "ADMIN",
        },
      },
    },
  });

  redirect("/dashboard");
}

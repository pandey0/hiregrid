import { prisma } from "./prisma";
import { auth } from "./auth";
import { headers } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";

/**
 * PRODUCTION-READY AUTH RETRIEVAL
 * performance: Uses React.cache to ensure that within a single request,
 * the session and membership are only fetched once, even if called 
 * in Layout, Page, and multiple child components.
 */
export const getAuthenticatedContext = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { session: null, membership: null };

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  });

  return { session, membership };
});

/**
 * Strict version that redirects to sign-in/onboarding if context is missing.
 */
export async function requireAuth() {
  const { session, membership } = await getAuthenticatedContext();
  
  if (!session) redirect("/sign-in");
  if (!membership) redirect("/onboarding");

  return { session, membership };
}

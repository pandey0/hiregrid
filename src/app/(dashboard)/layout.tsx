import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import TopNav from "@/components/PageComponents/TopNav";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopNav user={{ name: session.user.name, email: session.user.email }} />
      <main className="min-h-screen pb-20">{children}</main>
    </div>
  );
}

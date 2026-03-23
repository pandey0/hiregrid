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
    <div className="min-h-screen bg-app-bg transition-colors duration-500">
      <TopNav user={{ name: session.user.name, email: session.user.email }} />
      {/* 
        Header is ~104px high (h-20 + pt-6). 
        Adding pt-32 to main to ensure content starts clearly below the floating nav.
      */}
      <main className="min-h-screen pt-32 pb-20">{children}</main>
    </div>
  );
}

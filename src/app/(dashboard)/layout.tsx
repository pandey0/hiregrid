import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SidebarShell from "@/components/PageComponents/SidebarShell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-zinc-50">
      <SidebarShell user={{ name: session.user.name, email: session.user.email }} />
      <div className="md:pl-56">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}

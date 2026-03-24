import { ReactNode } from "react";
import TopNav from "@/components/PageComponents/TopNav";
import { requireAuth } from "@/lib/auth-context";
import { CommandMenu } from "@/components/CommandMenu";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // performance: Using unified auth context to prevent redundant DB hits
  const { session } = await requireAuth();

  return (
    <div className="min-h-screen bg-app-bg transition-colors duration-500 overflow-x-hidden">
      <TopNav user={{ name: session.user.name, email: session.user.email }} />
      <CommandMenu />
      <main className="min-h-screen pt-32 pb-20">
        {children}
      </main>
    </div>
  );
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { checkProgramAccess } from "@/lib/permissions";
import EditProgramForm from "./EditProgramForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) redirect("/onboarding");

  // Only Admin or LEAD can edit program metadata
  const access = await checkProgramAccess(parseInt(id), session.user.id);
  if (access !== "ADMIN" && access !== "LEAD") {
    notFound();
  }

  const program = await prisma.program.findFirst({
    where: { id: parseInt(id), organizationId: membership.organizationId, deletedAt: null },
  });

  if (!program) notFound();

  return (
    <div className="page-container pb-20">
      {/* Background Decorative Element */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-app-accent/5 blur-[140px] rounded-full opacity-50 translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="mb-20">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="text-[11px] font-mono font-bold uppercase tracking-widest text-app-text-sub hover:text-app-accent transition-colors">
                  Dashboard //
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-app-border" />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/programs/${id}`} className="text-[11px] font-mono font-bold uppercase tracking-widest text-app-text-sub hover:text-app-accent transition-colors">
                  {program.name} //
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-app-border" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[11px] font-mono font-bold uppercase tracking-widest text-app-text-main">
                Architecture Tuning
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex items-end justify-start gap-12 text-left">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="arch-mono-label px-3 py-1">System Configuration</span>
              <span className="text-[10px] font-mono font-bold text-app-text-sub uppercase tracking-widest">
                Resource Optimization
              </span>
            </div>
            <h1 className="text-7xl font-black text-app-text-main tracking-tighter leading-[0.85] mb-6">Edit <span className="text-app-accent">Sequence</span>.</h1>
            <p className="text-xl font-medium text-app-text-sub leading-relaxed max-w-xl italic">
              Update the identity and operational templates of your hiring program.
            </p>
          </div>
        </header>
      </div>
      
      <div className="max-w-5xl text-left">
        <EditProgramForm program={program} />
      </div>
    </div>
  );
}

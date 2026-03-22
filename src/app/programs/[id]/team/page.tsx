import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { checkProgramAccess } from "@/lib/permissions";
import AddProgramMemberForm from "./AddProgramMemberForm";
import { removeProgramMember } from "@/actions/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export default async function ProgramTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const programId = parseInt(id);
  const access = await checkProgramAccess(programId, session.user.id);
  if (access !== "ADMIN" && access !== "LEAD") {
    redirect(`/programs/${id}`);
  }

  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      members: {
        include: { user: true },
        orderBy: { role: "asc" }
      },
      organization: {
        include: {
          members: {
            include: { user: true }
          }
        }
      }
    }
  });

  if (!program) notFound();

  // Get users who are in the organization but NOT in this program
  const assignedUserIds = program.members.map(m => m.userId);
  const availableUsers = program.organization.members
    .filter(om => !assignedUserIds.includes(om.userId))
    .map(om => ({
      id: om.user.id,
      email: om.user.email,
      name: om.user.name
    }));

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
      <div className="mb-10">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="text-slate-400 hover:text-slate-900 font-medium transition-colors">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/programs/${id}`} className="text-slate-400 hover:text-slate-900 font-medium transition-colors">{program.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-slate-900 font-bold">Team</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Program Team</h1>
        <p className="text-[15px] text-slate-500 mt-1.5 font-medium leading-relaxed">
          Manage who has access to coordinate and lead the <span className="text-slate-900 font-bold">{program.name}</span> program.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest">Assigned Staff</h2>
            </div>

            <Card className="border-slate-200/60 rounded-[24px] shadow-sm overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10 px-6">Member</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10 px-6">Program Role</TableHead>
                    <TableHead className="h-10 px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {program.members.map((m) => (
                    <TableRow key={m.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px] uppercase">
                            {m.user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-[14px] leading-tight">
                              {m.user.name} {m.userId === session.user.id && "(You)"}
                            </p>
                            <p className="text-[12px] text-slate-500 mt-0.5">{m.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6">
                        <Badge className={cn(
                          "text-[10px] font-bold tracking-tight px-2 h-5 border-none",
                          m.role === "LEAD" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {m.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        {m.userId !== session.user.id && (
                          <form action={removeProgramMember.bind(null, programId, m.userId)}>
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-semibold text-xs"
                            >
                              Remove
                            </Button>
                          </form>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <section className="space-y-6">
            <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest px-1">Assign Staff</h2>
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm rounded-[24px] shadow-sm overflow-hidden p-6">
              <AddProgramMemberForm programId={programId} availableUsers={availableUsers} />
            </Card>
          </section>

          <Card className="bg-slate-900 border-none rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4">Role Definitions</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[13px] font-bold text-blue-400 uppercase tracking-wider mb-1">Program Lead</p>
                  <p className="text-[12px] text-slate-400 leading-relaxed">
                    Full authority over this program. Can manage the team, edit rounds, and delete the program.
                  </p>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-300 uppercase tracking-wider mb-1">Program HR</p>
                  <p className="text-[12px] text-slate-400 leading-relaxed">
                    Operational access. Can manage candidates, panelists, and bookings, but cannot change the program structure.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

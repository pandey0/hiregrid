import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import InvitePanelistForm from "./InvitePanelistForm";
import { deletePanelist } from "@/actions/panelists";
import CopyButton from "./CopyButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Users, Mail, Link as LinkIcon, Trash2, Calendar, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function formatSlots(slots: unknown): number {
  if (!Array.isArray(slots)) return 0;
  return slots.length;
}

export default async function PanelistsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) redirect("/onboarding");

  const program = await prisma.program.findFirst({
    where: { id: parseInt(id), organizationId: membership.organizationId },
    include: {
      rounds: { orderBy: { roundNumber: "asc" } },
      panelists: {
        orderBy: { createdAt: "desc" },
        include: { round: true },
      },
    },
  });

  if (!program) notFound();

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "";

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
              <BreadcrumbPage className="text-slate-900 font-bold">Panelists</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panelists</h1>
            <p className="text-[15px] text-slate-500 mt-1.5 font-medium leading-relaxed">
              Managing <span className="text-slate-900 font-bold">{program.panelists.length}</span> assigned interviewers for <span className="text-slate-900 font-bold">{program.name}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
          {program.rounds.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-slate-50/30 rounded-[24px]">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 text-slate-200">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Define rounds first</h3>
                <p className="text-[15px] text-slate-500 mt-2 max-w-[340px] leading-relaxed">
                  You need to add interview rounds to this program before you can assign panelists.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <section className="space-y-6">
                <div className="flex items-center gap-2.5 px-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest">Invite Interviewer</h2>
                </div>
                <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm rounded-[24px] shadow-sm overflow-hidden">
                  <CardContent className="p-8">
                    <InvitePanelistForm programId={program.id} rounds={program.rounds} />
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest">Assigned Panelists</h2>
                  </div>
                </div>

                {program.panelists.length === 0 ? (
                  <Card className="border-dashed border-slate-200 bg-slate-50/30 rounded-[24px]">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <p className="text-[14px] text-slate-400 font-medium">No panelists have been invited yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-slate-200/60 rounded-[24px] shadow-sm overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-slate-50/50">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10 px-6">Name / Email</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10 px-6">Round</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10 px-6">Availability</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10 px-6">Access Link</TableHead>
                            <TableHead className="h-10 px-6"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {program.panelists.map((p) => {
                            const magicLink = `${baseUrl}/availability/${p.magicLinkToken}`;
                            const slotCount = formatSlots(p.availableSlots);
                            return (
                              <TableRow key={p.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                                <TableCell className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px] uppercase">
                                      {(p.externalName || "P").charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900 text-[14px] leading-tight group-hover:text-blue-600 transition-colors">{p.externalName || "Unnamed Panelist"}</p>
                                      <p className="text-[12px] text-slate-500 mt-0.5">{p.externalEmail}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="px-6">
                                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] font-bold tracking-tight px-2 h-5 border-slate-200/50 border">
                                    {p.round.name}
                                  </Badge>
                                </TableCell>
                                <TableCell className="px-6">
                                  <Badge className={cn(
                                    "text-[11px] font-bold tracking-tight px-2 h-6 border shadow-none",
                                    slotCount > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                  )}>
                                    <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 shrink-0", slotCount > 0 ? "bg-emerald-500" : "bg-slate-300")} />
                                    {slotCount} {slotCount === 1 ? "slot" : "slots"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="px-6">
                                  <CopyButton value={magicLink} />
                                </TableCell>
                                <TableCell className="px-6 text-right">
                                  <form action={deletePanelist.bind(null, p.id, program.id)}>
                                    <Button
                                      type="submit"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </form>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                )}
              </section>
            </>
          )}
        </div>

        <div className="lg:col-span-4 space-y-10">
          <Card className="bg-slate-900 border-none rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Automate Scheduling</h3>
              <p className="text-slate-400 text-[14px] leading-relaxed mb-8">
                Panelists get a headless interface to submit availability. No login or calendar syncing needed.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[13px] font-medium text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  Smart slot snapping
                </div>
                <div className="flex items-center gap-3 text-[13px] font-medium text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  Conflict prevention
                </div>
                <div className="flex items-center gap-3 text-[13px] font-medium text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  One-click reminders
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

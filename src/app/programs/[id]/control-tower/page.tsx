import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BarChart3, AlertTriangle, CheckCircle2, Activity, Users, Calendar, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type HealthResult = {
  label: string;
  dot: string;
  className: string;
};

function healthLabel(supply: number, demand: number): HealthResult {
  if (demand === 0) return { label: "No demand", dot: "bg-slate-400", className: "bg-slate-50 text-slate-600 border-slate-100" };
  const delta = supply - demand;
  if (delta < 0) return { label: "Deficit", dot: "bg-rose-500", className: "bg-rose-50 text-rose-700 border-rose-100" };
  if (delta < 2) return { label: "Tight", dot: "bg-amber-500", className: "bg-amber-50 text-amber-700 border-amber-100" };
  return { label: "Healthy", dot: "bg-emerald-500", className: "bg-emerald-50 text-emerald-700 border-emerald-100" };
}

export default async function ControlTowerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) redirect("/onboarding");

  const program = await prisma.program.findFirst({
    where: { id: parseInt(id), organizationId: membership.organizationId },
    include: {
      rounds: {
        orderBy: { roundNumber: "asc" },
        include: {
          panelists: true,
          activeCandidates: { where: { status: { in: ["ACTIVE", "BOOKED"] } } },
          bookings: { where: { status: "SCHEDULED" } },
        },
      },
    },
  });

  if (!program) notFound();

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
              <BreadcrumbPage className="text-slate-900 font-bold">Control Tower</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Control Tower</h1>
            <p className="text-[15px] text-slate-500 mt-1.5 font-medium leading-relaxed max-w-2xl">
              Real-time balance of interview supply vs. candidate demand across all rounds.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-2.5 px-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest">Pipeline Health</h2>
          </div>

          {program.rounds.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-slate-50/30 rounded-[24px]">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 text-slate-200">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No rounds to track</h3>
                <p className="text-[15px] text-slate-500 mt-2 max-w-[340px] leading-relaxed">
                  Analytics will appear here once you define the interview rounds for this program.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {program.rounds.map((round) => {
                const supply = round.panelists.reduce((acc, p) => {
                  const slots = Array.isArray(p.availableSlots) ? p.availableSlots : [];
                  const unbooked = slots.filter((s: any) => !s.booked);
                  return acc + unbooked.length;
                }, 0);
                const demand = round.activeCandidates.length;
                const booked = round.bookings.length;
                const health = healthLabel(supply, demand);

                return (
                  <Card key={round.id} className="border-slate-200/60 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 rounded">R{round.roundNumber}</span>
                            <h3 className="text-[16px] font-bold text-slate-900">{round.name}</h3>
                          </div>
                          <p className="text-[13px] text-slate-500 mt-1 font-medium">
                            {round.durationMinutes} min session
                          </p>
                        </div>
                        <Badge className={cn("text-[11px] font-bold tracking-tight px-2 h-6 border shadow-none", health.className)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 shrink-0", health.dot)} />
                          {health.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
                        {[
                          { label: "Panelists", value: round.panelists.length, icon: Users, color: "text-blue-600" },
                          { label: "Free Slots", value: supply, icon: Calendar, color: "text-emerald-600" },
                          { label: "Active Demand", value: demand, icon: Activity, color: "text-amber-600" },
                          { label: "Booked", value: booked, icon: CheckCircle2, color: "text-indigo-600" },
                        ].map((s) => (
                          <div key={s.label}>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
                            <div className="flex items-baseline gap-1.5">
                              <p className={cn("text-2xl font-bold tabular-nums tracking-tight", s.color)}>{s.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {supply < demand && (
                        <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5" />
                          <div className="text-[13px] text-rose-800 font-medium leading-relaxed">
                            <span className="font-bold">{demand - supply} candidate{demand - supply !== 1 ? "s" : ""}</span> cannot book interviews due to lack of availability. 
                            <Link
                              href={`/programs/${id}/panelists`}
                              className="ml-1.5 text-rose-900 font-bold underline decoration-rose-200 hover:decoration-rose-400 transition-colors"
                            >
                              Add panelists →
                            </Link>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-10">
          <Card className="bg-slate-900 border-none rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Supply Chain Logic</h3>
              <p className="text-slate-400 text-[14px] leading-relaxed mb-8">
                Control Tower treats your interviewers as 'supply' and candidates as 'demand'.
              </p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-white leading-none">Healthy</p>
                    <p className="text-[12px] text-slate-400 mt-1 leading-tight">Supply exceeds demand by 2+ slots.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-white leading-none">Tight</p>
                    <p className="text-[12px] text-slate-400 mt-1 leading-tight">Supply is just enough for demand.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-white leading-none">Deficit</p>
                    <p className="text-[12px] text-slate-400 mt-1 leading-tight">Candidates are waiting for slots.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Users, 
  Calendar, 
  CheckCircle2, 
  LayoutGrid, 
  ArrowRight,
  ClipboardList,
  Clock,
  Briefcase
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  });
  if (!membership) redirect("/onboarding");

  const [programs, candidatesCount, bookingsCount] = await Promise.all([
    prisma.program.findMany({
      where: { organizationId: membership.organizationId },
      include: { rounds: true, _count: { select: { candidates: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.candidate.count({ where: { organizationId: membership.organizationId } }),
    prisma.booking.count({
      where: {
        candidate: { organizationId: membership.organizationId },
        status: "SCHEDULED",
      },
    }),
  ]);

  const completedBookings = await prisma.booking.count({
    where: {
      candidate: { organizationId: membership.organizationId },
      status: "COMPLETED",
    },
  });

  const stats = [
    { label: "Programs", value: programs.length, icon: LayoutGrid, color: "text-blue-600", bg: "bg-blue-50/50" },
    { label: "Candidates", value: candidatesCount, icon: Users, color: "text-slate-600", bg: "bg-slate-50/50" },
    { label: "Bookings", value: bookingsCount, icon: Calendar, color: "text-slate-600", bg: "bg-slate-50/50" },
    { label: "Completed", value: completedBookings, icon: CheckCircle2, color: "text-slate-600", bg: "bg-slate-50/50" },
  ];

  const firstName = session.user.name.split(" ")[0];

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
      {/* Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Good morning, {firstName}
          </h1>
          <p className="text-slate-500 mt-1.5 font-medium">
            You have <span className="text-blue-600">{bookingsCount} interviews</span> scheduled for today.
          </p>
        </div>
        <Button asChild className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200/50 transition-all active:scale-[0.98]">
          <Link href="/programs/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Program
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {stats.map((stat) => (
          <div key={stat.label} className="group relative">
            <div className="absolute inset-0 bg-blue-600/5 rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Card className="relative border-slate-200/60 bg-white/80 backdrop-blur-sm rounded-[24px] shadow-sm group-hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Programs List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 text-slate-400" />
              Active Programs
            </h2>
            {programs.length > 0 && (
              <Link href="/programs" className="text-[13px] font-semibold text-blue-600 hover:text-blue-700">
                View all
              </Link>
            )}
          </div>

          {programs.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-slate-50/30 rounded-[24px]">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-5">
                  <ClipboardList className="w-7 h-7 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Start your first program</h3>
                <p className="text-[14px] text-slate-500 mt-2 mb-8 max-w-[320px] leading-relaxed">
                  HireGrid helps you manage multi-round interviews with automated scheduling and AI screening.
                </p>
                <Button asChild variant="outline" className="rounded-xl h-10 px-6 border-slate-200">
                  <Link href="/programs/create">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {programs.slice(0, 5).map((program) => (
                <Link
                  key={program.id}
                  href={`/programs/${program.id}`}
                  className="block group"
                >
                  <Card className="border-slate-200/60 bg-white group-hover:border-blue-200/60 rounded-2xl shadow-sm group-hover:shadow-xl group-hover:shadow-blue-900/5 transition-all duration-300">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <h4 className="text-[16px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {program.name}
                          </h4>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider px-2 rounded-md">
                            {program.rounds.length} rounds
                          </Badge>
                        </div>
                        {program.description && (
                          <p className="text-[13px] text-slate-500 mt-1.5 line-clamp-1 max-w-md">
                            {program.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-4 text-[12px] font-medium text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            {program._count.candidates} candidates
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            2 days ago
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-6">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-4 space-y-10">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 mb-6 px-2">Quick Actions</h2>
            <div className="grid gap-3">
              <Button variant="outline" className="w-full h-14 justify-start text-[14px] font-bold rounded-2xl border-slate-200/60 hover:bg-slate-50 hover:border-slate-300 transition-all px-4" asChild>
                <Link href="/programs/create">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3.5">
                    <Plus className="w-4 h-4" />
                  </div>
                  New Program
                </Link>
              </Button>
            </div>
          </div>

          <Card className="bg-slate-900 border-none rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Automate everything</h3>
              <p className="text-slate-400 text-[14px] leading-relaxed mb-8">
                Upgrade to Pro to unlock AI-powered screening and automated booking.
              </p>
              <Button className="w-full h-11 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-all">
                Upgrade Now
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Add this to your imports at the top
import { Sparkles } from "lucide-react";


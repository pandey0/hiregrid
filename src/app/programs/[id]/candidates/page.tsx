import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import AddCandidateForm from "./AddCandidateForm";
import BulkUploadForm from "./BulkUploadForm";
import CandidateActions from "./CandidateActions";
import ResumeCell from "./ResumeCell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Users, Filter, Search, Download, Plus, Sparkles, Building2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusConfig: Record<string, { label: string; dot: string; className: string }> = {
  SCREENING:   { label: "Screening",   dot: "bg-purple-500", className: "bg-purple-50 text-purple-700 border-purple-100" },
  DRAFT:       { label: "Draft",       dot: "bg-slate-400",  className: "bg-slate-50 text-slate-600 border-slate-100" },
  SHORTLISTED: { label: "Shortlisted", dot: "bg-amber-500",  className: "bg-amber-50 text-amber-700 border-amber-100" },
  ACTIVE:      { label: "Active",      dot: "bg-blue-500",   className: "bg-blue-50 text-blue-700 border-blue-100" },
  BOOKED:      { label: "Booked",      dot: "bg-emerald-500", className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  COMPLETED:   { label: "Completed",   dot: "bg-slate-600",  className: "bg-slate-100 text-slate-800 border-slate-200" },
  REJECTED:    { label: "Rejected",    dot: "bg-rose-500",   className: "bg-rose-50 text-rose-700 border-rose-100" },
};

function CandidateRow({ c, rounds, showAgency }: {
  c: any;
  rounds: { id: number; name: string; roundNumber: number }[];
  showAgency?: boolean;
}) {
  const cfg = statusConfig[c.status] ?? { label: c.status, dot: "bg-slate-400", className: "bg-slate-50 text-slate-600" };
  const score = c.atsScore !== null && c.atsScore !== undefined ? Math.round(c.atsScore) : null;

  return (
    <TableRow className="group hover:bg-slate-50/50 transition-colors">
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
            {c.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-[14px] leading-tight group-hover:text-blue-600 transition-colors">{c.name}</p>
            <p className="text-[12px] text-slate-500 mt-0.5">{c.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {c.currentRole || c.currentCompany ? (
          <div>
            {c.currentRole && <p className="text-[13px] font-semibold text-slate-700 leading-tight">{c.currentRole}</p>}
            {c.currentCompany && <p className="text-[11px] text-slate-400 mt-0.5">{c.currentCompany}</p>}
          </div>
        ) : (
          <span className="text-slate-300 text-xs">—</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {showAgency ? (
            <Badge variant="secondary" className="bg-purple-50 text-purple-600 text-[10px] font-bold tracking-tight px-1.5 h-5 border-purple-100/50 border">
              <Building2 className="w-3 h-3 mr-1" />
              {c.agency?.name ?? "Agency"}
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-slate-50 text-slate-500 text-[10px] font-bold tracking-tight px-1.5 h-5 border-slate-100/50 border">Direct</Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        {score !== null ? (
          <div className="flex items-center gap-3 min-w-24">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  score > 80 ? "bg-emerald-500" : score > 60 ? "bg-blue-500" : "bg-amber-500"
                )} 
                style={{ width: `${score}%` }} 
              />
            </div>
            <span className="text-[12px] font-bold text-slate-600 tabular-nums">{score}</span>
          </div>
        ) : (
          <span className="text-slate-300 text-sm">—</span>
        )}
      </TableCell>
      <TableCell>
        <Badge className={cn("text-[11px] font-bold tracking-tight px-2 h-6 border shadow-none", cfg.className)}>
          <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 shrink-0", cfg.dot)} />
          {cfg.label}
        </Badge>
      </TableCell>
      <TableCell className="text-slate-500 text-[13px] font-medium">
        {c.activeRound?.name ?? <span className="text-slate-300">—</span>}
      </TableCell>
      <TableCell>
        <ResumeCell candidateId={c.id} resumeUrl={c.resumeUrl} />
      </TableCell>
      <TableCell className="text-right">
        <CandidateActions candidateId={c.id} status={c.status} rounds={rounds} />
      </TableCell>
    </TableRow>
  );
}

import { cn } from "@/lib/utils";

export default async function CandidatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) redirect("/onboarding");

  const program = await prisma.program.findFirst({
    where: { id: parseInt(id), organizationId: membership.organizationId },
    include: {
      rounds: { orderBy: { roundNumber: "asc" } },
      candidates: {
        orderBy: { createdAt: "desc" },
        include: { activeRound: true, agency: true },
      },
    },
  });

  if (!program) notFound();

  const screening = program.candidates.filter((c) => c.status === "SCREENING");
  const pipeline = program.candidates.filter((c) => c.status !== "SCREENING");

  const tableHeaders = (
    <TableHeader className="bg-slate-50/50">
      <TableRow className="hover:bg-transparent">
        <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10">Candidate</TableHead>
        <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10">Experience</TableHead>
        <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10">Source</TableHead>
        <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10">ATS Score</TableHead>
        <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10">Status</TableHead>
        <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10">Round</TableHead>
        <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10">Resume</TableHead>
        <TableHead className="h-10"></TableHead>
      </TableRow>
    </TableHeader>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
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
              <BreadcrumbPage className="text-slate-900 font-bold">Candidates</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Candidates</h1>
            <p className="text-[15px] text-slate-500 mt-1.5 font-medium leading-relaxed">
              Managing <span className="text-slate-900 font-bold">{program.candidates.length}</span> candidates in <span className="text-slate-900 font-bold">{program.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <div className="flex items-center gap-2">
              <AddCandidateForm programId={program.id} />
              <BulkUploadForm programId={program.id} />
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200/60 h-auto">
            <TabsTrigger value="pipeline" className="rounded-xl px-5 py-2 text-[14px] font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600">
              Pipeline
              <Badge variant="secondary" className="ml-2 bg-slate-200/60 text-slate-600 border-none px-1.5 h-5 text-[10px] font-bold">{pipeline.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="screening" className="rounded-xl px-5 py-2 text-[14px] font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-600 group">
              Screening Queue
              {screening.length > 0 && (
                <Badge className="ml-2 bg-purple-600 text-white border-none px-1.5 h-5 text-[10px] font-bold shadow-sm">{screening.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                placeholder="Search candidates..." 
                className="h-10 pl-9 pr-4 rounded-xl border border-slate-200/60 bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full md:w-64"
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200/60">
              <Filter className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
        </div>

        <TabsContent value="pipeline" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {pipeline.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-slate-50/30 rounded-[24px]">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Your pipeline is empty</h3>
                <p className="text-[15px] text-slate-500 mt-2 mb-8 max-w-[340px] leading-relaxed">
                  Start by adding candidates manually or bulk upload resumes for AI-powered screening.
                </p>
                <div className="flex items-center gap-3">
                  <AddCandidateForm programId={program.id} />
                  <BulkUploadForm programId={program.id} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200/60 rounded-[24px] shadow-sm overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <Table>
                  {tableHeaders}
                  <TableBody>
                    {pipeline.map((c) => (
                      <CandidateRow key={c.id} c={c} rounds={program.rounds} showAgency={c.source === "AGENCY"} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="screening" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="bg-purple-900 rounded-[24px] p-6 text-white relative overflow-hidden shadow-2xl shadow-purple-900/10">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-200" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Agency Submissions</h3>
                  <p className="text-purple-200 text-[14px] leading-relaxed mt-0.5">
                    Review agency-submitted candidates. Approve to move them to pipeline, or reject.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button className="bg-white text-purple-900 hover:bg-white/90 rounded-xl font-bold px-5 h-10 transition-all active:scale-[0.98]">
                  Bulk Approve
                </Button>
              </div>
            </div>
          </Card>

          {screening.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-slate-50/30 rounded-[24px]">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Queue is clear</h3>
                <p className="text-[15px] text-slate-500 mt-2 max-w-[340px] leading-relaxed">
                  No new agency submissions waiting for review at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200/60 rounded-[24px] shadow-sm overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <Table>
                  {tableHeaders}
                  <TableBody>
                    {screening.map((c) => (
                      <CandidateRow key={c.id} c={c} rounds={program.rounds} showAgency />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

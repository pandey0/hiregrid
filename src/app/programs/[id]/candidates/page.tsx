import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import AddCandidateForm from "./AddCandidateForm";
import BulkUploadForm from "./BulkUploadForm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import CandidateTable from "./CandidateTable";

export default async function CandidatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) redirect("/onboarding");

  const program = await prisma.program.findFirst({
    where: { id: parseInt(id), organizationId: membership.organizationId, deletedAt: null },
    include: {
      rounds: { where: { deletedAt: null }, orderBy: { roundNumber: "asc" } },
      candidates: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: { activeRound: true, agency: true },
      },
    },
  });

  if (!program) notFound();

  const screening = program.candidates.filter((c) => c.status === "SCREENING");
  const pipeline = program.candidates.filter((c) => c.status !== "SCREENING");

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
            <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
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
              <input 
                placeholder="Search candidates..." 
                className="h-10 px-4 rounded-xl border border-slate-200/60 bg-white text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full md:w-64 placeholder:text-slate-400 shadow-sm"
              />
            </div>
            <Button variant="outline" className="h-10 rounded-xl border-slate-200/60 font-bold text-[14px] shadow-sm">
              Filter
            </Button>
          </div>
        </div>

        <TabsContent value="pipeline" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {pipeline.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-slate-50/30 rounded-[24px]">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
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
            <CandidateTable candidates={pipeline} rounds={program.rounds} />
          )}
        </TabsContent>

        <TabsContent value="screening" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="bg-slate-900 rounded-[24px] p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold">Agency Submissions</h3>
                <p className="text-slate-400 text-[15px] leading-relaxed mt-1 max-w-xl">
                  Review agency-submitted candidates before they enter your pipeline. Approving them will trigger automated ATS screening if configured.
                </p>
              </div>
              <Button className="bg-white text-slate-900 hover:bg-slate-50 rounded-xl font-bold px-6 h-11 transition-all active:scale-[0.98] shrink-0">
                Bulk Approve
              </Button>
            </div>
          </Card>

          {screening.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-slate-50/30 rounded-[24px]">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <h3 className="text-xl font-bold text-slate-900">Queue is clear</h3>
                <p className="text-[15px] text-slate-500 mt-2 max-w-[340px] leading-relaxed">
                  No new agency submissions waiting for review at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <CandidateTable candidates={screening} rounds={program.rounds} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

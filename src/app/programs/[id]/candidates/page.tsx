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

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className?: string }> = {
  SCREENING:   { label: "Screening",   variant: "outline",     className: "border-purple-300 text-purple-600" },
  DRAFT:       { label: "Draft",       variant: "secondary" },
  SHORTLISTED: { label: "Shortlisted", variant: "outline",     className: "border-amber-300 text-amber-600" },
  ACTIVE:      { label: "Active",      variant: "default" },
  BOOKED:      { label: "Booked",      variant: "outline",     className: "border-green-300 text-green-600" },
  COMPLETED:   { label: "Completed",   variant: "secondary",   className: "text-zinc-900" },
  REJECTED:    { label: "Rejected",    variant: "destructive" },
};

function CandidateRow({ c, rounds, showAgency }: {
  c: any;
  rounds: { id: number; name: string; roundNumber: number }[];
  showAgency?: boolean;
}) {
  const cfg = statusConfig[c.status] ?? { label: c.status, variant: "secondary" as const };
  const score = c.atsScore !== null && c.atsScore !== undefined ? Math.round(c.atsScore) : null;

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium text-zinc-900 text-sm">{c.name}</p>
        <p className="text-xs text-zinc-400">{c.email}</p>
        {c.phone && <p className="text-[11px] text-zinc-300">{c.phone}</p>}
      </TableCell>
      <TableCell>
        {c.currentRole || c.currentCompany ? (
          <div>
            {c.currentRole && <p className="text-xs text-zinc-700">{c.currentRole}</p>}
            {c.currentCompany && <p className="text-[11px] text-zinc-400">{c.currentCompany}</p>}
            {c.yearsExperience != null && (
              <p className="text-[11px] text-zinc-300">{c.yearsExperience}y exp</p>
            )}
          </div>
        ) : (
          <span className="text-zinc-300 text-xs">—</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {showAgency ? (
            <Badge variant="outline" className="text-[11px] border-purple-200 text-purple-600">
              {c.agency?.name ?? "Agency"}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[11px]">Direct</Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        {score !== null ? (
          <div className="flex items-center gap-2 min-w-24">
            <Progress value={score} className="h-1.5 w-16" />
            <span className="text-xs font-mono text-zinc-600 tabular-nums">{score}</span>
          </div>
        ) : (
          <span className="text-zinc-300 text-sm">—</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={cfg.variant} className={cfg.className}>{cfg.label}</Badge>
      </TableCell>
      <TableCell className="text-zinc-500 text-xs">
        {c.activeRound?.name ?? <span className="text-zinc-300">—</span>}
      </TableCell>
      <TableCell>
        <ResumeCell candidateId={c.id} resumeUrl={c.resumeUrl} />
      </TableCell>
      <TableCell>
        <CandidateActions candidateId={c.id} status={c.status} rounds={rounds} />
      </TableCell>
    </TableRow>
  );
}

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
    <TableHeader>
      <TableRow>
        <TableHead>Candidate</TableHead>
        <TableHead>Experience</TableHead>
        <TableHead>Source</TableHead>
        <TableHead>ATS Score</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Round</TableHead>
        <TableHead>Resume</TableHead>
        <TableHead className="w-44"></TableHead>
      </TableRow>
    </TableHeader>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href="/dashboard">Dashboard</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href={`/programs/${id}`}>{program.name}</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Candidates</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Candidates</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Add, screen, and move candidates through the hiring pipeline.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pipeline">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="pipeline">
              Pipeline
              <Badge variant="secondary" className="ml-2 h-5 text-[11px]">{pipeline.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="screening">
              Screening Queue
              {screening.length > 0 && (
                <Badge className="ml-2 h-5 text-[11px] bg-purple-600 hover:bg-purple-600">{screening.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-4">Add candidates</p>
              <div className="flex items-center gap-3 flex-wrap">
                <AddCandidateForm programId={program.id} />
                <BulkUploadForm programId={program.id} />
              </div>
            </CardContent>
          </Card>

          {pipeline.length === 0 ? (
            <div className="border border-dashed border-zinc-200 rounded-lg px-6 py-10 text-center text-sm text-zinc-400">
              No candidates in the pipeline yet. Add them above or invite an agency.
            </div>
          ) : (
            <Card>
              <Table>
                {tableHeaders}
                <TableBody>
                  {pipeline.map((c) => (
                    <CandidateRow key={c.id} c={c} rounds={program.rounds} showAgency={c.source === "AGENCY"} />
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="screening" className="space-y-6">
          <div className="bg-purple-50 border border-purple-100 rounded-lg px-5 py-3">
            <p className="text-sm text-purple-800 font-medium">Agency-submitted candidates</p>
            <p className="text-xs text-purple-600 mt-0.5">
              These candidates were submitted by recruitment agencies. Review and approve to move them into the pipeline, or reject them.
            </p>
          </div>

          {screening.length === 0 ? (
            <div className="border border-dashed border-zinc-200 rounded-lg px-6 py-10 text-center text-sm text-zinc-400">
              No candidates pending screening.
            </div>
          ) : (
            <Card>
              <Table>
                {tableHeaders}
                <TableBody>
                  {screening.map((c) => (
                    <CandidateRow key={c.id} c={c} rounds={program.rounds} showAgency />
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

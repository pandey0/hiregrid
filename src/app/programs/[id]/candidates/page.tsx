import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import AddCandidateForm from "./AddCandidateForm";
import CandidateActions from "./CandidateActions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  DRAFT:       { label: "Draft",       variant: "secondary" },
  SHORTLISTED: { label: "Shortlisted", variant: "outline",     className: "border-amber-300 text-amber-600" },
  ACTIVE:      { label: "Active",      variant: "default" },
  BOOKED:      { label: "Booked",      variant: "outline",     className: "border-green-300 text-green-600" },
  COMPLETED:   { label: "Completed",   variant: "secondary",   className: "text-zinc-900" },
  REJECTED:    { label: "Rejected",    variant: "destructive" },
};

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
        include: { activeRound: true },
      },
    },
  });

  if (!program) notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/programs/${id}`}>{program.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Candidates</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Candidates</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Add candidates, review ATS scores, then shortlist and activate for booking.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-4">Add candidate</p>
          <AddCandidateForm programId={program.id} />
        </CardContent>
      </Card>

      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-3">
          Candidates ({program.candidates.length})
        </p>

        {program.candidates.length === 0 ? (
          <div className="border border-dashed border-zinc-200 rounded-lg px-6 py-10 text-center text-sm text-zinc-400">
            No candidates yet.
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>ATS Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Round</TableHead>
                  <TableHead className="w-44"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {program.candidates.map((c) => {
                  const cfg = statusConfig[c.status] ?? { label: c.status, variant: "secondary" as const };
                  const score = c.atsScore !== null && c.atsScore !== undefined ? Math.round(c.atsScore) : null;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium text-zinc-900">{c.name}</TableCell>
                      <TableCell className="text-zinc-500">{c.email}</TableCell>
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
                        <Badge variant={cfg.variant} className={cfg.className}>
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-500">
                        {c.activeRound?.name ?? <span className="text-zinc-300">—</span>}
                      </TableCell>
                      <TableCell>
                        <CandidateActions
                          candidateId={c.id}
                          status={c.status}
                          rounds={program.rounds}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}

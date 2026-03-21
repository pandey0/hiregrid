import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import DeleteProgramButton from "./DeleteProgramButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const roundTypeLabel: Record<string, string> = {
  ATS_SCREENING: "ATS",
  HUMAN_INTERVIEW: "Interview",
  ASSIGNMENT: "Assignment",
};

export default async function ProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) redirect("/onboarding");

  const program = await prisma.program.findFirst({
    where: { id: parseInt(id), organizationId: membership.organizationId },
    include: {
      rounds: {
        orderBy: { roundNumber: "asc" },
        include: { _count: { select: { panelists: true, bookings: true } } },
      },
      _count: { select: { candidates: true, panelists: true, agencies: true } },
    },
  });

  if (!program) notFound();

  const screeningCount = await prisma.candidate.count({
    where: { programId: parseInt(id), status: "SCREENING" },
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href="/dashboard">Dashboard</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{program.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{program.name}</h1>
            {program.description && (
              <p className="text-sm text-zinc-400 mt-1">{program.description}</p>
            )}
          </div>
          <DeleteProgramButton programId={program.id} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          { label: "Rounds", value: program.rounds.length },
          { label: "Panelists", value: program._count.panelists },
          { label: "Candidates", value: program._count.candidates },
          { label: "Agencies", value: program._count.agencies },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4 px-5">
              <p className="text-2xl font-semibold tabular-nums text-zinc-900">{s.value}</p>
              <p className="text-xs text-zinc-400 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { label: "Panelists", href: `/programs/${program.id}/panelists` },
          {
            label: "Candidates",
            href: `/programs/${program.id}/candidates`,
            badge: screeningCount > 0 ? `${screeningCount} screening` : undefined,
          },
          { label: "Agencies", href: `/programs/${program.id}/agencies` },
          { label: "Control Tower", href: `/programs/${program.id}/control-tower` },
        ].map((l) => (
          <Button key={l.href} variant="outline" asChild className="justify-between h-auto py-4 px-5 flex-col items-start gap-1">
            <Link href={l.href}>
              <span className="text-sm font-medium">{l.label}</span>
              {l.badge ? (
                <Badge className="text-[11px] bg-purple-600 hover:bg-purple-600">{l.badge}</Badge>
              ) : (
                <span className="text-xs text-zinc-400">→</span>
              )}
            </Link>
          </Button>
        ))}
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-3">Rounds</p>
        {program.rounds.length === 0 ? (
          <div className="border border-dashed border-zinc-200 rounded-lg px-6 py-10 text-center text-sm text-zinc-400">
            No rounds defined yet. Edit the program to add rounds.
          </div>
        ) : (
          <div className="space-y-2">
            {program.rounds.map((round) => (
              <Card key={round.id}>
                <CardContent className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs tabular-nums text-zinc-300 w-5">{round.roundNumber}</span>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{round.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[11px] h-5">
                          {roundTypeLabel[round.roundType]}
                        </Badge>
                        {round.roundType !== "ATS_SCREENING" && (
                          <span className="text-xs text-zinc-400">{round.durationMinutes} min</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs text-zinc-500">
                      {round._count.panelists} panelists
                    </Badge>
                    <Badge variant="outline" className="text-xs text-zinc-500">
                      {round._count.bookings} bookings
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

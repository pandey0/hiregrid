import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import CreateAgencyForm from "./CreateAgencyForm";
import AgencyCopyButton from "./AgencyCopyButton";
import { deleteAgency } from "@/actions/agencies";
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

export default async function AgenciesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) redirect("/onboarding");

  const program = await prisma.program.findFirst({
    where: { id: parseInt(id), organizationId: membership.organizationId },
    include: {
      agencies: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { candidates: true } } },
      },
    },
  });

  if (!program) notFound();

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "";

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
              <BreadcrumbLink asChild><Link href={`/programs/${id}`}>{program.name}</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Agencies</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Recruitment Agencies</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Each agency gets a private magic link. They use it to submit candidates directly — no account needed.
          Submitted candidates go into the Screening Queue for your review.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-4">Add agency</p>
          <CreateAgencyForm programId={program.id} />
        </CardContent>
      </Card>

      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-3">
          Agencies ({program.agencies.length})
        </p>

        {program.agencies.length === 0 ? (
          <div className="border border-dashed border-zinc-200 rounded-lg px-6 py-10 text-center text-sm text-zinc-400">
            No agencies added yet. Create one above to get their submission link.
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agency</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Portal link</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {program.agencies.map((agency) => {
                  const portalLink = `${baseUrl}/agency/${agency.magicLinkToken}`;
                  return (
                    <TableRow key={agency.id}>
                      <TableCell>
                        <p className="font-medium text-zinc-900 text-sm">{agency.name}</p>
                        <p className="text-xs text-zinc-400">{agency.email}</p>
                      </TableCell>
                      <TableCell className="text-zinc-600 text-sm">
                        {agency.contactPerson ?? <span className="text-zinc-300">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{agency._count.candidates} candidates</Badge>
                      </TableCell>
                      <TableCell>
                        <AgencyCopyButton value={portalLink} />
                      </TableCell>
                      <TableCell>
                        <form action={deleteAgency.bind(null, agency.id, program.id)}>
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 text-zinc-300 hover:text-red-500 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </form>
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

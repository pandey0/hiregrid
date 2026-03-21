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
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-zinc-700 -ml-2 mb-1">
          <Link href={`/programs/${id}`}>← {program.name}</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 mt-1">Panelists</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Invite panelists to a round. They receive a private link to submit their availability — no account needed.
        </p>
      </div>

      {program.rounds.length === 0 ? (
        <div className="border border-dashed border-zinc-200 rounded-lg px-6 py-10 text-center text-sm text-zinc-400">
          Add rounds to the program first before inviting panelists.
        </div>
      ) : (
        <>
          <Card className="mb-8">
            <CardContent className="pt-6">
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-4">Invite panelist</p>
              <InvitePanelistForm programId={program.id} rounds={program.rounds} />
            </CardContent>
          </Card>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-3">
              Panelists ({program.panelists.length})
            </p>

            {program.panelists.length === 0 ? (
              <div className="border border-dashed border-zinc-200 rounded-lg px-6 py-10 text-center text-sm text-zinc-400">
                No panelists invited yet.
              </div>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name / Email</TableHead>
                      <TableHead>Round</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Magic link</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {program.panelists.map((p) => {
                      const magicLink = `${baseUrl}/availability/${p.magicLinkToken}`;
                      const slotCount = formatSlots(p.availableSlots);
                      return (
                        <TableRow key={p.id}>
                          <TableCell>
                            <p className="font-medium text-zinc-900">{p.externalName || "—"}</p>
                            <p className="text-xs text-zinc-400">{p.externalEmail}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{p.round.name}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={slotCount > 0 ? "default" : "outline"}>
                              {slotCount} {slotCount === 1 ? "slot" : "slots"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <CopyButton value={magicLink} />
                          </TableCell>
                          <TableCell>
                            <form action={deletePanelist.bind(null, p.id, program.id)}>
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
        </>
      )}
    </div>
  );
}

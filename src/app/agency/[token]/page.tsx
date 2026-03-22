import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AgencySubmitForm from "./AgencySubmitForm";
import AgencyBulkUpload from "./AgencyBulkUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default async function AgencyPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const agency = await prisma.agency.findUnique({
    where: { magicLinkToken: token },
    include: {
      program: { include: { rounds: { where: { deletedAt: null }, orderBy: { roundNumber: "asc" } } } },
      _count: { select: { candidates: true } },
    },
  });

  if (!agency || agency.program.deletedAt) notFound();

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">Agency Portal</p>
            <Badge variant="secondary" className="text-[11px]">
              {agency._count.candidates} submitted
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{agency.name}</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Submitting candidates for <span className="font-medium text-zinc-600">{agency.program.name}</span>
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-3">Program details</p>
            <div className="flex flex-wrap gap-2">
              {agency.program.rounds.map((r) => (
                <Badge key={r.id} variant="outline" className="text-xs">
                  Round {r.roundNumber}: {r.name}
                </Badge>
              ))}
              {agency.program.rounds.length === 0 && (
                <p className="text-sm text-zinc-400">No rounds configured yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="bg-amber-50 border border-amber-100 rounded-lg px-5 py-3.5 mb-6">
          <p className="text-sm text-amber-800 font-medium">How this works</p>
          <ul className="text-xs text-amber-700 mt-1.5 space-y-1 list-disc list-inside">
            <li>Submit candidates individually using the form, or upload a bulk Excel file.</li>
            <li>All submissions are reviewed by the hiring team before entering the pipeline.</li>
            <li>Duplicate emails within this program are automatically skipped.</li>
          </ul>
        </div>

        <Tabs defaultValue="individual">
          <TabsList className="mb-6">
            <TabsTrigger value="individual">Individual submission</TabsTrigger>
            <TabsTrigger value="bulk">Bulk upload</TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Submit a candidate</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <AgencySubmitForm token={token} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Bulk upload via Excel</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <AgencyBulkUpload token={token} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

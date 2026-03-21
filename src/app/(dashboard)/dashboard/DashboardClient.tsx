"use client";

import { useState, useMemo, JSX } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClipboardList, Layers, Users, CheckCircle2, Calendar, Plus, Search } from "lucide-react";

interface Program {
  id: number;
  name: string;
  description: string;
  organizationId: number;
  rounds: { id: number; name: string; description: string }[];
  createdAt: string;
}

interface Candidate {
  id: number;
  name: string;
  email: string;
  status: "In Progress" | "Completed" | "Eliminated";
  programId: number;
  createdAt: string;
}

export default function DashboardClient({
  programs,
  candidates,
}: {
  programs: Program[];
  candidates: Candidate[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredPrograms = useMemo(() => {
    if (!searchQuery.trim()) return programs;
    const query = searchQuery.toLowerCase();
    return programs.filter(
      (program) =>
        program.name.toLowerCase().includes(query) ||
        program.description.toLowerCase().includes(query)
    );
  }, [searchQuery, programs]);

  const totalCandidates = candidates.length;
  const inProgressCandidates = candidates.filter((c) => c.status === "In Progress").length;
  const completedCandidates = candidates.filter((c) => c.status === "Completed").length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold">Mock Dashboard</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Program
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Programs" value={programs.length} icon={<ClipboardList />} />
        <StatCard title="Total Candidates" value={totalCandidates} icon={<Users />} />
        <StatCard title="Active Interviews" value={inProgressCandidates} icon={<Calendar />} />
        <StatCard title="Completed" value={completedCandidates} icon={<CheckCircle2 />} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="programs">
        <TabsList className="mb-4">
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
        </TabsList>

        {/* Programs Tab */}
        <TabsContent value="programs">
          {/* Search & View Mode */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
              <Input
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              onClick={() => setViewMode("grid")}
            >
              <Layers className="h-4 w-4 mr-2" /> Grid
            </Button>
          </div>

          {/* Programs List */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredPrograms.map((program) => (
              <Card key={program.id}>
                <CardContent>
                  <h3 className="font-semibold text-lg">{program.name}</h3>
                  <p className="text-sm">{program.description}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {program.rounds.length} Rounds
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Candidates Tab */}
        <TabsContent value="candidates">
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Program</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="border-t">
                    <td className="p-3">{candidate.name}</td>
                    <td className="p-3">{candidate.email}</td>
                    <td className="p-3">{candidate.status}</td>
                    <td className="p-3">
                      {programs.find((p) => p.id === candidate.programId)?.name || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const StatCard = ({ title, value, icon }: { title: string; value: number; icon: JSX.Element }) => (
  <Card>
    <CardContent className="flex items-center gap-3 p-4">
      {icon}
      <div>
        <p className="text-sm">{title}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </CardContent>
  </Card>
);

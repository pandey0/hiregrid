import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addMemberByEmail, removeMember } from "@/actions/organization";
import GoogleConnectButton from "./GoogleConnectButton";
import { Clock, UserPlus } from "lucide-react";

export default async function TeamSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  });

  if (!membership) redirect("/onboarding");

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: membership.organizationId },
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  const pendingInvites = await prisma.organizationInvite.findMany({
    where: { organizationId: membership.organizationId, acceptedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const isAdmin = membership.role === "ADMIN";

  const currentUserAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "google" },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Team Management</h1>
        <p className="text-[15px] text-slate-500 mt-2 font-medium max-w-2xl leading-relaxed">
          Manage your team members and their roles within <span className="text-slate-900 font-bold">{membership.organization.name}</span>.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
          <section className="space-y-6">
            <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest px-1">Active Members</h2>
            <Card className="border-slate-200/60 bg-white rounded-[24px] shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10 px-6">Member</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10 px-6">Role</TableHead>
                    <TableHead className="h-10 px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => (
                    <TableRow key={m.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px] uppercase">
                            {m.user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-[14px] leading-tight">
                              {m.user.name} {m.userId === session.user.id && "(You)"}
                            </p>
                            <p className="text-[12px] text-slate-500 mt-0.5">{m.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] font-bold tracking-tight px-2 h-5 border-slate-200/50 border">
                          {m.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        {isAdmin && m.userId !== session.user.id && (
                          <form action={removeMember.bind(null, m.id)}>
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-semibold text-xs"
                            >
                              Remove
                            </Button>
                          </form>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </section>

          {pendingInvites.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest px-1">Pending Invitations</h2>
              <Card className="border-slate-200/60 bg-white rounded-[24px] shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10 px-6">Email</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10 px-6">Role</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10 px-6 text-right">Sent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvites.map((invite) => (
                      <TableRow key={invite.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 font-bold text-[10px] uppercase">
                              <Clock className="w-3.5 h-3.5" />
                            </div>
                            <p className="font-bold text-slate-900 text-[14px] leading-tight">{invite.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] font-bold tracking-tight px-2 h-5 border-slate-200/50 border">
                            {invite.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 text-right text-[12px] text-slate-400 font-medium">
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </section>
          )}
        </div>

        {isAdmin && (
          <div className="lg:col-span-4 space-y-10">
            <section className="space-y-6">
              <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest px-1">Integrations</h2>
              <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm rounded-[24px] shadow-sm overflow-hidden p-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-[14px] font-bold text-slate-900">Google Workspace</p>
                    <p className="text-[12px] text-slate-500 leading-relaxed">
                      Connect your Google account to enable AI-automated interview scheduling and calendar invites.
                    </p>
                  </div>
                  <GoogleConnectButton isConnected={!!currentUserAccount} />
                </div>
              </Card>
            </section>

            <section className="space-y-6">
              <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest px-1">Invite Member</h2>
              <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm rounded-[24px] shadow-sm overflow-hidden p-6">
                <form action={addMemberByEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[13px] font-bold text-slate-700 ml-1">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="colleague@company.com"
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-[14px] font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-[13px] font-bold text-slate-700 ml-1">Role</Label>
                    <Select name="role" defaultValue="MEMBER">
                      <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl shadow-slate-900/5">
                        <SelectItem value="ADMIN" className="rounded-lg my-0.5">Admin</SelectItem>
                        <SelectItem value="HR" className="rounded-lg my-0.5">HR</SelectItem>
                        <SelectItem value="MEMBER" className="rounded-lg my-0.5">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200/50 rounded-xl h-11 font-bold transition-all mt-2">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Send Invite
                  </Button>
                  <p className="text-[11px] text-slate-400 text-center px-2 mt-4 leading-relaxed font-medium">
                    If the user doesn't have an account, they will be invited to join your organization.
                  </p>
                </form>
              </Card>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

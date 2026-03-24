"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import GoogleConnectButton from "./GoogleConnectButton";
import { addMemberByEmail, removeMember } from "@/actions/organization";
import { Users, ShieldCheck, Mail, Globe, ArrowUpRight } from "lucide-react";

type Member = {
  id: number;
  role: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
};

type Invite = {
  id: number;
  email: string;
  role: string;
  createdAt: Date;
};

type TeamClientProps = {
  members: Member[];
  pendingInvites: Invite[];
  isAdmin: boolean;
  currentUserUserId: string;
  isConnected: boolean;
  organizationName: string;
};

export default function TeamClient({
  members,
  pendingInvites,
  isAdmin,
  currentUserUserId,
  isConnected,
  organizationName,
}: TeamClientProps) {
  return (
    <div className="page-container pb-20">
      {/* Background Decorative Element */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-app-accent/5 blur-[140px] rounded-full opacity-50 translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="mb-20">
        <header className="flex items-end justify-start gap-12 text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="arch-mono-label px-3 py-1">Organization Architecture</span>
              <span className="text-[10px] font-mono font-bold text-app-text-sub uppercase tracking-widest">
                Resource Access Protocol
              </span>
            </div>
            <h1 className="text-7xl font-black text-app-text-main tracking-tighter leading-[0.85] mb-6">Team <span className="text-app-accent">Command</span>.</h1>
            <p className="text-xl font-medium text-app-text-sub leading-relaxed max-w-xl italic">
              Coordinating access and administrative roles within <span className="text-app-text-main font-black border-b-2 border-app-accent">{organizationName}</span>.
            </p>
          </motion.div>
        </header>
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-16">
          <section className="space-y-10">
            <div className="flex items-center gap-6">
              <h2 className="text-[13px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap text-left">
                Active Operators
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-app-border to-transparent" />
            </div>

            <div className="arch-card overflow-hidden bg-white dark:bg-app-card shadow-none">
              <Table>
                <TableHeader className="bg-app-mono-bg/5">
                  <TableRow className="hover:bg-transparent border-app-border h-16">
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-sub px-8">Operator // Identity</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-sub px-4 text-center">Role</TableHead>
                    <TableHead className="w-20 px-8 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m, idx) => (
                    <motion.tr 
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group transition-all duration-500 border-app-border h-24 hover:bg-app-accent/[0.02]"
                    >
                      <TableCell className="px-8 text-left">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-app-text-main text-app-bg flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-xl shadow-app-accent/5 transition-colors">
                            {m.user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-app-text-main text-[16px] tracking-tight leading-none uppercase">
                              {m.user.name} {m.userId === currentUserUserId && <span className="text-app-accent ml-2">// YOU</span>}
                            </p>
                            <p className="font-mono text-[11px] font-bold text-app-text-sub mt-1.5 uppercase tracking-tighter">{m.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 text-center">
                        <span className={cn(
                          "arch-mono-label px-3 py-1 uppercase",
                          m.role === "ADMIN" ? "bg-app-text-main text-app-bg" : "bg-app-mono-bg/10 text-app-text-sub"
                        )}>
                          {m.role} //
                        </span>
                      </TableCell>
                      <TableCell className="px-8 text-right">
                        {isAdmin && m.userId !== currentUserUserId && (
                          <form action={removeMember.bind(null, m.id)}>
                            <button
                              type="submit"
                              className="text-[10px] font-black text-rose-600/40 hover:text-rose-600 uppercase tracking-widest transition-colors"
                            >
                              REVOKE ACCESS //
                            </button>
                          </form>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          {pendingInvites.length > 0 && (
            <section className="space-y-10">
              <div className="flex items-center gap-6">
                <h2 className="text-[13px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap text-left">
                  Pending Deployments
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-app-border to-transparent" />
              </div>

              <div className="arch-card overflow-hidden bg-white dark:bg-app-card shadow-none">
                <Table>
                  <TableHeader className="bg-app-mono-bg/5">
                    <TableRow className="hover:bg-transparent border-app-border h-16">
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-sub px-8">Email // Target</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-sub px-4 text-center">Role</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-sub px-8 text-right">Initialized</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvites.map((invite, idx) => (
                      <motion.tr 
                        key={invite.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group transition-all duration-500 border-app-border h-20 hover:bg-app-accent/[0.02]"
                      >
                        <TableCell className="px-8 text-left">
                          <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/20 animate-pulse" />
                            <p className="font-black text-app-text-main text-[15px] tracking-tight uppercase italic">{invite.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 text-center">
                          <span className="arch-mono-label px-3 py-1 bg-app-mono-bg/10 text-app-text-sub">
                            {invite.role} //
                          </span>
                        </TableCell>
                        <TableCell className="px-8 text-right">
                          <span className="font-mono text-[11px] font-black text-app-text-sub/40 uppercase">
                            {new Date(invite.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                          </span>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-4 space-y-16">
          {isAdmin && (
            <>
              <section className="space-y-10">
                <div className="flex items-center gap-6">
                  <h2 className="text-[13px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap text-left">
                    Integrations
                  </h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-app-border to-transparent" />
                </div>
                <div className="arch-card p-10 bg-white dark:bg-app-card space-y-8 text-left">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-app-accent/10 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-app-accent" />
                      </div>
                      <p className="text-xl font-black text-app-text-main tracking-tighter uppercase">Google Workspace</p>
                    </div>
                    <p className="text-[15px] text-app-text-sub font-medium leading-relaxed italic">
                      Connect your network to enable AI-automated scheduling and calendar synchronization.
                    </p>
                  </div>
                  <GoogleConnectButton isConnected={isConnected} />
                </div>
              </section>

              <section className="space-y-10">
                <div className="flex items-center gap-6">
                  <h2 className="text-[13px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap text-left">
                    Deploy Invitation
                  </h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-app-border to-transparent" />
                </div>
                <div className="arch-card p-10 bg-white dark:bg-app-card text-left">
                  <form action={addMemberByEmail} className="space-y-10">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-mono text-[10px] font-black text-app-text-sub uppercase tracking-widest ml-1">Network Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="OPERATOR@COMPANY.COM"
                        className="h-12 rounded-2xl border-app-border bg-app-mono-bg/5 focus:bg-white transition-all font-black uppercase tracking-widest text-[11px] placeholder:text-app-text-sub/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="font-mono text-[10px] font-black text-app-text-sub uppercase tracking-widest ml-1">Access Role</Label>
                      <Select name="role" defaultValue="MEMBER">
                        <SelectTrigger className="h-12 rounded-2xl border-app-border bg-app-mono-bg/5 font-black uppercase tracking-widest text-[11px] text-app-text-main">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-app-border bg-app-card shadow-2xl">
                          <SelectItem value="ADMIN" className="py-3 px-4 font-bold text-[12px] uppercase tracking-wider">Admin // Full Access</SelectItem>
                          <SelectItem value="MEMBER" className="py-3 px-4 font-bold text-[12px] uppercase tracking-wider">Staff // Limited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pt-4">
                      <Button type="submit" className="w-full h-16 bg-app-text-main text-app-bg hover:bg-app-accent font-black uppercase tracking-widest text-[12px] shadow-2xl shadow-app-accent/10 rounded-2xl transition-all active:scale-95 border-none">
                        DISPATCH INVITE //
                      </Button>
                    </div>
                    <p className="text-[11px] text-app-text-sub text-center font-black uppercase tracking-tighter leading-relaxed opacity-40 italic">
                      Organization onboarding will initialize upon sign-up protocol.
                    </p>
                  </form>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

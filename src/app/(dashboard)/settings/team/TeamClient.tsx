"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="w-full px-8 lg:px-16 py-12 relative">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="font-mono text-[11px] font-bold text-blue-600 uppercase tracking-[0.3em] mb-3 block">
              Organization Architecture //
            </span>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Team Management</h1>
            <p className="text-[16px] text-slate-500 mt-4 font-medium max-w-2xl leading-relaxed">
              Coordinating access and administrative roles within <span className="text-slate-900 font-bold underline decoration-slate-200 decoration-2 underline-offset-4">{organizationName}</span>.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            <section className="space-y-10">
              <div className="flex items-center gap-6">
                <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-[0.4em] whitespace-nowrap">
                  Active Operators
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 to-transparent" />
              </div>

              <div className="rounded-[40px] border border-slate-100 bg-white overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50/30">
                    <TableRow className="hover:bg-transparent border-slate-100 h-16">
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-8">Operator // Identity</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4">Role</TableHead>
                      <TableHead className="w-20 px-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m, idx) => (
                      <motion.tr 
                        key={m.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group transition-all duration-500 border-slate-50 h-24 hover:bg-slate-50/30"
                      >
                        <TableCell className="px-8">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-lg shadow-slate-100">
                              {m.user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-[16px] tracking-tight leading-none">
                                {m.user.name} {m.userId === currentUserUserId && "// YOU"}
                              </p>
                              <p className="font-mono text-[11px] font-bold text-slate-400 mt-1.5 uppercase tracking-tighter">{m.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          <span className={cn(
                            "font-mono text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-widest",
                            m.role === "ADMIN" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
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
                  <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-[0.4em] whitespace-nowrap">
                    Pending Deployments
                  </h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 to-transparent" />
                </div>

                <div className="rounded-[40px] border border-slate-100 bg-white overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50/30">
                      <TableRow className="hover:bg-transparent border-slate-100 h-16">
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-8">Email // Target</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4">Role</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-8 text-right">Initialized</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingInvites.map((invite, idx) => (
                        <motion.tr 
                          key={invite.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group transition-all duration-500 border-slate-50 h-20 hover:bg-slate-50/30"
                        >
                          <TableCell className="px-8">
                            <div className="flex items-center gap-4">
                              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                              <p className="font-bold text-slate-900 text-[15px] tracking-tight">{invite.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4">
                            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {invite.role} //
                            </span>
                          </TableCell>
                          <TableCell className="px-8 text-right">
                            <span className="font-mono text-[11px] font-bold text-slate-300 uppercase">
                              {new Date(invite.createdAt).toLocaleDateString().toUpperCase()}
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
                <section className="space-y-8">
                  <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-[0.4em] px-1">
                    Integrations //
                  </h2>
                  <div className="p-10 rounded-[40px] bg-white border border-slate-100 shadow-sm space-y-8">
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-slate-900 tracking-tight">Google Workspace</p>
                      <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                        Connect your network to enable AI-automated scheduling and calendar synchronization.
                      </p>
                    </div>
                    <GoogleConnectButton isConnected={isConnected} />
                  </div>
                </section>

                <section className="space-y-8">
                  <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-[0.4em] px-1">
                    Deploy Invitation //
                  </h2>
                  <div className="p-10 rounded-[40px] bg-white border border-slate-100 shadow-sm">
                    <form action={addMemberByEmail} className="space-y-8">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Network Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="OPERATOR@COMPANY.COM"
                          className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold uppercase tracking-widest"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Access Role</Label>
                        <Select name="role" defaultValue="MEMBER">
                          <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                            <SelectItem value="ADMIN" className="py-3 px-4 font-bold text-[12px] uppercase tracking-wider">Admin // Full Access</SelectItem>
                            <SelectItem value="MEMBER" className="py-3 px-4 font-bold text-[12px] uppercase tracking-wider">Staff // Limited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="pt-4">
                        <Button type="submit" className="w-full h-14 bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-slate-200 rounded-2xl transition-all active:scale-95">
                          DISPATCH INVITE //
                        </Button>
                      </div>
                      <p className="text-[11px] text-slate-400 text-center font-bold uppercase tracking-tighter leading-relaxed">
                        Automatic organization onboarding will initialize upon sign-up.
                      </p>
                    </form>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

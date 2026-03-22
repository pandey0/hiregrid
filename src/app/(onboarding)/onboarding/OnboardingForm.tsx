"use client";

import { useFormStatus } from "react-dom";
import { createOrganization } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Building2, ChevronRight, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className="w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200/50 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50"
    >
      {pending ? "Setting up workspace..." : "Create Workspace"}
      {!pending && <ChevronRight className="w-4 h-4 ml-2" />}
    </Button>
  );
}

export default function OnboardingForm({ userName }: { userName: string }) {
  const firstName = userName.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 mb-6">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome, {firstName}
          </h1>
          <p className="text-[15px] text-slate-500 mt-2 font-medium leading-relaxed">
            Let's set up your hiring workspace to get started.
          </p>
        </div>

        <Card className="border-slate-200/60 bg-white shadow-xl shadow-slate-200/40 rounded-[32px] overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <form action={createOrganization} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <Label htmlFor="name" className="text-[13px] font-bold text-slate-700">Organization Name</Label>
                    <Building2 className="w-4 h-4 text-slate-300" />
                  </div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoFocus
                    placeholder="Acme Recruiting"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-[15px] font-medium placeholder:text-slate-400"
                  />
                  <p className="text-[11px] text-slate-400 px-1 font-medium leading-relaxed">
                    This is your workspace identity. You can change this later in settings.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50 flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-blue-900">Workspace Ready</p>
                    <p className="text-[12px] text-blue-700/70 font-medium leading-tight mt-0.5">
                      Your dashboard and program controls will be configured immediately.
                    </p>
                  </div>
                </div>
              </div>

              <SubmitButton />
            </form>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-[13px] text-slate-400 font-medium">
          Need help? <a href="#" className="text-slate-600 hover:text-blue-600 underline underline-offset-4 decoration-slate-200">Contact our support team</a>
        </p>
      </div>
    </div>
  );
}

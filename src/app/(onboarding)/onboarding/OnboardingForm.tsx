"use client";

import { useFormStatus } from "react-dom";
import { createOrganization } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Setting up..." : "Continue"}
    </Button>
  );
}

export default function OnboardingForm({ userName }: { userName: string }) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Welcome, {userName.split(" ")[0]}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Set up your organization to get started</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form action={createOrganization} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Organization name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoFocus
                  placeholder="Acme Corp"
                />
                <p className="text-[11px] text-zinc-400">
                  This is how your workspace will be identified.
                </p>
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

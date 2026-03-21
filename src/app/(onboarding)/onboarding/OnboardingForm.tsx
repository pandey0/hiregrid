"use client";

import { useFormStatus } from "react-dom";
import { createOrganization } from "@/actions/onboarding";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2 px-4 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Setting up..." : "Continue"}
    </button>
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

        <div className="bg-white border border-zinc-200 rounded-xl p-8">
          <form action={createOrganization} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-zinc-600 mb-1.5">
                Organization name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoFocus
                placeholder="Acme Corp"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500"
              />
              <p className="text-[11px] text-zinc-400 mt-1.5">
                This is how your workspace will be identified.
              </p>
            </div>
            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}

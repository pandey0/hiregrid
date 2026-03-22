"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { agencyBulkUpload, type AgencyBulkResult } from "@/actions/agencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AgencyBulkUpload({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AgencyBulkResult | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      try {
        const res = await agencyBulkUpload(token, fd);
        setResult(res);
        form.reset();
        if (res.created > 0) {
          toast.success(`${res.created} candidate${res.created !== 1 ? "s" : ""} submitted for review`);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-600">
            Download the template, fill it in with your candidates, and upload it here.
            All candidates will be submitted for review.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <a href="/api/template/candidates" download="candidates-template.xlsx">
            Download template
          </a>
        </Button>
      </div>

      <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-4">
        <p className="text-xs text-zinc-500 mb-2 font-medium">Required columns:</p>
        <div className="flex flex-wrap gap-1.5">
          {["name", "email", "phone", "linkedin", "current_role", "current_company", "years_experience", "resume_url"].map((col) => (
            <Badge key={col} variant="secondary" className="text-[11px] font-mono">{col}</Badge>
          ))}
        </div>
        <p className="text-[11px] text-zinc-400 mt-2">
          Only <span className="font-medium">name</span> and <span className="font-medium">email</span> are required. Existing emails are skipped automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="agency-bulk-file">Excel or CSV file</Label>
          <Input
            id="agency-bulk-file"
            name="file"
            type="file"
            accept=".xlsx,.xls,.csv"
            required
            className="cursor-pointer"
          />
        </div>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Uploading..." : "Upload and submit candidates"}
        </Button>
      </form>

      {result && (
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm flex-wrap">
            <Badge variant="default">{result.created} submitted</Badge>
            {result.skipped > 0 && <Badge variant="secondary">{result.skipped} skipped (already exists)</Badge>}
            {result.errors.length > 0 && <Badge variant="destructive">{result.errors.length} errors</Badge>}
          </div>
          {result.errors.length > 0 && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription>
                <ul className="text-xs space-y-0.5">
                  {result.errors.map((e) => (
                    <li key={e.row}>Row {e.row}: {e.reason}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}

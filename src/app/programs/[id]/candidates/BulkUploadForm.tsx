"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { bulkUploadCandidates, type BulkUploadResult } from "@/actions/candidates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function BulkUploadForm({ programId }: { programId: number }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("programId", String(programId));
    const form = e.currentTarget;

    startTransition(async () => {
      try {
        const res = await bulkUploadCandidates(fd);
        setResult(res);
        form.reset();
        if (res.created > 0) {
          toast.success(`${res.created} candidate${res.created !== 1 ? "s" : ""} imported`);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      }
    });
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Bulk upload via Excel
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-900">Bulk upload candidates</p>
          <p className="text-xs text-zinc-400 mt-0.5">Upload an Excel or CSV file with candidate details</p>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-xs text-zinc-400">
          <a href="/api/template/candidates" download="candidates-template.xlsx">
            Download template
          </a>
        </Button>
      </div>

      <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-4">
        <p className="text-xs text-zinc-500 mb-2 font-medium">Required columns:</p>
        <div className="flex flex-wrap gap-1.5">
          {["name", "email", "phone", "linkedin", "current_role", "current_company", "years_experience"].map((col) => (
            <Badge key={col} variant="secondary" className="text-[11px] font-mono">{col}</Badge>
          ))}
        </div>
        <p className="text-[11px] text-zinc-400 mt-2">Only <span className="font-medium">name</span> and <span className="font-medium">email</span> are required. Duplicates are skipped.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="bulk-file">Excel or CSV file</Label>
          <Input
            id="bulk-file"
            name="file"
            type="file"
            accept=".xlsx,.xls,.csv"
            required
            className="cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={() => { setOpen(false); setResult(null); }} className="text-zinc-400">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Uploading..." : "Import candidates"}
          </Button>
        </div>
      </form>

      {result && (
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <Badge variant="default">{result.created} created</Badge>
            {result.skipped > 0 && <Badge variant="secondary">{result.skipped} skipped</Badge>}
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

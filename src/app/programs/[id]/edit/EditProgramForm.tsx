"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProgram } from "@/actions/programs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, ChevronRight, Save } from "lucide-react";

type Program = {
  id: number;
  name: string;
  description: string | null;
};

export default function EditProgramForm({ program }: { program: Program }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const name = (fd.get("name") as string).trim();
    if (!name) {
      toast.error("Program name is required");
      return;
    }

    startTransition(async () => {
      try {
        await updateProgram(program.id, fd);
        toast.success("Program updated successfully");
        router.push(`/programs/${program.id}`);
        router.refresh();
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Failed to update program");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Program Details Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest">Program Details</h2>
        </div>
        
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm rounded-[24px] shadow-sm overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prog-name" className="text-[13px] font-bold text-slate-700 ml-1">Program Name</Label>
              <Input
                id="prog-name"
                name="name"
                defaultValue={program.name}
                required
                placeholder="e.g. Senior Frontend Engineer Hiring Drive"
                className="h-12 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-[15px] font-medium placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prog-desc" className="text-[13px] font-bold text-slate-700 ml-1">Description (Optional)</Label>
              <Textarea
                id="prog-desc"
                name="description"
                defaultValue={program.description || ""}
                rows={5}
                placeholder="Outline the goals and context for this hiring program..."
                className="resize-none rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-[15px] font-medium placeholder:text-slate-400 p-4"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Info Card about Rounds */}
      <Card className="border-blue-100 bg-blue-50/30 rounded-[24px]">
        <CardContent className="p-6 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <ChevronRight className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-blue-900">Editing Rounds</h4>
            <p className="text-[13px] text-blue-700/80 mt-1 leading-relaxed">
              To modify the interview structure, duration, or focus areas, click into the specific round from the program dashboard. This prevents accidental disruption of existing panelist availability.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-8 border-t border-slate-200/60">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => router.back()} 
          className="text-[14px] font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl h-11 px-6"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200/50 rounded-xl h-11 px-8 font-bold transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? "Updating..." : "Save Changes"}
          <Save className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}

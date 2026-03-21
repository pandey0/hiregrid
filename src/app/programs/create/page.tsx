import CreateProgramForm from "./CreateProgramForm";
import Link from "next/link";

export default function CreateProgramPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Link href="/dashboard" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 mt-3">Create program</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Set up a hiring program with rounds. Add panelists and candidates after.
        </p>
      </div>
      <CreateProgramForm />
    </div>
  );
}

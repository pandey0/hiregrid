import CreateProgramForm from "./CreateProgramForm";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function CreateProgramPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-12">
      <div className="mb-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="text-slate-400 hover:text-slate-900 font-medium transition-colors">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-slate-900 font-bold">New Program</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Program</h1>
        <p className="text-[15px] text-slate-500 mt-2 font-medium max-w-2xl leading-relaxed">
          Set up a structured hiring process with custom rounds, automated screening, and panelist assignments.
        </p>
      </div>
      
      <CreateProgramForm />
    </div>
  );
}

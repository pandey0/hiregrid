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
    <div className="page-container pb-20">
      {/* Background Decorative Element */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-app-accent/5 blur-[140px] rounded-full opacity-50 translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="mb-20">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="text-[11px] font-mono font-bold uppercase tracking-widest text-app-text-sub hover:text-app-accent transition-colors">
                  Dashboard //
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-app-border" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[11px] font-mono font-bold uppercase tracking-widest text-app-text-main">
                System Architecture
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex items-end justify-start gap-12 text-left">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="arch-mono-label px-3 py-1">Provisioning Protocol</span>
              <span className="text-[10px] font-mono font-bold text-app-text-sub uppercase tracking-widest">
                New Sequence Flow
              </span>
            </div>
            <h1 className="text-7xl font-black text-app-text-main tracking-tighter leading-[0.85] mb-6">Deploy <span className="text-app-accent">Program</span>.</h1>
            <p className="text-xl font-medium text-app-text-sub leading-relaxed max-w-xl italic">
              Set up a structured hiring process with custom rounds, resource logic, and specialist assignments.
            </p>
          </div>
        </header>
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8">
          <CreateProgramForm />
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-32">
            <div className="arch-card bg-app-text-main text-app-bg p-10 relative overflow-hidden shadow-2xl transition-colors duration-500 text-left">
              <div className="absolute top-0 right-0 w-48 h-48 bg-app-accent/20 blur-[80px] -mr-24 -mt-24" />
              <div className="relative z-10">
                <span className="font-mono text-[10px] font-black text-app-accent uppercase tracking-[0.4em] block mb-6">Execution Strategy //</span>
                <h3 className="text-2xl font-black tracking-tight mb-4 leading-tight uppercase">Architectural Guidelines</h3>
                <p className="text-app-bg/60 text-[15px] font-medium leading-relaxed mb-10 italic">
                  Define the sequence of engagement. Each stage creates a unique logistics path for candidates and panelists.
                </p>
                <div className="space-y-6">
                  {[
                    { label: "Temporal Constraints", desc: "Define durations for time-snapping" },
                    { label: "Resource Linking", desc: "Attach assignments to offline stages" },
                    { label: "AI Fulfillment", desc: "Automated calendar dispatch" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-1.5 h-6 bg-app-accent rounded-full shrink-0" />
                      <div>
                        <p className="text-[13px] font-bold text-app-bg uppercase tracking-widest">{item.label}</p>
                        <p className="text-[10px] font-mono text-app-bg/40 mt-1 uppercase">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

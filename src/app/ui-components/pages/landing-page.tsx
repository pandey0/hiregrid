import Link from "next/link";

const features = [
  {
    title: "Multi-round programs",
    description: "Define structured hiring pipelines with any number of custom rounds — screening, technical, culture fit.",
  },
  {
    title: "Panelist scheduling",
    description: "Panelists receive a private link to submit their availability. No account required.",
  },
  {
    title: "AI resume scoring",
    description: "Automatically score uploaded resumes against your criteria so you can shortlist in seconds.",
  },
  {
    title: "Candidate self-booking",
    description: "Shortlisted candidates pick from available panelist slots. No email tag required.",
  },
  {
    title: "Control Tower",
    description: "See supply vs. demand for every round at a glance. Spot gaps before they become blockers.",
  },
  {
    title: "Zero friction",
    description: "Headless flows for panelists and candidates — they never need to create an account.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight">HireGrid</span>
          <nav className="flex items-center gap-6">
            <Link href="/sign-in" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-medium px-4 py-1.5 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="max-w-5xl mx-auto px-6 pt-24 pb-20">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-5">
              Hiring supply chain platform
            </p>
            <h1 className="text-5xl font-semibold tracking-tight leading-tight text-zinc-900 mb-6">
              Balance panelist time
              <br />
              against candidate demand.
            </h1>
            <p className="text-lg text-zinc-500 leading-relaxed mb-8">
              HireGrid coordinates multi-round hiring programs — scheduling panelists, AI-scoring resumes, and letting candidates self-book — all from a single control tower.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/sign-up"
                className="inline-flex items-center px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors"
              >
                Start free
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center px-5 py-2.5 text-zinc-600 text-sm font-medium border border-zinc-200 rounded-md hover:border-zinc-300 hover:text-zinc-900 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-100 bg-zinc-50">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-10">
              What&apos;s included
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f) => (
                <div key={f.title}>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="border border-zinc-200 rounded-xl px-10 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
                Ready to simplify your hiring?
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Create an account and set up your first program in minutes.
              </p>
            </div>
            <Link
              href="/sign-up"
              className="flex-shrink-0 inline-flex items-center px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors"
            >
              Get started
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-100">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center">
          <p className="text-xs text-zinc-400">HireGrid</p>
        </div>
      </footer>
    </div>
  );
}

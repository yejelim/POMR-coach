import Link from "next/link";
import { FilePlus2, Search } from "lucide-react";
import { listCases } from "@/server/services/case-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const cases = await listCases(q);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Local-first clerkship workspace</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950">POMR Coach</h1>
          </div>
          <Button asChild>
            <Link href="/cases/new">
              <FilePlus2 className="h-4 w-4" />
              New case
            </Link>
          </Button>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-6">
        <form className="mb-5 flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input name="q" defaultValue={q} className="pl-9" placeholder="Search title, department, summary, tags" />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
        <div className="grid gap-3">
          {cases.map((caseRecord) => (
            <Link
              key={caseRecord.id}
              href={`/cases/${caseRecord.id}`}
              className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-950">{caseRecord.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{caseRecord.summary || "No summary yet."}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <StatusBadge status={caseRecord.status} />
                  <Badge>{caseRecord.department}</Badge>
                </div>
              </div>
              {caseRecord.tags.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {caseRecord.tags.map((tag) => (
                    <Badge key={tag.id}>{tag.name}</Badge>
                  ))}
                </div>
              ) : null}
              <p className="mt-3 text-xs text-slate-500">
                Updated {caseRecord.updatedAt.toLocaleString()}
              </p>
            </Link>
          ))}
          {!cases.length ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm text-slate-600">No cases yet. Create an anonymous case label to start.</p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

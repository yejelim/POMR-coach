import Link from "next/link";
import { FilePlus2, Search } from "lucide-react";
import { listCasesForOwner } from "@/server/services/case-service";
import { AppLogo } from "@/components/shared/app-logo";
import { AuthStatus } from "@/components/shared/auth-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { SafetyNote } from "@/components/shared/safety-note";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const user = await requireCurrentUser();
  const cases = await listCasesForOwner(q, ownerIdForQuery(user));

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-end md:justify-between">
          <div>
            <AppLogo size="lg" />
            <h1 className="mt-5 text-3xl font-semibold tracking-normal text-slate-950">
              Case Library
            </h1>
            <div className="mt-2">
              <SafetyNote />
            </div>
          </div>
          <div className="flex flex-col gap-3 md:w-56">
            <AuthStatus email={user.email} isLocalFallback={user.isLocalFallback} />
            <ThemeSwitcher />
            <Button asChild>
              <Link href="/cases/new">
                <FilePlus2 className="h-4 w-4" />
                New case
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-6">
        <form className="mb-5 flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input name="q" defaultValue={q} className="pl-9" placeholder="제목, 과, 요약, 태그 검색" />
          </div>
          <Button type="submit" variant="secondary">검색</Button>
        </form>
        <div className="grid gap-3">
          {cases.map((caseRecord) => (
            <Link
              key={caseRecord.id}
              href={`/cases/${caseRecord.id}`}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 transition hover:border-teal-200 hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-950">{caseRecord.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{caseRecord.summary || "요약 없음"}</p>
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
                수정일 {caseRecord.updatedAt.toLocaleString()}
              </p>
            </Link>
          ))}
          {!cases.length ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm text-slate-600">
                아직 케이스가 없습니다. 익명 case label을 만들고, 한 환자의 이야기를 POMR
                workflow로 차근차근 정리해보세요.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { Archive, ClipboardList, FilePlus2, Search } from "lucide-react";
import { listCasesForOwner } from "@/server/services/case-service";
import { AiAssistToggle } from "@/components/shared/ai-assist-toggle";
import { AppLogo } from "@/components/shared/app-logo";
import { AuthStatus } from "@/components/shared/auth-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteCaseButton } from "@/components/shared/delete-case-button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { SafetyNote } from "@/components/shared/safety-note";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { TopActionGroup } from "@/components/shared/top-action-group";
import { UsageGuideLink } from "@/components/shared/usage-guide-link";
import { ReleaseUpdateDialog } from "@/components/shared/release-update-dialog";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const user = await requireCurrentUser();
  const cases = await listCasesForOwner(q, ownerIdForQuery(user));

  return (
    <main className="min-h-screen bg-app-bg">
      <ReleaseUpdateDialog />
      <header className="border-b border-app-border bg-app-surface">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <AppLogo size="md" />
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <TopActionGroup>
                <AuthStatus
                  email={user.email}
                  isLocalFallback={user.isLocalFallback}
                  isAnonymous={user.isAnonymous}
                  variant="compact"
                />
                <UsageGuideLink className="border-transparent bg-transparent shadow-none" />
                <AiAssistToggle />
                <ThemeSwitcher variant="compact" />
              </TopActionGroup>
            </div>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-normal text-app-text">
              Case Library
            </h1>
            <div className="mt-2">
              <SafetyNote />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href="/cases/new" prefetch={false}>
                <FilePlus2 className="h-4 w-4" />
                New case
              </Link>
            </Button>
          </div>
        </div>
        <ProductIntroBlock />
        <form className="mb-5 flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input name="q" defaultValue={q} className="pl-9" placeholder="제목, 과, 요약 검색" />
          </div>
          <Button type="submit" variant="secondary">검색</Button>
        </form>
        <div className="grid gap-3">
          {cases.map((caseRecord) => (
            <article
              key={caseRecord.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 transition hover:border-teal-200 hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/cases/${caseRecord.id}`}
                    prefetch={false}
                    className="block rounded-md outline-none transition hover:text-app-primary focus-visible:ring-2 focus-visible:ring-app-primary/25"
                  >
                    <h2 className="text-lg font-semibold text-slate-950">{caseRecord.title}</h2>
                  </Link>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{caseRecord.summary || "요약 없음"}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <StatusBadge status={caseRecord.status} />
                  <Badge>{caseRecord.department}</Badge>
                  <DeleteCaseButton caseId={caseRecord.id} title={caseRecord.title} />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                수정일 {formatDateTime(caseRecord.updatedAt)}
              </p>
            </article>
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

function ProductIntroBlock() {
  return (
    <section className="mb-5 rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm shadow-slate-200/40 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-app-text">
            POMR Coach는 아래 기능을 가진 무료 서비스입니다.
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <ValuePoint
              icon={<ClipboardList className="h-4 w-4" />}
              text="EHR을 보며 기록한 내용을 그대로 제출용 POMR로 문서화"
            />
            <ValuePoint
              icon={<Archive className="h-4 w-4" />}
              text="내가 공부한 모든 케이스를 아카이빙/검색/조회할 수 있는 폴리클 최적의 앱"
            />
          </div>
        </div>
        <p className="max-w-sm text-sm leading-6 text-app-text-muted lg:text-right">
          자세한 내용은 페이지 상단의 <span className="font-semibold text-app-text-secondary">사용법</span>을
          눌러 확인해주세요.
        </p>
      </div>
    </section>
  );
}

function ValuePoint({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-app-primary-soft bg-app-primary-muted px-3 py-2 text-sm font-medium text-app-text-secondary">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-app-surface text-app-primary shadow-sm shadow-app-primary/10">
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
}

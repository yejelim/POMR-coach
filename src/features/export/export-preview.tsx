"use client";

import { Printer } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function ExportPreview({ caseId }: { caseId: string }) {
  const [includeBranding, setIncludeBranding] = useState(true);
  const [includeFooter, setIncludeFooter] = useState(true);
  const [progressChronological, setProgressChronological] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);

  const previewUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (!includeBranding) params.set("branding", "0");
    if (!includeFooter) params.set("footer", "0");
    if (progressChronological) params.set("progressOrder", "chronological");

    const query = params.toString();
    return `/api/export/cases/${encodeURIComponent(caseId)}/pdf${query ? `?${query}` : ""}`;
  }, [caseId, includeBranding, includeFooter, progressChronological]);

  function printPreview() {
    const frameWindow = previewRef.current?.contentWindow;
    if (frameWindow) {
      frameWindow.focus();
      frameWindow.print();
      return;
    }

    window.open(previewUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      <div className="no-print rounded-xl border border-app-border bg-app-surface p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-app-text">PDF 설정</h3>
            <p className="mt-1 text-sm text-app-text-muted">
              제출용 문서에서는 POMR Coach 로고를 숨길 수 있습니다.
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-app-text-secondary sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeBranding}
                  onChange={(event) => setIncludeBranding(event.target.checked)}
                />
                POMR Coach 로고 넣기
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeFooter}
                  onChange={(event) => setIncludeFooter(event.target.checked)}
                />
                하단 문구 “AI 과의존을 예방하기 위한 POMR Coach로 직접 작성된 의무기록입니다.” 넣기
              </label>
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={progressChronological}
                    onChange={(event) => setProgressChronological(event.target.checked)}
                  />
                  Progress SOAP note 시간순으로 내보내기
                </label>
                <span className="pl-5 text-xs leading-5 text-app-text-muted">
                  기본 순서는 실제 EHR처럼 최신순입니다.
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={printPreview}>
              <Printer className="h-4 w-4" />
              Print / Save as PDF
            </Button>
          </div>
        </div>
      </div>
      <iframe
        ref={previewRef}
        title="Submission preview"
        src={previewUrl}
        className="h-[78vh] w-full rounded-xl border border-app-border bg-white"
      />
    </div>
  );
}

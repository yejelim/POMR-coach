"use client";

import { Download, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type HtmlVariants = {
  brandedFooter: string;
  branded: string;
  footer: string;
  plain: string;
};

export function ExportPreview({ caseId, html }: { caseId: string; html: HtmlVariants }) {
  const [includeBranding, setIncludeBranding] = useState(true);
  const [includeFooter, setIncludeFooter] = useState(true);

  const currentHtml = useMemo(() => {
    if (includeBranding && includeFooter) return html.brandedFooter;
    if (includeBranding) return html.branded;
    if (includeFooter) return html.footer;
    return html.plain;
  }, [html, includeBranding, includeFooter]);

  const pdfHref = `/api/export/cases/${caseId}/pdf?branding=${includeBranding ? "1" : "0"}&footer=${includeFooter ? "1" : "0"}`;

  function printPreview() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(currentHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div className="space-y-4">
      <div className="no-print rounded-xl border border-app-border bg-app-surface p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-app-text">PDF branding options</h3>
            <p className="mt-1 text-sm text-app-text-muted">
              제출용 문서에서는 POMR Coach branding을 숨길 수 있습니다.
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-app-text-secondary sm:flex-row sm:gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeBranding}
                  onChange={(event) => setIncludeBranding(event.target.checked)}
                />
                Include POMR Coach logo
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeFooter}
                  onChange={(event) => setIncludeFooter(event.target.checked)}
                />
                Include educational footer
              </label>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
        <Button asChild>
          <a href={pdfHref}>
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        </Button>
        <Button type="button" variant="secondary" onClick={printPreview}>
          <Printer className="h-4 w-4" />
          Browser print fallback
        </Button>
          </div>
        </div>
      </div>
      <iframe
        title="Submission preview"
        srcDoc={currentHtml}
        className="h-[78vh] w-full rounded-xl border border-app-border bg-white"
      />
    </div>
  );
}

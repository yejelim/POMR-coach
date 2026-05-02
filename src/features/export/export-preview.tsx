"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportPreview({ caseId, html }: { caseId: string; html: string }) {
  function printPreview() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap gap-2">
        <Button asChild>
          <a href={`/api/export/cases/${caseId}/pdf`}>
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        </Button>
        <Button type="button" variant="secondary" onClick={printPreview}>
          <Printer className="h-4 w-4" />
          Browser print fallback
        </Button>
      </div>
      <iframe
        title="Submission preview"
        srcDoc={html}
        className="h-[78vh] w-full rounded-lg border border-slate-200 bg-white"
      />
    </div>
  );
}

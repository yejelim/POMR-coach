"use client";

import { useState } from "react";
import { ImageAttachmentEditor } from "@/components/shared/image-attachment-editor";
import type { UploadedImage } from "@/lib/types";

export function DiagnosticImageSection({ images }: { images: UploadedImage[] }) {
  const [items, setItems] = useState(images);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
      <input type="hidden" name="imageAttachments" value={JSON.stringify(items)} />
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-950">Image attachments</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          PACS screenshot, endoscopy image, captured report image 등을 de-identified 상태로 첨부하세요.
        </p>
      </div>
      <ImageAttachmentEditor images={items} onChange={setItems} label="Upload diagnostic image" />
    </section>
  );
}

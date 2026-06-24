"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteProgressNoteAction } from "@/app/cases/actions";
import { Button } from "@/components/ui/button";

export function DeleteProgressNoteButton({
  caseId,
  noteId,
  label,
  redirectHref,
  compact = false,
}: {
  caseId: string;
  noteId: string;
  label: string;
  redirectHref?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `"${label}" progress note를 삭제하시겠습니까?\n\n삭제한 SOAP note는 복구할 수 없습니다.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      await deleteProgressNoteAction(caseId, noteId);
      if (redirectHref) {
        router.push(redirectHref);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <Button
      type="button"
      variant={compact ? "danger-outline" : "danger-ghost"}
      size="sm"
      className={compact ? "h-8 px-2.5" : undefined}
      onClick={handleDelete}
      disabled={pending}
      aria-label="Delete progress note"
      title="Delete progress note"
    >
      <Trash2 className="h-4 w-4" />
      {compact ? null : pending ? "Deleting..." : "삭제"}
    </Button>
  );
}

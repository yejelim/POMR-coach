"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteCaseAction } from "@/app/cases/actions";
import { Button } from "@/components/ui/button";

export function DeleteCaseButton({
  caseId,
  title,
  redirectHref,
  compact = false,
}: {
  caseId: string;
  title: string;
  redirectHref?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `"${title}" 케이스를 삭제하시겠습니까?\n\n삭제한 케이스는 복구할 수 없습니다.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      await deleteCaseAction(caseId);
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
      variant="danger-ghost"
      size="sm"
      className={compact ? "h-8 px-2.5" : undefined}
      onClick={handleDelete}
      disabled={pending}
      aria-label="Delete case"
      title="Delete case"
    >
      <Trash2 className="h-4 w-4" />
      {compact ? null : pending ? "Deleting..." : "삭제"}
    </Button>
  );
}

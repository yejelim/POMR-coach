"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteCaseAction } from "@/app/cases/actions";
import { Button } from "@/components/ui/button";

export function DeleteCaseButton({
  caseId,
  title,
}: {
  caseId: string;
  title: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `"${title}" 케이스를 삭제할까요?\n\n삭제한 케이스는 복구할 수 없습니다.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      await deleteCaseAction(caseId);
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-app-danger hover:bg-red-50 hover:text-app-danger"
      onClick={handleDelete}
      disabled={pending}
    >
      <Trash2 className="h-4 w-4" />
      {pending ? "Deleting..." : "삭제"}
    </Button>
  );
}

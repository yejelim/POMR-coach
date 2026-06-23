"use client";

import { Bold, Highlighter } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function PhysicalExamEditor({
  defaultValue,
}: {
  defaultValue: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState(defaultValue);

  function wrapSelection(before: string, after: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const fallback = before === "**" ? "강조할 finding" : "하이라이트할 finding";
    const nextSelected = selected || fallback;
    const nextValue = `${value.slice(0, start)}${before}${nextSelected}${after}${value.slice(end)}`;
    const nextCursorStart = start + before.length;
    const nextCursorEnd = nextCursorStart + nextSelected.length;

    setValue(nextValue);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursorStart, nextCursorEnd);
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-white"
          onClick={() => wrapSelection("**", "**")}
          title="선택한 PE finding을 굵게 표시"
        >
          <Bold className="h-4 w-4" />
          Bold
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-white"
          onClick={() => wrapSelection("==", "==")}
          title="선택한 PE finding을 하이라이트"
        >
          <Highlighter className="h-4 w-4" />
          Highlight
        </Button>
        <span className="text-xs text-app-text-muted">
          PDF export에서 **bold**, ==highlight==가 반영됩니다.
        </span>
      </div>
      <Textarea
        ref={textareaRef}
        name="physicalExam"
        value={value}
        rows={14}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  );
}


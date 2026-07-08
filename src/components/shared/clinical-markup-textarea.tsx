"use client";

import { Highlighter } from "lucide-react";
import type { TextareaHTMLAttributes } from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ClinicalMarkupTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
};

export function ClinicalMarkupTextarea({
  value,
  onChange,
  helperText,
  ...textareaProps
}: ClinicalMarkupTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function highlightSelection() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const before = "==";
    const after = "==";
    const fallback = "하이라이트할 finding";
    const nextSelected = selected || fallback;
    const nextValue = `${value.slice(0, start)}${before}${nextSelected}${after}${value.slice(end)}`;
    const nextCursorStart = start + before.length;
    const nextCursorEnd = nextCursorStart + nextSelected.length;

    onChange(nextValue);
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
          className="h-8 bg-white px-2.5"
          onClick={highlightSelection}
          title="선택한 텍스트를 하이라이트"
        >
          <Highlighter className="h-4 w-4" />
          Highlight
        </Button>
        {helperText ? <span className="text-xs text-app-text-muted">{helperText}</span> : null}
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...textareaProps}
      />
    </div>
  );
}

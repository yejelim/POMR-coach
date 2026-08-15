"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { ClinicalField } from "@/components/shared/clinical-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RosTemplateGroup } from "@/config/templates/ros";
import { cn } from "@/lib/utils";

type RosItemState = {
  positive: boolean;
  comment: string;
};

type ParsedRos = {
  items: Record<string, RosItemState>;
  categoryNotes: Record<string, string>;
  legacyAdditionalNotes: string;
};

export function RosChecklistEditor({
  groups,
  defaultValue = "",
}: {
  groups: RosTemplateGroup[];
  defaultValue?: string;
}) {
  const initial = useMemo(() => parseRos(defaultValue, groups), [defaultValue, groups]);
  const [items, setItems] = useState(initial.items);
  const [categoryNotes, setCategoryNotes] = useState(initial.categoryNotes);
  const [legacyAdditionalNotes, setLegacyAdditionalNotes] = useState(initial.legacyAdditionalNotes);
  const [showKorean, setShowKorean] = useState(false);
  const serialized = serializeRos(groups, items, categoryNotes, legacyAdditionalNotes);

  function updateItem(key: string, patch: Partial<RosItemState>) {
    setItems((current) => {
      const previous = current[key] ?? { positive: false, comment: "" };
      return {
        ...current,
        [key]: { ...previous, ...patch },
      };
    });
  }

  function updateCategoryNotes(category: string, value: string) {
    setCategoryNotes((current) => ({ ...current, [category]: value }));
  }

  return (
    <section className="space-y-4">
      <textarea name="ros" value={serialized} readOnly className="hidden" aria-hidden="true" />
      <div className="flex flex-col gap-3 rounded-lg border border-app-border bg-app-surface-muted/45 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-app-text-muted">
          General=전신, HEENT=Head/Eyes/Ears/Nose/Throat, GI=소화기, GU=비뇨생식기입니다.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 shrink-0 bg-app-surface"
          onClick={() => setShowKorean((current) => !current)}
        >
          {showKorean ? "영어로 보기" : "한국어로 보기"}
        </Button>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {groups.map((group) => (
          <div key={group.category} className="rounded-lg border border-app-border bg-app-surface-muted/45 p-2.5">
            <div className="mb-2 px-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-faint">
                {showKorean ? `${group.koreanCategory} · ${group.category}` : `${group.category} · ${group.koreanCategory}`}
              </div>
              <p className="mt-0.5 text-[11px] leading-4 text-app-text-muted">{group.description}</p>
            </div>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const key = rosKey(group.category, item.label);
                const state = items[key] ?? { positive: false, comment: "" };
                return (
                  <div
                    key={key}
                    className={cn(
                      "rounded-lg px-2 py-1.5 transition",
                      state.positive
                        ? "border border-app-primary-soft bg-app-primary-muted"
                        : "border border-transparent bg-app-surface",
                    )}
                  >
                    <div className="flex min-w-0 items-start gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant={state.positive ? "default" : "outline"}
                        className="h-6 w-7 shrink-0 px-0 text-xs"
                        onClick={() => updateItem(key, { positive: !state.positive })}
                        aria-pressed={state.positive}
                      >
                        {state.positive ? "+" : "-"}
                      </Button>
                      <span className="min-w-0 flex-1 text-xs leading-5 text-app-text-secondary">
                        {showKorean ? item.korean : item.label}
                      </span>
                    </div>
                    {state.positive ? (
                      <Input
                        value={state.comment}
                        placeholder="comment"
                        className="mt-1 h-7 w-full text-xs"
                        onChange={(event) => updateItem(key, { comment: event.target.value })}
                      />
                    ) : null}
                  </div>
                );
              })}
              <div className="mt-2 rounded-lg border border-dashed border-app-primary/30 bg-app-primary-muted/35 p-2">
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-app-primary">
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  체크리스트에 없는 항목 직접 추가
                </div>
                <Textarea
                  value={categoryNotes[group.category] ?? ""}
                  rows={2}
                  placeholder={`예: ${showKorean ? "실신 (+): 어제 1회" : "Syncope (+): once yesterday"}`}
                  className="min-h-14 resize-y bg-app-surface px-2.5 py-2 text-xs leading-5"
                  onChange={(event) => updateCategoryNotes(group.category, event.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {legacyAdditionalNotes ? (
        <ClinicalField label="기존 계통문진 자유 메모">
          <Textarea
            value={legacyAdditionalNotes}
            rows={3}
            onChange={(event) => setLegacyAdditionalNotes(event.target.value)}
          />
        </ClinicalField>
      ) : null}
    </section>
  );
}

function parseRos(defaultValue: string, groups: RosTemplateGroup[]): ParsedRos {
  const items = Object.fromEntries(
    groups.flatMap((group) =>
      group.items.map((item) => [rosKey(group.category, item.label), { positive: false, comment: "" }]),
    ),
  );
  const categoryNotes = Object.fromEntries(groups.map((group) => [group.category, ""]));

  const legacyAdditionalLines: string[] = [];
  let currentCategory = "";
  let sawStructuredLine = false;
  let inAdditionalNotes = false;

  for (const line of defaultValue.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const categoryMatch = trimmed.match(/^\[(.+)]$/);
    if (categoryMatch) {
      currentCategory = categoryMatch[1];
      inAdditionalNotes = currentCategory.toLowerCase() === "additional notes";
      sawStructuredLine = true;
      continue;
    }

    if (inAdditionalNotes) {
      legacyAdditionalLines.push(trimmed);
      continue;
    }

    const categoryNoteMatch = trimmed.match(/^- Additional notes: (.*)$/);
    if (categoryNoteMatch && currentCategory) {
      categoryNotes[currentCategory] = [
        categoryNotes[currentCategory],
        categoryNoteMatch[1] ?? "",
      ]
        .filter(Boolean)
        .join("\n");
      sawStructuredLine = true;
      continue;
    }

    const itemMatch = trimmed.match(/^- (.+?) \(([+-])\)(?:: (.*))?$/);
    if (itemMatch && currentCategory) {
      const [, item, sign, comment = ""] = itemMatch;
      const key = rosKey(currentCategory, item);
      if (key in items) {
        items[key] = { positive: sign === "+", comment };
        sawStructuredLine = true;
        continue;
      }
    }

    if (currentCategory && currentCategory in categoryNotes) {
      categoryNotes[currentCategory] = [categoryNotes[currentCategory], trimmed].filter(Boolean).join("\n");
    } else {
      legacyAdditionalLines.push(trimmed);
    }
  }

  return {
    items,
    categoryNotes,
    legacyAdditionalNotes: sawStructuredLine ? legacyAdditionalLines.join("\n") : defaultValue,
  };
}

function serializeRos(
  groups: RosTemplateGroup[],
  items: Record<string, RosItemState>,
  categoryNotes: Record<string, string>,
  legacyAdditionalNotes: string,
) {
  const lines = groups.flatMap((group) => {
    const note = categoryNotes[group.category]?.trim();
    return [
      `[${group.category}]`,
      ...group.items.map((item) => {
      const state = items[rosKey(group.category, item.label)] ?? { positive: false, comment: "" };
      const comment = state.positive && state.comment.trim() ? `: ${state.comment.trim()}` : "";
      return `- ${item.label} (${state.positive ? "+" : "-"})${comment}`;
    }),
      ...(note
        ? note
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => `- Additional notes: ${line}`)
        : []),
    ];
  });

  if (legacyAdditionalNotes.trim()) {
    lines.push("[Additional notes]", legacyAdditionalNotes.trim());
  }

  return lines.join("\n");
}

function rosKey(category: string, item: string) {
  return `${category}::${item}`;
}

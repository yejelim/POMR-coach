"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RosTemplateGroup } from "@/config/templates/ros";

type RosItemState = {
  positive: boolean;
  comment: string;
};

type ParsedRos = {
  items: Record<string, RosItemState>;
  additionalNotes: string;
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
  const [additionalNotes, setAdditionalNotes] = useState(initial.additionalNotes);
  const serialized = serializeRos(groups, items, additionalNotes);

  function updateItem(key: string, patch: Partial<RosItemState>) {
    setItems((current) => {
      const previous = current[key] ?? { positive: false, comment: "" };
      return {
        ...current,
        [key]: { ...previous, ...patch },
      };
    });
  }

  return (
    <section className="space-y-3 md:col-span-2">
      <textarea name="ros" value={serialized} readOnly className="hidden" aria-hidden="true" />
      <div>
        <h3 className="text-sm font-semibold text-slate-800">ROS checklist</h3>
        <p className="mt-1 text-xs leading-5 text-app-text-muted">
          Positive finding은 (+)로 바꾸고 필요한 경우 onset, NRS, duration 등을 짧게 메모하세요.
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {groups.map((group) => (
          <div key={group.category} className="rounded-lg border border-app-border bg-app-surface p-3">
            <div className="mb-2 text-sm font-semibold text-app-text">{group.category}</div>
            <div className="space-y-2">
              {group.items.map((item) => {
                const key = rosKey(group.category, item);
                const state = items[key] ?? { positive: false, comment: "" };
                return (
                  <div key={key} className="grid gap-2 rounded-md bg-app-surface-muted p-2 sm:grid-cols-[1fr_auto]">
                    <div className="flex min-w-0 items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={state.positive ? "default" : "outline"}
                        className="h-7 w-9 px-0"
                        onClick={() => updateItem(key, { positive: !state.positive })}
                        aria-pressed={state.positive}
                      >
                        {state.positive ? "+" : "-"}
                      </Button>
                      <span className="truncate text-sm text-app-text-secondary">{item}</span>
                    </div>
                    {state.positive ? (
                      <Input
                        value={state.comment}
                        placeholder="comment"
                        className="h-8 min-w-44 text-xs"
                        onChange={(event) => updateItem(key, { comment: event.target.value })}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Additional ROS notes</span>
        <Textarea
          value={additionalNotes}
          rows={3}
          placeholder="체크리스트에 없는 증상이나 자유 문진 내용을 추가하세요."
          onChange={(event) => setAdditionalNotes(event.target.value)}
        />
      </label>
    </section>
  );
}

function parseRos(defaultValue: string, groups: RosTemplateGroup[]): ParsedRos {
  const items = Object.fromEntries(
    groups.flatMap((group) =>
      group.items.map((item) => [rosKey(group.category, item), { positive: false, comment: "" }]),
    ),
  );

  const additionalLines: string[] = [];
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
      additionalLines.push(trimmed);
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

    additionalLines.push(trimmed);
  }

  return {
    items,
    additionalNotes: sawStructuredLine ? additionalLines.join("\n") : defaultValue,
  };
}

function serializeRos(
  groups: RosTemplateGroup[],
  items: Record<string, RosItemState>,
  additionalNotes: string,
) {
  const lines = groups.flatMap((group) => [
    `[${group.category}]`,
    ...group.items.map((item) => {
      const state = items[rosKey(group.category, item)] ?? { positive: false, comment: "" };
      const comment = state.positive && state.comment.trim() ? `: ${state.comment.trim()}` : "";
      return `- ${item} (${state.positive ? "+" : "-"})${comment}`;
    }),
  ]);

  if (additionalNotes.trim()) {
    lines.push("[Additional notes]", additionalNotes.trim());
  }

  return lines.join("\n");
}

function rosKey(category: string, item: string) {
  return `${category}::${item}`;
}

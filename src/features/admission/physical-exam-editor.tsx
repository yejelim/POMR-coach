"use client";

import { useState } from "react";
import { ClinicalMarkupTextarea } from "@/components/shared/clinical-markup-textarea";

export function PhysicalExamEditor({
  defaultValue,
}: {
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <ClinicalMarkupTextarea
      name="physicalExam"
      value={value}
      rows={14}
      onChange={setValue}
      helperText="PDF export에서 **bold**, ==highlight==가 반영됩니다."
    />
  );
}

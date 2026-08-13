"use client";

import { useMemo, useState } from "react";
import { ClinicalField } from "@/components/shared/clinical-form";
import { Input } from "@/components/ui/input";
import type { Vitals } from "@/lib/types";

const fields = [
  ["bt", "BT"],
  ["bp", "BP"],
  ["pr", "PR"],
  ["rr", "RR"],
  ["spo2", "SpO2"],
] as const;

export function VitalsEditor({
  values,
  showAnthropometrics = false,
}: {
  values?: Vitals | null;
  showAnthropometrics?: boolean;
}) {
  const [heightCm, setHeightCm] = useState(values?.heightCm ?? "");
  const [weightKg, setWeightKg] = useState(values?.weightKg ?? "");
  const bmi = useMemo(() => calculateBmi(heightCm, weightKg), [heightCm, weightKg]);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-5">
        {fields.map(([name, label]) => (
          <ClinicalField key={name} label={label}>
            <Input name={name} defaultValue={values?.[name] ?? ""} />
          </ClinicalField>
        ))}
      </div>
      {showAnthropometrics ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <ClinicalField label="Height (cm)">
            <Input
              name="heightCm"
              inputMode="decimal"
              value={heightCm}
              placeholder="예: 170"
              onChange={(event) => setHeightCm(event.target.value)}
            />
          </ClinicalField>
          <ClinicalField label="Weight (kg)">
            <Input
              name="weightKg"
              inputMode="decimal"
              value={weightKg}
              placeholder="예: 65"
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </ClinicalField>
          <ClinicalField label="BMI">
            <Input name="bmi" value={bmi} readOnly placeholder="자동 계산" />
          </ClinicalField>
        </div>
      ) : null}
    </div>
  );
}

function calculateBmi(heightCm: string, weightKg: string) {
  const height = Number.parseFloat(heightCm);
  const weight = Number.parseFloat(weightKg);
  if (!Number.isFinite(height) || !Number.isFinite(weight) || height <= 0 || weight <= 0) {
    return "";
  }
  const heightM = height / 100;
  return (weight / (heightM * heightM)).toFixed(1);
}

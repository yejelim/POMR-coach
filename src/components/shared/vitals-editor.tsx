"use client";

import { useMemo, useState } from "react";
import { ClinicalField } from "@/components/shared/clinical-form";
import { Input } from "@/components/ui/input";
import type { Vitals } from "@/lib/types";

const fields = [
  ["bt", "체온", "Body temperature / BT"],
  ["bp", "혈압", "Blood pressure / BP"],
  ["pr", "맥박", "Pulse rate / PR"],
  ["rr", "호흡수", "Respiratory rate / RR"],
  ["spo2", "산소포화도", "SpO2"],
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
        {fields.map(([name, label, hint]) => (
          <ClinicalField key={name} label={label} hint={hint}>
            <Input name={name} defaultValue={values?.[name] ?? ""} />
          </ClinicalField>
        ))}
      </div>
      {showAnthropometrics ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <ClinicalField label="키" hint="Height, cm">
            <Input
              name="heightCm"
              inputMode="decimal"
              value={heightCm}
              placeholder="예: 170"
              onChange={(event) => setHeightCm(event.target.value)}
            />
          </ClinicalField>
          <ClinicalField label="몸무게" hint="Weight, kg">
            <Input
              name="weightKg"
              inputMode="decimal"
              value={weightKg}
              placeholder="예: 65"
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </ClinicalField>
          <ClinicalField label="체질량지수" hint="BMI">
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

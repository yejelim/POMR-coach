"use client";

import { useMemo, useState } from "react";
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
          <label key={name} className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <Input name={name} defaultValue={values?.[name] ?? ""} />
          </label>
        ))}
      </div>
      {showAnthropometrics ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Height (cm)</span>
            <Input
              name="heightCm"
              inputMode="decimal"
              value={heightCm}
              placeholder="예: 170"
              onChange={(event) => setHeightCm(event.target.value)}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Weight (kg)</span>
            <Input
              name="weightKg"
              inputMode="decimal"
              value={weightKg}
              placeholder="예: 65"
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">BMI</span>
            <Input name="bmi" value={bmi} readOnly placeholder="자동 계산" />
          </label>
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

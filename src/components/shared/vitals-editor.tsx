import { Input } from "@/components/ui/input";
import type { Vitals } from "@/lib/types";

const fields = [
  ["bt", "BT"],
  ["bp", "BP"],
  ["pr", "PR"],
  ["rr", "RR"],
  ["spo2", "SpO2"],
] as const;

export function VitalsEditor({ values }: { values?: Vitals | null }) {
  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {fields.map(([name, label]) => (
        <label key={name} className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          <Input name={name} defaultValue={values?.[name] ?? ""} />
        </label>
      ))}
    </div>
  );
}

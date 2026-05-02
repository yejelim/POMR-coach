import { Textarea } from "@/components/ui/textarea";

export function SectionTextarea({
  label,
  name,
  defaultValue,
  rows = 5,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <Textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
      />
    </label>
  );
}

import { Textarea } from "@/components/ui/textarea";
import { ClinicalField } from "@/components/shared/clinical-form";

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
    <ClinicalField label={label}>
      <Textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
      />
    </ClinicalField>
  );
}

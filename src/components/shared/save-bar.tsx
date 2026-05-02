import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SaveBar({ label = "Save" }: { label?: string }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
      <Button type="submit">
        <Save className="h-4 w-4" />
        {label}
      </Button>
    </div>
  );
}

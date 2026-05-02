import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const isClosed = status === "closed" || status === "resolved";
  return (
    <Badge
      className={
        isClosed
          ? "border-slate-300 bg-slate-100 text-slate-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }
    >
      {status}
    </Badge>
  );
}

import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const isClosed = status === "closed" || status === "resolved";
  return (
    <Badge
      className={
        isClosed
          ? "border-app-border-strong bg-app-surface-soft text-app-text-secondary"
          : "border-app-primary-soft bg-app-primary-muted text-app-primary"
      }
    >
      {status}
    </Badge>
  );
}

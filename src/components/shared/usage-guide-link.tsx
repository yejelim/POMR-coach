import { BookOpenText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const USAGE_GUIDE_URL =
  "https://ambiguous-skateboard-371.notion.site/pomr-coach?source=copy_link";

export function UsageGuideLink({
  className,
  label = "사용법",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className={cn("h-8 shrink-0 px-2.5", className)}
    >
      <a href={USAGE_GUIDE_URL} target="_blank" rel="noreferrer">
        <BookOpenText className="h-4 w-4" />
        {label}
        <ExternalLink className="h-3.5 w-3.5 text-app-text-faint" />
      </a>
    </Button>
  );
}

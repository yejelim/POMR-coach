import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";

export function CaseHeader({
  title,
  department,
  status,
  tags,
}: {
  title: string;
  department: string;
  status: string;
  tags: string[];
}) {
  return (
    <header className="border-b border-slate-200 bg-white px-4 py-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-3">
        <Button asChild variant="ghost" size="sm" className="w-fit px-0">
          <Link href="/cases">
            <ArrowLeft className="h-4 w-4" />
            Cases
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-normal text-slate-950">{title}</h1>
          <StatusBadge status={status} />
          <Badge>{department}</Badge>
          {tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </div>
    </header>
  );
}

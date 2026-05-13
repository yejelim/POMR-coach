import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AppLogo({
  size = "md",
  showText = true,
  href = "/cases",
}: {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
}) {
  const imageSize = size === "lg" ? 44 : size === "sm" ? 28 : 36;

  return (
    <Link
      href={href}
      className="flex min-w-0 items-center gap-3 rounded-md outline-none transition hover:opacity-85 focus-visible:ring-2 focus-visible:ring-teal-700/25"
      aria-label="Go to POMR Coach home"
    >
      <Image
        src="/POMR_coach_logo.png"
        alt="POMR Coach logo"
        width={imageSize}
        height={imageSize}
        className={cn(
          "shrink-0 object-contain",
          size === "lg" ? "h-11 w-11" : size === "sm" ? "h-7 w-7" : "h-9 w-9",
        )}
        priority={size === "lg"}
      />
      {showText ? (
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-normal text-slate-950">
            POMR Coach
          </div>
          <div className="truncate text-xs text-slate-500">Write first. Reflect with AI.</div>
        </div>
      ) : null}
    </Link>
  );
}

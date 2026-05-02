import Image from "next/image";
import { cn } from "@/lib/utils";

export function AppLogo({
  size = "md",
  showText = true,
}: {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}) {
  const imageSize = size === "lg" ? 44 : size === "sm" ? 28 : 36;

  return (
    <div className="flex min-w-0 items-center gap-3">
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
    </div>
  );
}

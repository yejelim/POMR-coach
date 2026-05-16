"use client";

import { MonitorCog } from "lucide-react";
import { useEffect, useRef } from "react";
import { Select } from "@/components/ui/select";

const themes = [
  { value: "mint-clinical", label: "Mint Clinical" },
  { value: "warm-brown", label: "Warm Brown" },
  { value: "dark-slate", label: "Dark Slate" },
] as const;

type ThemeValue = (typeof themes)[number]["value"];

function isTheme(value: string | null): value is ThemeValue {
  return themes.some((theme) => theme.value === value);
}

export function ThemeSwitcher() {
  const selectRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("pomr-coach-theme");
    const nextTheme = isTheme(stored) ? stored : "mint-clinical";
    if (selectRef.current) selectRef.current.value = nextTheme;
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  function updateTheme(value: string) {
    const nextTheme = isTheme(value) ? value : "mint-clinical";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("pomr-coach-theme", nextTheme);
  }

  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-xs font-medium text-app-text-muted">
        <MonitorCog className="h-3.5 w-3.5" />
        Theme
      </span>
      <Select
        ref={selectRef}
        defaultValue="mint-clinical"
        onChange={(event) => updateTheme(event.target.value)}
        className="h-8 text-xs"
      >
        {themes.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </Select>
    </label>
  );
}

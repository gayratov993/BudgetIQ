"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { dictionaries, isLocale, LOCALES } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, d, setLocale } = useI18n();

  return (
    <div
      className={cn(
        "relative inline-flex h-8 items-center rounded-lg border border-border bg-card text-xs",
        className,
      )}
    >
      <Globe className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-muted-foreground" />
      <select
        value={locale}
        onChange={(event) => {
          if (isLocale(event.target.value)) setLocale(event.target.value);
        }}
        aria-label={d.languageLabel}
        title={d.languageLabel}
        className="h-full cursor-pointer appearance-none bg-transparent pl-7 pr-6 font-medium text-foreground outline-none"
      >
        {LOCALES.map((item) => (
          <option key={item} value={item}>
            {dictionaries[item].language}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 text-[9px] text-muted-foreground">▾</span>
    </div>
  );
}

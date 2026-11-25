"use client";

import Link from "next/link";
import { Brand } from "@/components/brand";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/components/i18n-provider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { d } = useI18n();

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <header className="flex h-16 items-center justify-between px-5 lg:px-10">
        <Link href="/">
          <Brand />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="pb-6 text-center text-[11px] text-muted-foreground">
        {d.auth.footer}
      </footer>
    </div>
  );
}

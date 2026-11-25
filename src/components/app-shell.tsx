"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  Bot,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  PieChart,
  ReceiptText,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { LOCALE_TAGS } from "@/lib/i18n";
import { cn, initials } from "@/lib/utils";

export function AppShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { d, locale } = useI18n();
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/dashboard", label: d.nav.dashboard, icon: LayoutDashboard },
    { href: "/transactions", label: d.nav.transactions, icon: ReceiptText },
    { href: "/budgets", label: d.nav.budgets, icon: PieChart },
    { href: "/ai-advisor", label: d.nav.advisor, icon: Bot },
    { href: "/settings", label: d.nav.settings, icon: Settings },
  ];

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between px-2 pt-1">
        <Link href="/dashboard" onClick={() => setOpen(false)}>
          <Brand className="text-white" />
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-sidebar-muted hover:bg-white/10 hover:text-white lg:hidden"
          aria-label={d.nav.closeMenu}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-sidebar-muted hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon className="h-4.5 w-4.5" />
              <span>{item.label}</span>
              {active ? <ChevronRight className="ml-auto h-3.5 w-3.5" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5">
          <div className="flex items-center gap-2 text-emerald-300">
            <Sparkles className="h-4 w-4" />
            <p className="text-xs font-semibold">{d.nav.aiCardTitle}</p>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-emerald-100/70">
            {d.nav.aiCardBody}
          </p>
          <Link
            href="/ai-advisor"
            onClick={() => setOpen(false)}
            className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-emerald-200"
          >
            {d.nav.aiCardCta} <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-200">
            {initials(user.name ?? user.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white">
              {user.name ?? d.common.user}
            </p>
            <p className="truncate text-[10px] text-sidebar-muted">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-lg p-1.5 text-sidebar-muted transition hover:bg-white/10 hover:text-white"
            aria-label={d.nav.logout}
            title={d.nav.logout}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-white/5 bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0">
        {sidebar}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-64 animate-fade-in border-r border-white/5 bg-sidebar text-sidebar-foreground">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-md lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label={d.nav.openMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/dashboard" className="lg:hidden">
            <Brand compact />
          </Link>
          <div className="hidden text-xs text-muted-foreground lg:block">
            {new Date().toLocaleDateString(LOCALE_TAGS[locale], {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
              {initials(user.name ?? user.email)}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

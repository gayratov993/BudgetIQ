"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { Brand } from "@/components/brand";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { d } = useI18n();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <Brand className="mb-8" />
      <p className="num text-6xl font-semibold tracking-tight text-emerald-500">404</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">{d.common.notFoundTitle}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{d.common.notFoundBody}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <Button>
            <Compass className="h-4 w-4" /> {d.common.home}
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">{d.nav.dashboard}</Button>
        </Link>
      </div>
    </div>
  );
}

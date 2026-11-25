"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Brand } from "@/components/brand";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { d } = useI18n();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <Brand className="mb-8" />
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">{d.common.errorTitle}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{d.common.errorBody}</p>
      {error.digest ? (
        <p className="mt-2 text-[11px] text-muted-foreground/70">ID: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>
          <RotateCcw className="h-4 w-4" /> {d.common.retry}
        </Button>
        <Link href="/">
          <Button variant="outline">{d.common.home}</Button>
        </Link>
      </div>
    </div>
  );
}

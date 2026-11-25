import { cn } from "@/lib/utils";

export function Brand({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-950" fill="none" aria-hidden>
          <path
            d="M4 15.5 9 10l3.4 3.4L20 5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.5 5H20v4.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact ? (
        <span className="text-[17px] font-semibold tracking-tight">
          Budget<span className="text-primary">IQ</span>
        </span>
      ) : null}
    </span>
  );
}

import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  color,
}: {
  value: number;
  className?: string;
  color?: string;
}) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${safe}%`,
          backgroundColor: color ?? (safe >= 100 ? "#e11d48" : safe >= 80 ? "#f59e0b" : "var(--primary)"),
        }}
      />
    </div>
  );
}

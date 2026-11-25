"use client";

import { create } from "zustand";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastStore = {
  toasts: ToastItem[];
  push: (item: ToastItem) => void;
  dismiss: (id: number) => void;
};

let counter = 0;

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (item) => set((state) => ({ toasts: [...state.toasts, item].slice(-4) })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function toast(input: { title: string; description?: string; tone?: ToastTone }) {
  const id = ++counter;
  useToastStore.getState().push({
    id,
    title: input.title,
    description: input.description,
    tone: input.tone ?? "success",
  });
  setTimeout(() => useToastStore.getState().dismiss(id), 4500);
}

const toneStyles: Record<ToastTone, string> = {
  success: "text-emerald-500",
  error: "text-rose-500",
  info: "text-sky-500",
};

const toneIcon = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end">
      {toasts.map((item) => {
        const Icon = toneIcon[item.tone];
        return (
          <div
            key={item.id}
            className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-lg"
          >
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", toneStyles[item.tone])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.title}</p>
              {item.description ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              ) : null}
            </div>
            <button
              onClick={() => dismiss(item.id)}
              className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Yopish"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
